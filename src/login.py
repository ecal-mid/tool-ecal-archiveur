from flask import (Blueprint, request, redirect, current_app, url_for,
                   render_template)
import flask_login
import ldap3
import yaml
from .config import config

bp = Blueprint('login', __name__)

# Login Manager
login_manager = flask_login.LoginManager()
ldap_server = ldap3.Server(config['ldap_server'], get_info=ldap3.ALL)


def setup():
    login_manager.init_app(current_app)


# silly user model
class User(flask_login.UserMixin):
    pass


def get_current_user_infos():
    infos = config['users'][flask_login.current_user.id]
    url = config['users_img_prefix'] + '/' + infos['img']
    return {
        'name': infos['name'],
        'img': url,
        'id': flask_login.current_user.id
    }


@login_manager.user_loader
def user_loader(user_id):
    if user_id is None:
        return
    user = User()
    user.id = user_id
    return user


@login_manager.request_loader
def request_loader(request):
    user_id = request.form.get('id')
    user = user_loader(user_id)
    if user is None:
        return None
    try:
        conn = ldap3.Connection(
            ldap_server,
            'ade\\' + user_id,
            request.form.get('pw'),
            auto_bind=True)
        return user
    except ldap3.core.exceptions.LDAPBindError as e:
        print(e)
        return None


@bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')

    user = request_loader(request)
    if user is not None:
        flask_login.login_user(user)
        return redirect(url_for('index.index'))
    return render_template('login.html', error='Invalid login/password.')


@bp.route('/logout')
def logout():
    flask_login.logout_user()
    return redirect(url_for('index.index'))


@login_manager.unauthorized_handler
def unauthorized_handler():
    return redirect(url_for('login.login'))
