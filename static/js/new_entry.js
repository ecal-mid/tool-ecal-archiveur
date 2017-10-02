/**
 * Assignment new entry form.
 */
class NewEntry {
  /**
   * Initializes the entry.
   * @param  {Element} el The entry dom element.
   */
  constructor(el) {
    this.el = el;
    this.bt = el.querySelector('.entry__send-text');
    this.bt.addEventListener('click', this.onBtClicked.bind(this), false);
    this.input = el.querySelector('.new-entry-text');
    this.input.addEventListener('keypress', this.onInputKey.bind(this), false);
  }

  /**
   * Click handler.
   * @param  {MouseEvent} ev The mouse event.
   */
  onBtClicked(ev) {
    if (ev) {
      ev.preventDefault();
    }
    if (!this.input.value) {
      return;
    }
    let entry = {
      'id': generateGUUID(),
      'user': assignment.user.id,
      'date': new Date().toString(),
      'text': this.input.value,
    };
    if (document.body.dataset['admin']) {
      entry.is_admin = true;
    }
    if (this.el.classList.contains('is-assignment')) {
      entry.is_assignment = true;
      // assignment.data.assignment.entries.push(entry);
    } else {
      entry.group = assignment.groupId;
      // assignment.data.entries.push(entry);
    }
    // assignment.onDataUpdate(assignment.data);
    // pushData();
    pushEntry(entry);
    this.input.value = '';
  }

  /**
   * Handle keys.
   * @param  {KeyboardEvent} ev Event.
   */
  onInputKey(ev) {
    if (ev.key == 'Enter') {
      this.onBtClicked();
    }
  }
}
