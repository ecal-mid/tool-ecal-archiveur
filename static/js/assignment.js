class Assignment {
  constructor(data, groupId) {
    this.groupId = groupId;
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
    this.data.users = {};
    for (let u of this.data.assignment.admins) {
      this.data.users[u.id] = u;
      this.data.users[u.id].is_admin = true;
    }
    for (let g of this.data.assignment.groups) {
      if (Array.isArray(g)) {
        for (let u of g) {
          this.data.users[u.id] = u;
        }
      } else {
        this.data.users[g.id] = g;
      }
    }
    // TODO: move this in preprocess
    this.data.assignment['due-date'] =
        new Date(this.data.assignment['due-date'])
            .toISOString()
            .substring(0, 10);
    // Compite templates recursively
    let fn = ejs.compile(this.tpls['assignment-tpl'], {client: true});
    let html = fn(this.data, null, (path, d) => {
      if (this.preprocess(path, d)) {
        return ejs.render(this.tpls[path], d);
      };
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
        if (this.groupId && data.entry.group != this.groupId &&
            !data.is_assignment) {
          return false;
        }
        // Date
        data.entry.date =
            new Date(data.entry.date).toISOString().substring(0, 10);
        data.entry.classes = [];
        // Status
        data.entry.classes.push(data.entry.status);
        // User
        data.entry.user = this.data.users[data.entry.user];
        if (data.entry.user.id == this.user.id) {
          data.entry.classes.push('entry-editable');
        }
        if (data.entry.user.is_admin) {
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
    return true;
  }
}
