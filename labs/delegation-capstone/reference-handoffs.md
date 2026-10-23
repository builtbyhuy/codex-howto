# Worked handoffs
## A — normalization
File: starter/normalize.cjs. Added a string type check, trim/lowercase normalization and allowed-value validation. Expected examples: " DONE " -> "done"; " OPEN " -> "open"; null -> TypeError; "later" -> RangeError. The reference solution demonstrates these outcomes in capstone.test.cjs. This document is authored reference material, not a live worker transcript.
## B — report
File: starter/report.cjs. Validate input records/unique IDs; count normalized completed tasks and sum only their minutes. Fixture-independent check: [{id:"x",status:"open",minutes:90},{id:"y",status:"done",minutes:5}] -> {total:2,done:1,doneMinutes:5}. No normalization belongs in this module.
## Integrator
Wait for A and B. Read their diff; run the combined candidate, boundary cases, and source-preservation check. Supplied reference solution yields total 4, done 2, doneMinutes 55. A's passing isolated case cannot establish B's aggregation or the combined result.
## Fault-injection exercise
Give the integrator a handoff saying all tests passed while leaving B's original implementation in place. The integrated result is wrong even if the message sounds convincing. Reject it using code/check evidence.


