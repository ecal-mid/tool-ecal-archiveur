""" API """

from flask import (Blueprint, request, current_app)
from flask_uploads import (UploadSet, configure_uploads, UploadNotAllowed)
import os
import json

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
            result_filename = uploaded_files.save(rfile, folder='test')
            url = uploaded_files.url(result_filename)
            return json.dumps({'success': True, 'url': url})
        except UploadNotAllowed as err:
            ext = os.path.splitext(rfile.filename)[1][1:]
            return json.dumps({'error': '{} file not allowed'.format(ext)})
    return json.dumps({'error': 'Missing img parameter.'})


@bp.route('/ls')
def ls():
    """List a directory."""
    return json.dumps(os.listdir(ROOT_PATH))


@bp.route('/ls/<path>')
def ls_path(path):
    """List a directory."""
    full_path = os.path.join(ROOT_PATH, path)
    if os.path.exists(full_path):
        return json.dumps(os.listdir(full_path))
    else:
        return json.dumps({'error': 404})
