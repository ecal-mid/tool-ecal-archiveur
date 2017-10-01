class Assignment {
  constructor(data) {
    this.el = document.createElement('div');
    this.el.classList.add('assignment');
    this.data = data;
    this.user = {
      id: document.body.dataset['userId'],
      img: document.body.querySelector('.avatar img').src,
    };
    this.tpls = {};
    for (let tpl of ['assignment-tpl', 'entry-tpl', 'new-entry-tpl']) {
      this.tpls[tpl] = document.getElementById(tpl).innerHTML;
    }
  }

  render() {
    this.data.user = this.user;
    // TODO: move this in preprocess
    this.data.assignment['due-date'] =
        new Date(this.data.assignment['due-date'])
            .toISOString()
            .substring(0, 10);
    // Compite templates recursively
    let fn = ejs.compile(this.tpls['assignment-tpl'], {client: true});
    let html = fn(this.data, null, (path, d) => {
      this.preprocess(path, d);
      return ejs.render(this.tpls[path], d);
    });
    this.el.innerHTML = html;
    // returns rendered string
    let formEls = this.el.querySelectorAll('.box');
    for (let el of formEls) {
      let uploadBox = new UploadBox(el);
    }
  }

  preprocess(tpl, data) {
    switch (tpl) {
      case 'entry-tpl':
        data.entry.date =
            new Date(data.entry.date).toISOString().substring(0, 10);
        data.entry.classes = [];
        data.entry.classes.push(data.entry.status);
        if (data.entry.user.id == this.user.id) {
          data.entry.classes.push('entry-editable');
        }
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
