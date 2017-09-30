class UploadBox {
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

  disableDefault(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }

  dragEnter(ev) {
    this.disableDefault(ev);
    this.el.classList.add('is-dragover');
  }

  dragLeave(ev) {
    this.disableDefault(ev);
    this.el.classList.remove('is-dragover');
  }

  drop(ev) {
    this.disableDefault(ev);
    this.droppedFiles = ev.dataTransfer.files;
    this.submitForm();
  }

  submitForm() {
    if (this.el.classList.contains('is-uploading')) {
      return false;
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

  reset() {
    this.droppedFiles = null;
    this.el.classList.remove('is-uploading');
    this.inputEl.value = '';
  }

  onFileUploaded(response) {
    this.reset();
    if (response.error) {
      this.onFileUploadError(response.error);
    }
  }

  onFileUploadError(error) {
    this.el.classList.remove('is-uploading');
    this.el.classList.add('is-error');
    this.errorEl.innerText = error;
  }
}
