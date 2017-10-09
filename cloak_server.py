#!/usr/bin/env python
"""
Cloaking server to hide the port
"""
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import SocketServer

URL = 'http://localhost:5000'
TEMPLATE = '<html><head><title>Assignments</title><script> \
window.addEventListener("message", (ev) => window.history.pushState(ev.data.a, ev.data.b, ev.data.c), false); \
</script></head> \
<frameset cols="0,*" framespacing="0" border="0" frameborder="0"> \
<frame name="zero" scrolling="no" noresize> <frame name="main" src="{}"> </frameset> \
</html>'


class S(BaseHTTPRequestHandler):

    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def do_GET(self):

        if self.path == '/favicon.ico':
            self.send_response(200)
            self.send_header('Content-type', 'image/png')
            self.end_headers()
            self.wfile.write(
                open('static/res/icons/favicon-96x96.png', 'rb').read())
            return
        self._set_headers()
        self.wfile.write(TEMPLATE.format(URL + self.path))


def run(server_class=HTTPServer, handler_class=S, port=80):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print 'Starting server...'
    httpd.serve_forever()


if __name__ == "__main__":
    from sys import argv

    if len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run()
