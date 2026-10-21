'use strict';
function searchNotes(notes, query) {
  // Intentional exercise defect: matching should ignore case and outer spaces.
  return notes.filter(note => note.title.includes(query));
}
module.exports = { searchNotes };
