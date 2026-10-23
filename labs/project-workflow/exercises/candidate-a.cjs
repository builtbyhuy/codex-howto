'use strict';
function searchNotes(notes, query) {
  const needle = query.trim().toLowerCase();
  return notes.filter(note => note.title.toLowerCase().includes(needle));
}
module.exports = { searchNotes };
