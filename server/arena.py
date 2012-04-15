from gevent.queue import Queue
import gevent
from physics import RealArena

class Arena(object):

	def __init__(self):
		self.inbox = Queue(0)
		self._actors = []

	def run(self):
		for event, args in self.inbox:
			fun = getattr(self, 'on_'+event)
			fun(*args)

	def on_actor_joined(self, actor):
		self._actors.append(actor)
		self._send_all('actor_joined', (actor, self))
		self._send(actor, 'arena_actors', (self._actors,))

		if len(self._actors) >= 2:
			self._send_all('game_ready')
			self._real_arena = RealArena()
			self._send_all('arena_layout', (self._real_arena.get_all_objects(),))

	def on_chat(self, actor, txt):
		self._send_all('chat', (actor, txt))

	def _send(self, actor, event, args=()):
		actor.inbox.put((event, args))

	def _sendbyid(self, actorid, event, args=()):
		self._actors[actorid].inbox.put((event, args))

	def _send_all(self, event, args=()):
		for actor in self._actors:
			self._send(actor, event, args)

class ArenaManager(object):

	def __init__(self):
		self.inbox = Queue(0)
		self._avaiting_arena = None
		self._arenas = []

	def run(self):
		for event, args in self.inbox:
			fun = getattr(self, 'on_'+event)
			fun(*args)

	def on_find_arena(self, actor):

		arena = self._avaiting_arena
		if arena == None:
			arena = Arena()
			self._avaiting_arena = arena
			self._arenas.append(arena)
			gevent.spawn(arena.run)
		else:
			self._avaiting_arena = None

		gevent.spawn(arena.inbox.put, ('actor_joined', [actor]))


arenas = ArenaManager()
gevent.spawn(arenas.run)
