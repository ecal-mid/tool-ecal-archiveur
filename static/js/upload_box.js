/**
 * Class that manages uploads.
 */
class UploadBox {
  /**
   * Constructor.
   * @param  {Element} el The dom element that will contain the uploader.
   */
  constructor(el) {
    this.el = el;
    this.droppedFiles = null;
    this.isAdvancedUpload = isAdvancedUploadSupported();
    this.errorEl = el.querySelector('.box__error');
    if (this.isAdvancedUpload) {
      this.el.classList.add('has-advanced-upload');
    }
    for (let ev of ['dragover', 'dragenter']) {
      this.el.addEventListener(ev, this.dragEnter.bind(this), false);
    }
    for (let ev of ['dragleave', 'dragend', 'drop']) {
      this.el.addEventListener(ev, this.dragLeave.bind(this), false);
    }
    this.el.addEventListener('drop', this.drop.bind(this), false);
    this.el.addEventListener('submit', this.submitForm.bind(this), false);
    // Select file on box click
    this.el.addEventListener('click', () => {
      this.el.querySelector('input.box__file').click();
    }, false);
    // Detect input change.
    this.inputEl = this.el.querySelector('input.box__file');
    this.inputEl.addEventListener('change', this.submitForm.bind(this), false);
  }

  /**
   * Shortcut to disable event defaults.
   * @param  {event} ev event
   */
  disableDefault(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }

  /**
   * Handles drag enter event.
   * @param  {event} ev event
   */
  dragEnter(ev) {
    this.disableDefault(ev);
    this.el.classList.add('is-dragover');
  }

  /**
   * Handles drag leave event.
   * @param  {event} ev event
   */
  dragLeave(ev) {
    this.disableDefault(ev);
    this.el.classList.remove('is-dragover');
  }

  /**
   * Handles drop event.
   * @param  {event} ev event
   */
  drop(ev) {
    this.disableDefault(ev);
    this.droppedFiles = ev.dataTransfer.files;
    this.submitForm();
  }

  /**
   * Submit form data to backend.
   */
  submitForm() {
    if (this.el.classList.contains('is-uploading')) {
      return;
    }
    this.el.classList.add('is-uploading');
    this.el.classList.remove('is-error');

    if (this.isAdvancedUpload) {
      let data = new FormData(this.el);
      if (data.get('file').name == '') {
        if (this.droppedFiles) {
          data.set('file', this.droppedFiles[0]);
        } else {
          let err = new Error('No file selected.');
          this.onFileUploadError(err);
        }
      }

      api.upload(data)
          .then(this.onFileUploaded.bind(this))
          .catch(this.onFileUploadError.bind(this));
    } else {
      // ajax for legacy browsers
    }
  }

  /**
   * Resets the upload widget.
   */
  reset() {
    this.droppedFiles = null;
    this.el.classList.remove('is-uploading');
    this.inputEl.value = '';
  }

  /**
   * Callback for fileupload completion.
   * @param  {Object} response The backend response.
   */
  onFileUploaded(response) {
    this.reset();
    if (response.error) {
      this.onFileUploadError(response.error);
    };

    if (!response.success) {
      return;
    }

    // Create Entry if upload was successful
    let entry = {
      'id': generateGUUID(),
      'user': assignment.user.id,
      'date': new Date().toString(),
      'file': response.url,
    };
    if (this.el.classList.contains('is-assignment')) {
      assignment.data.assignment.entries.push(entry);
    } else {
      entry.group = assignment.groupId;
      assignment.data.entries.push(entry);
    }
    assignment.onDataUpdate(assignment.data);
  }

  /**
   * Handler for upload errors.
   * @param  {error} error The upload error.
   */
  onFileUploadError(error) {
    this.el.classList.remove('is-uploading');
    this.el.classList.add('is-error');
    this.errorEl.innerText = error;
  }
}
