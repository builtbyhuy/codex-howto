'use strict';
// Editable exercise candidate. Keep guard.cjs and test.cjs as the frozen baseline.
const baseline = require('./guard.cjs');
function evaluate(event) {
  const result = baseline.evaluate(event);
  // TODO: deny a root-level generated/ target after the baseline has allowed it.
  // Preserve baseline deny/invalid/irrelevant outcomes and allow src/generated-helper.js.
  return result;
}
module.exports = {evaluate};
