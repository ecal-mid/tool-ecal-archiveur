""" Main """

from flask import Blueprint, render_template
import flask_login
import login

bp = Blueprint(
    'index',
    __name__,
    static_folder='../static',
    template_folder='../templates')


@bp.route('/a/<year>/<assignment_id>')
@bp.route('/a/<year>/<assignment_id>/<group_id>')
@flask_login.login_required
def assignment(year, assignment_id, group_id=None):
    """Return a specific assignment."""
    user = login.get_current_user_infos()
    return render_template(
        'index.html',
        year=year,
        user=user,
        assignment=assignment_id,
        group=group_id)


@bp.route('/')
@flask_login.login_required
def index():
    """Return the homepage."""
    user = login.get_current_user_infos()
    return render_template('index.html', user=user)
