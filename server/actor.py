from socketio.namespace import BaseNamespace

UNCONNECTED = 0
CONNECTED = 1
SEARCHING = 2
INLOBBY = 3
INGAME = 4

class ActorProxy(BaseNamespace):

	def initialize(self):
		self._state = UNCONNECTED
	
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
		
