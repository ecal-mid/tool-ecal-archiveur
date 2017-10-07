""" API """

from flask import (Blueprint, request, current_app)
from flask_uploads import (UploadSet, configure_uploads, UploadNotAllowed)
import flask_login
import os
import json
import login
from .config import config

bp = Blueprint('api', __name__, url_prefix='/api')

uploaded_files = UploadSet('uploads', ('zip', 'pdf', 'jpg', 'png', 'mov'))


def setup():
    configure_uploads(current_app, uploaded_files)


@bp.route('/upload', methods=['POST'])
def upload():
    """Upload a file."""
    if 'file' in request.files:
        rfile = request.files['file']
        try:
            folder = request.form.get('path')
            result_filename = uploaded_files.save(rfile, folder=folder)
            url = uploaded_files.url(result_filename)
            return json.dumps({'success': True, 'url': url})
        except UploadNotAllowed as err:
            ext = os.path.splitext(rfile.filename)[1][1:]
            return json.dumps({'error': '{} file not allowed'.format(ext)})
    return json.dumps({'error': 'Missing img parameter.'})


@bp.route('/a/<year>/<assignment_id>')
def get_assignment(year, assignment_id):
    """Return assignment data."""
    full_path = os.path.join(config['root_path'], 'assignments', year,
                             assignment_id + '.json')
    if os.path.exists(full_path):
        return open(full_path).read()
    else:
        return json.dumps({'error': 404})


@bp.route('/a/<year>/<assignment_id>', methods=['POST'])
@flask_login.login_required
def update_assignment(year, assignment_id):
    """Creates a new assignment."""
    user = login.get_current_user_infos()
    # Look if user is admin
    is_admin = user['id'] in config['admins']
    if not is_admin:
        return redirect('/a/' + year)
    # Load the dest assignment
    full_path = os.path.join(config['root_path'], 'assignments', year,
                             assignment_id + '.json')
    assignment = json.load(open(full_path))
    assignment[year][assignment_id] = request.get_json()
    json.dump(assignment, open(full_path, 'w'), indent=2)
    return json.dumps({'status': 'success.'})
