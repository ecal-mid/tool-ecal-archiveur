""" Main """

from flask import Blueprint, render_template, url_for, redirect
import flask_login
import login
import os
from .config import config

bp = Blueprint(
    'index',
    __name__,
    static_folder='../static',
    template_folder='../templates')


@bp.route('/a/<year>')
@bp.route('/a/<year>/<assignment_id>')
@bp.route('/a/<year>/<assignment_id>/<group_id>')
@flask_login.login_required
def assignment(year, assignment_id=None, group_id=None):
    """Return a specific assignment."""
    user = login.get_current_user_infos()
    if group_id is None:
        group_id = 0
    full_path = os.path.join(config['root_path'], 'assignments', year)
    assignments = os.listdir(full_path)
    return render_template(
        'index.html',
        year=year,
        user=user,
        assignment=assignment_id,
        group=group_id,
        assignments=assignments)


@bp.route('/')
@flask_login.login_required
def index():
    """Return the homepage."""
    # user = login.get_current_user_infos()
    return redirect('/a/2017-2018')
    # return render_template('index.html', user=user, year='2017-2018')
