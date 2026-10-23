'use strict';
function searchNotes(notes, query) {
  const needle = query.trim().toLowerCase();
  return notes.map(note => ({ ...note, title: note.title.toLowerCase() }))
    .filter(note => note.title.includes(needle));
}
module.exports = { searchNotes };
