class Assignment {
  constructor() {
    this.data = null;
    this.el = document.createElement('div');
    this.el.classList.add('assignment');
    this.user = {
      id: document.body.dataset['userId'],
      img: document.body.querySelector('.avatar img').src,
    };
    this.tpls = {};
    for (let tpl of ['assignment-tpl', 'entry-tpl', 'new-entry-tpl']) {
      this.tpls[tpl] = document.getElementById(tpl).innerHTML;
    }
  }

  render(data, docId, groupId) {
    this.data = data;
    let processed = this.preprocess(data, docId, groupId);
    // Compile templates recursively
    let fn = ejs.compile(this.tpls['assignment-tpl'], {client: true});
    let html = fn(processed, null, (path, d) => {
      let pTplData = this.preprocessTemplateData(path, processed, d, groupId);
      if (pTplData) {
        return ejs.render(this.tpls[path], pTplData);
      }
    });
    this.el.innerHTML = html;
    // returns rendered string
    let formEls = this.el.querySelectorAll('.box');
    for (let el of formEls) {
      let uploadBox = new UploadBox(el);
    }
  }

  preprocess(data, docId, groupId) {
    let user = this.user;
    // Build a dictionnary with details of all active users details
    let users = {};
    for (let u of data.assignment.admins) {
      users[u.id] = u;
      users[u.id].is_admin = true;
    }
    for (let g of data.assignment.groups) {
      if (Array.isArray(g)) {
        for (let u of g) {
          users[u.id] = u;
        }
      } else {
        users[g.id] = g;
      }
    }
    // Better date formatting.
    let due =
        new Date(data.assignment['due-date']).toISOString().substring(0, 10);
    // Return our processed data object
    return {
      assignment: data.assignment,
      entries: data.entries,
      user: user,
      users: users,
      due: due,
    };
  }

  preprocessTemplateData(tpl, processed, data, groupId) {
    switch (tpl) {
      case 'entry-tpl':
        if (groupId && data.entry.group != groupId && !data.is_assignment) {
          return;
        }
        // Date
        let date = new Date(data.entry.date).toISOString().substring(0, 10);
        let classes = [];
        let result = {
          entry: data.entry,
          date: date,
          classes: classes,
          user: processed.users[data.entry.user],
        };
        // Status
        classes.push(data.entry.status);
        if (result.user.id == this.user.id) {
          classes.push('entry-editable');
        }
        if (result.user.is_admin) {
          classes.push('admin-entry');
        }
        if (data.entry.file) {
          result.filename =
              data.entry.file.substr(data.entry.file.lastIndexOf('/') + 1);
          classes.push('file-entry');
        }
        return result;
      default:
    }
    return data;
  }

  remove() {
    this.el.remove();
  }
}
