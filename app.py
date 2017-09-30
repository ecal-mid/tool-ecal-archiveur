from flask import Flask

from src import main, api
import yaml

app = Flask(__name__)

# Load configuration file.
CONFIG_FILE = 'config/prod.yaml'
if app.debug:
    CONFIG_FILE = 'config/dev.yaml'

config = yaml.load(open(CONFIG_FILE))

app.config['ROOT_PATH'] = config['root_path']
app.config['UPLOADS_DEFAULT_DEST'] = config['root_path']
app.config['UPLOADS_DEFAULT_URL'] = config['nginx_url']

# Initialises app's Blueprints
app.register_blueprint(api.bp)
app.register_blueprint(main.bp)

with app.app_context():
    api.setup()
