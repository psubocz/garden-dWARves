from gevent.queue import Queue
import gevent
from physics import RealArena

class Arena(object):

	def __init__(self):
		self.inbox = Queue(0)
		self._actors = []
		self._turn = None

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
			self._change_turn()

	def on_chat(self, actor, txt):
		self._send_all('chat', (actor, txt))

	def on_shot(self, actor, force, angle):
		if actor != self._turn:
			return

		# physics!
		if actor == self._actors[0]:
			actorid = 0
		else:
			actorid = 1

		self._real_arena.shot(actorid, force, angle)

		self._update_physics()
		self._change_turn()

	def _update_physics(self):
		result = []
		time = 0
		i = 0
		for l in xrange(3600):
			r = self._real_arena.tick()
			if r == []:
				break
			result.append({'time': time, 'objects': r})
			time = time + 1.0/60
			i = i + 1
			if i % 60 == 0:
				gevent.sleep(0)

		self._send_all('arena_update', (result,))

	def _change_turn(self):
		if self._turn == self._actors[0]:
			self._turn = self._actors[1]
			self._send(self._actors[0], 'turn_change', (False,))
		else:
			self._turn = self._actors[0]
			self._send(self._actors[1], 'turn_change', (False,))
		self._send(self._turn, 'turn_change', (True,))

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
