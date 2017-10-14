import argparse
import os

from flask import Flask
from flask_assets import Bundle, Environment
from lxml import html

parser = argparse.ArgumentParser()
parser.add_argument("--input", default='', help="static folder")
parser.add_argument("--output", default='../../static', help="static folder")
ARGS = parser.parse_args()


def init(app=None, js_files=None, css_files=None):
    app = app or Flask(__name__)
    with app.app_context():
        env = Environment(app)
        env.auto_build = False
        css = Bundle(
            css_files,
            filters='cssmin',
            output=os.path.join(ARGS.output, 'style.min.css'))
        env.register('css', css)

        js = Bundle(
            js_files,
            filters='uglifyjs',
            output=os.path.join(ARGS.output, 'main.min.js'))
        env.register('js', js)

        bundles = [css, js]
        return bundles


if __name__ == '__main__':
    js_files = None
    css_files = None
    with open(os.path.join(ARGS.input, 'templates', 'base.html')) as tpl_file:
        # Retrieve html template.
        tpl = html.fromstring(tpl_file.read())
        # Load list of css files.
        css = tpl.xpath('//link[@rel="stylesheet"]/@href')
        css_files = [s[1:] for s in css if s.startswith('/static/css')]
    with open(os.path.join(ARGS.input, 'templates', 'index.html')) as tpl_file:
        # Retrieve html template.
        tpl = html.fromstring(tpl_file.read())
        # Load list of js files.
        js = tpl.xpath('//script/@src')
        js_files = [
            s[1:] for s in js
            if s.startswith('/static/js') or s.startswith('/static/libs')
        ]
        print js_files
    # Build bundles
    bundles = init(js_files=js_files, css_files=css_files)
    for bundle in bundles:
        bundle.build()
