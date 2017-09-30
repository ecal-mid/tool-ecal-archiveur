from flask import current_app
import yaml

# Load configuration file.
CONFIG_FILE = 'config/prod.yaml'
if current_app.debug:
    CONFIG_FILE = 'config/dev.yaml'

config = yaml.load(open(CONFIG_FILE))
