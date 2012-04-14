#!/usr/bin/env python

import SimpleHTTPServer
import SocketServer

PORT = 8000

class Server(SocketServer.TCPServer):
    allow_reuse_address = True 

class Handler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    
    def translate_path(self, path):
        if path in ("", "/", "/index.html"):
            return "./statics/index.html";
        return SimpleHTTPServer.SimpleHTTPRequestHandler.translate_path(self, path)

httpd = Server(("", PORT), Handler)

print "serving at port", PORT
httpd.serve_forever()
