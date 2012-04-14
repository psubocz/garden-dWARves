from socketio.namespace import BaseNamespace
from gevent.queue import Queue
import gevent
UNCONNECTED = 0
CONNECTED = 1
SEARCHING = 2
INLOBBY = 3
INGAME = 4

class ActorProxy(BaseNamespace):

	def initialize(self):
		self._state = UNCONNECTED
		self.incoming_queue = Queue(0)

		# spawn incoming queue greenlet
		self.spawn(self._incoming)
		self._actor = Actor()
		self._actor.bind_proxy(self)
		gevent.spawn(self._actor.run)

	def _incoming(self):
		for event,args in self.incoming_queue:
			try:
				self.emit(event, *args)
			except Exception, e:
				print e

	def process_event(self, packet):
		gevent.spawn(self._actor.inbox.put, (packet['name'], packet['args']))

class Actor(object):

	def __init__(self):
		self._proxy = None
		self.inbox = Queue(0)

	def bind_proxy(self, proxy):
		self._proxy = proxy

	def run(self):
		for event,args in self.inbox:
			fun = getattr(self, 'on_'+event)
			fun(*args)

	def emit(self, event, *args):
		gevent.spawn(self._proxy.incoming_queue.put, (event, args))

	def on_connect(self, udata):
		self._udata = udata
		self._change_state(CONNECTED)
		self.emit('connected')

	def on_search_for_opponent(self, filters):
		self._change_state(SEARCHING)
		self.emit('waiting_for_oppponent')
		gevent.sleep(3)
		self._change_state(INLOBBY)
		self.emit('opponent_found', self._udata)

	def on_start_game(self):
		self._change_state(INGAME)
		self.emit('game_started')

	def on_chat(self, txt):
		self.emit('chat', self._udata, txt)
	
	def on_end_game(self):
		self._change_state(INLOBBY)
		self.emit('game_terminated', 'Opponent left')

	def _change_state(self, newstate):
		self._state = newstate
		
