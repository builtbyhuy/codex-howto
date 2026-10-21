'use strict';
const fs = require('node:fs');

const EXIT = Object.freeze({ completed: 0, failed: 2, invalid: 3, incomplete: 4, producer: 5, usage: 6 });
const MAX_BYTES = 1024 * 1024;

function consumeJsonl(text, { producerExitCode, producerSignal = null } = {}) {
  if (!Number.isInteger(producerExitCode) && producerSignal === null) {
    throw new TypeError('Pass the actual producerExitCode; do not infer it from the last event.');
  }
  const report = { outcome: 'incomplete', exitCode: EXIT.incomplete, producerExitCode, producerSignal,
    threadId: null, eventCount: 0, turnCount: 0, completedTurns: 0, finalMessage: '', usage: null,
    unknownEvents: [], commandFailures: [], errors: [], warning: 'A completed agent turn is not proof of factual correctness or accepted delivery.' };
  if (Buffer.byteLength(text, 'utf8') > MAX_BYTES) {
    report.errors.push('Input exceeds the 1 MiB teaching-lab limit.');
    report.outcome = 'invalid'; report.exitCode = EXIT.invalid; return report;
  }
  let current = null;
  function invalid(message) { report.errors.push(message); report.outcome = 'invalid'; report.exitCode = EXIT.invalid; }
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    if (!lines[index].trim()) continue;
    let event;
    try { event = JSON.parse(lines[index]); } catch { invalid(`Line ${index + 1}: malformed JSON.`); break; }
    if (!event || Array.isArray(event) || typeof event !== 'object' || typeof event.type !== 'string') {
      invalid(`Line ${index + 1}: expected an event object with a string type.`); break;
    }
    report.eventCount++;
    switch (event.type) {
      case 'thread.started':
        if (typeof event.thread_id !== 'string' || !event.thread_id || report.threadId !== null) {
          invalid(`Line ${index + 1}: missing or duplicate thread identifier.`); break;
        }
        report.threadId = event.thread_id; break;
      case 'turn.started':
        if (!report.threadId || current?.status === 'running') { invalid(`Line ${index + 1}: invalid turn start order.`); break; }
        current = { status: 'running', messages: [] }; report.turnCount++;
        // A new turn invalidates an older final answer until this turn completes.
        report.finalMessage = ''; report.usage = null; break;
      case 'item.started':
      case 'item.updated':
      case 'item.completed': {
        if (!current || current.status !== 'running' || !event.item || typeof event.item.type !== 'string') {
          invalid(`Line ${index + 1}: item has no active turn or valid item type.`); break;
        }
        if (event.type !== 'item.completed') break;
        if (event.item.type === 'agent_message') {
          if (typeof event.item.text !== 'string') { invalid(`Line ${index + 1}: agent message text is missing.`); break; }
          current.messages.push(event.item.text);
        }
        if (event.item.type === 'command_execution' && (event.item.status === 'failed' || (Number.isInteger(event.item.exit_code) && event.item.exit_code !== 0))) {
          report.commandFailures.push({ command: event.item.command || '(command unavailable)', exitCode: event.item.exit_code ?? null });
        }
        break;
      }
      case 'turn.completed':
        if (!current || current.status !== 'running') { invalid(`Line ${index + 1}: completion has no running turn.`); break; }
        if (!event.usage || !Number.isFinite(event.usage.input_tokens) || !Number.isFinite(event.usage.output_tokens)) {
          invalid(`Line ${index + 1}: completion usage is invalid.`); break;
        }
        current.status = 'completed'; report.completedTurns++;
        report.finalMessage = current.messages.at(-1) || ''; report.usage = event.usage; break;
      case 'turn.failed':
        if (!current || current.status !== 'running' || typeof event.error?.message !== 'string') {
          invalid(`Line ${index + 1}: malformed failed-turn event.`); break;
        }
        current.status = 'failed'; report.errors.push(event.error.message); break;
      case 'error':
        if (typeof event.message !== 'string') { invalid(`Line ${index + 1}: error message is missing.`); break; }
        report.errors.push(event.message); if (current) current.status = 'failed'; break;
      default:
        // Future event names are recorded, never executed or treated as completion.
        if (!report.unknownEvents.includes(event.type)) report.unknownEvents.push(event.type);
    }
    if (report.outcome === 'invalid') break;
  }
  if (producerSignal || producerExitCode !== 0) {
    report.outcome = 'producer'; report.exitCode = EXIT.producer;
    report.errors.push(producerSignal ? `Producer ended by signal ${producerSignal}.` : `Producer exited ${producerExitCode}.`);
  } else if (report.outcome === 'invalid') {
    // The line-numbered parse or shape error above remains the reason.
  } else if (report.errors.length) {
    report.outcome = 'failed'; report.exitCode = EXIT.failed;
  } else if (!report.threadId || current?.status !== 'completed' || !report.finalMessage.trim()) {
    report.outcome = 'incomplete'; report.exitCode = EXIT.incomplete;
    report.errors.push('Missing a completed final turn with an agent message.');
  } else {
    report.outcome = 'completed'; report.exitCode = EXIT.completed;
  }
  return report;
}

function markdown(report) {
  const lines = ['# Codex event report', '', `Outcome: ${report.outcome}`, `Producer exit: ${report.producerExitCode ?? 'signal'}`,
    `Events: ${report.eventCount}`, `Turns completed: ${report.completedTurns}/${report.turnCount}`, '', '## Final message', '',
    report.finalMessage || '(No accepted final message.)', '', '## Diagnostics', ''];
  if (!report.errors.length) lines.push('- No transport/lifecycle error found.');
  for (const message of report.errors) lines.push(`- ${message}`);
  for (const command of report.commandFailures) lines.push(`- Command failure observed: ${command.command} (exit ${command.exitCode ?? 'unknown'}). Inspect whether it was resolved.`);
  if (report.unknownEvents.length) lines.push(`- Unrecognized event names: ${report.unknownEvents.join(', ')}.`);
  lines.push('', report.warning, '');
  return lines.join('\n');
}

function cli(argv = process.argv.slice(2)) {
  const [file, flag, value, format = '--markdown'] = argv;
  if (!file || flag !== '--producer-exit' || !/^-?\d+$/.test(value || '') || !['--markdown', '--json'].includes(format) || argv.length > 4) {
    process.stderr.write('Usage: node report.cjs <events.jsonl|-> --producer-exit <actual-code> [--markdown|--json]\n');
    return EXIT.usage;
  }
  try {
    const text = fs.readFileSync(file === '-' ? 0 : file, 'utf8');
    const report = consumeJsonl(text, { producerExitCode: Number(value) });
    process.stdout.write(format === '--json' ? JSON.stringify(report, null, 2) + '\n' : markdown(report));
    return report.exitCode;
  } catch (error) { process.stderr.write(`Cannot read events: ${error.message}\n`); return EXIT.usage; }
}
if (require.main === module) process.exitCode = cli();
module.exports = { consumeJsonl, markdown, EXIT, MAX_BYTES };
