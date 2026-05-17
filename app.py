#!/usr/bin/env python3
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import sys

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class MyHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    port = 8000
    server = HTTPServer(('127.0.0.1', port), MyHTTPRequestHandler)
    print(f'Server running at http://localhost:{port}/')
    server.serve_forever()
