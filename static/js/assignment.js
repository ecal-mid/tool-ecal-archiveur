class Assignment {
  constructor() {
    this.el = document.createElement('div');
    this.el.classList.add('assignment');
    this.tpls = {};
    for (let tpl of ['assignment-tpl', 'entry-tpl', 'upload_box-tpl']) {
      this.tpls[tpl] = document.getElementById(tpl).innerHTML;
    }
  }

  render(data) {
    // TODO: move this in preprocess
    data.assignment['due-date'] =
        new Date(data.assignment['due-date']).toISOString().substring(0, 10);
    // Compite templates recursively
    let fn = ejs.compile(this.tpls['assignment-tpl'], {client: true});
    let html = fn(data, null, (path, d) => {
      this.preprocess(path, d);
      return ejs.render(this.tpls[path], d);
    });
    this.el.innerHTML = html;
    // returns rendered string
    this.uploadBox = new UploadBox(this.el.querySelector('.box'));
  }

  preprocess(tpl, data) {
    switch (tpl) {
      case 'entry-tpl':
        data.entry.date =
            new Date(data.entry.date).toISOString().substring(0, 10);
        data.entry.classes = [];
        data.entry.classes.push(data.entry.status);
        if (data.entry.user.id == data.assignment.creator) {
          data.entry.classes.push('admin-entry');
        }
        if (data.entry.file) {
          data.entry.filename =
              data.entry.file.substr(data.entry.file.lastIndexOf('/') + 1);
          data.entry.classes.push('file-entry');
        }
        break;
      default:
    }
  }
}
