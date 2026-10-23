'use strict';
function normalizeStatus(value) {
 if(typeof value!=='string')throw new TypeError('status must be a string');
 const normalized=value.trim().toLowerCase();
 if(!['open','done','blocked'].includes(normalized))throw new RangeError('unsupported status');
 return normalized;
}
module.exports={normalizeStatus};


