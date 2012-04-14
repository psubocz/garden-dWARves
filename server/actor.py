from socketio.namespace import BaseNamespace
from gevent.queue import Queue
import gevent
from arena import arenas
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
				print 'emiting', event
				self.emit(event, *args)
			except Exception, e:
				print 'error %s' % e

	def process_event(self, packet):
		gevent.spawn(self._actor.inbox.put, (packet['name'], packet['args']))

class Actor(object):

	def __init__(self):
		self._proxy = None
		self.inbox = Queue(0)
		self._arena = None
		self._udata = {'nick': 'anon'}

	def user_data(self):
		return self._udata

	def bind_proxy(self, proxy):
		self._proxy = proxy

	def run(self):
		for event,args in self.inbox:
			fun = getattr(self, 'on_'+event)
			fun(*args)

	def emit(self, event, *args):
		gevent.spawn(self._proxy.incoming_queue.put, (event, args))

	def on_connect(self, udata):
		print 'connect: ',udata
		self._udata = udata
		self._change_state(CONNECTED)
		self.emit('connected')

	def on_search_for_opponent(self, filters):
		self._change_state(SEARCHING)
		self.emit('waiting_for_opponent')
		gevent.spawn(arenas.inbox.put, ('find_arena', (self,)))

	def on_actor_joined(self, actor, arena):
		if actor == self:
			self._arena = arena
		else:
			self.emit('opponent_joined', actor.user_data())

	def on_arena_actors(self, actors):
		for actor in actors:
			self.emit('opponent_joined', actor.user_data())

	def on_game_ready(self):
		self.emit('game_ready')

	def on_start_game(self):
		self._change_state(INGAME)
		self.emit('game_started')

	def on_say(self, txt):
		if self._arena == None:
			return
		gevent.spawn(self._arena.inbox.put, ('chat', (self, txt)))

	def on_chat(self, actor, txt):
		self.emit('chat', actor.user_data(), txt)
	
	def on_end_game(self):
		self._change_state(INLOBBY)
		self.emit('game_terminated', 'Opponent left')

	def _change_state(self, newstate):
		self._state = newstate
		
