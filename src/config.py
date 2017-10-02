from flask import current_app
import yaml
import os
import json

# Load configuration file.
CONFIG_FILE = 'config/prod.yaml'
if current_app.debug:
    CONFIG_FILE = 'config/dev.yaml'

config = yaml.load(open(CONFIG_FILE))


def load_users_assignments_access(year):
    full_path = os.path.join(config['root_path'], 'assignments', year)
    assignments = os.listdir(full_path)

    config['assignments_access'] = cfg = {}

    for a_file in assignments:
        a = json.load(open(os.path.join(full_path, a_file)))
        a_id = a[year].keys()[0]
        cfg[a_id] = []
        groups = a[year][a_id]['assignment']['groups']
        for g in groups:
            for u in g:
                cfg[a_id].append(u['id'])
        cfg[a_id] = sorted(set(cfg[a_id]))


load_users_assignments_access('2017-2018')
