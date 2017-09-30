""" Main """

from flask import Blueprint, render_template

bp = Blueprint(
    'index',
    __name__,
    static_folder='../static',
    template_folder='../templates')


@bp.route('/')
def hello():
    """Return the homepage."""
    return render_template('index.html', year='2017-2018')
