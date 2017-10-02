/**
 * Assignment entry.
 */
class Entry {
  /**
   * Initializes the entry.
   * @param  {Element} el The entry dom element.
   */
  constructor(el) {
    this.el = el;
    this.btDelete = el.querySelector('.entry__delete-bt');
    this.btDelete.addEventListener(
        'click', this.onDeleteClicked.bind(this), false);
  }

  /**
   * Click on delete button handler.
   * @param  {MouseEvent} ev The mouse event.
   */
  onDeleteClicked(ev) {
    ev.preventDefault();
    let id = this.el.dataset['id'];
    let entries;
    let isAssignment = false;
    if (this.el.classList.contains('is-assignment')) {
      entries = assignment.assignmentEntries;
      isAssignment = true;
    } else {
      entries = assignment.entries;
    }
    // Remove from array.
    let index = -1;
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].id == id) {
        index = i;
        break;
      }
    }
    if (index == -1) {
      throw new Error('could not find entry ' + id);
    }
    entries.splice(index, 1);
    // Inform data update.
    if (isAssignment) {
      updateAssignmentEntries();
    } else {
      updateEntries();
    }
  }
}
