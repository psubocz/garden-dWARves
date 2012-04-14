from socketio.namespace import BaseNamespace

class ActorProxy(BaseNamespace):

	def process_event(self, packet):
		print packet['name']

