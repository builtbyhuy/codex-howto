'use strict';
const notes = require('./notes.json');
const { searchNotes } = require('./notes.cjs');
for (const note of searchNotes(notes, process.argv[2] || '')) console.log(`${note.id}: ${note.title}`);
