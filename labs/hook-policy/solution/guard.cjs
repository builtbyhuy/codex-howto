'use strict';
// Reference solution: baseline rules plus generated/ at the practice-root boundary.
const baseline = require('../guard.cjs');
const evaluate = event => baseline.evaluate(event,{protectGenerated:true});
if (require.main === module) baseline.run({protectGenerated:true});
module.exports = {evaluate};

