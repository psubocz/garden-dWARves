from gevent import monkey
monkey.patch_all()
from socketio.server import SocketIOServer
from socketio import socketio_manage
from actor import ActorProxy
import bottle
from bottle import route, request, static_file

import config

@route('/socket.io/<rest:path>')
def handle_socketio(rest):
	socketio_manage(request.environ, {'': ActorProxy})

@route('/static/<path>')
def handle_static(path):
	return static_file(path, root='clitest')

print "Starting socket.io server at %s:%d" % (config.SOCKETIO_IFACE, config.SOCKETIO_PORT)
SocketIOServer((config.SOCKETIO_IFACE, config.SOCKETIO_PORT), bottle.default_app(), namespace="socket.io").serve_forever()

