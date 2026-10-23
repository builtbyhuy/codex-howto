# Frozen interface before delegation
## normalizeStatus(value)
Input: a string. Trim surrounding whitespace and lowercase it. Output exactly open, done, or blocked. Non-string input throws TypeError; unknown normalized values throw RangeError. It has no file access or side effects.
## buildReport(tasks)
Input: an array of objects {id:string,status:'open'|'done'|'blocked',minutes:number}. IDs must be unique; minutes must be finite and nonnegative. Invalid records throw TypeError. Output {total,done,doneMinutes}, where completed status is done. Preserve input array and objects. This function must not normalize strings; that belongs to A.
## Integration
run.cjs owns loading, copying and composing the two modules. Neither worker owns it. With the supplied fixture the report is {total:4,done:2,doneMinutes:55}. The starter intentionally violates normalization and completed-only effort.
## Ownership and handoffs
A and B can operate independently because B receives normalized inputs by contract. Their integration waits for both. A shared checkout is acceptable only with disjoint ownership; worktrees are optional and must be created/verified explicitly for actual isolation. The optional worktree-demo.cjs creates and checks real temporary Git worktrees; it spawns no agents. Real agent coordination requires the separate native-client observations in native-agent-guide.md.
A useful handoff names the file, change, observed checks, unresolved issue and next dependency. Status "done" without code evidence is insufficient.


