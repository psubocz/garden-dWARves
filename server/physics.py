from Box2D import *

class RealArena(object):

	def __init__(self):
		self._last_sleeping = []
	
		gravity = b2Vec2(0, -10)
		doSleep = True
		self._world = b2World(gravity=gravity, doSleep=doSleep)

		groundBody = self._world.CreateStaticBody( position=(0,0), shapes=b2PolygonShape(box=(100, 0.36)))

		self._body = self._world.CreateDynamicBody(position=(50,4), userData=123)
		box = self._body.CreatePolygonFixture(box=(0.11,0.11), density=1, friction=0.3)
		self._body.did = 123
		self._timeStep = 1.0 / 60
		self._vel_iters = 10
		self._pos_iters = 8

	def tick(self):

		self._world.Step(self._timeStep, self._vel_iters, self._pos_iters)
		new_sleeping = []
		result = []
		for body in self._world.bodies:
			if body.userData == None:
				continue
			if not body.awake:
				new_sleeping.append(body.userData)
			if not body.awake and body.userData in self._last_sleeping:
				continue
			result.append((body.userData, body.position.x, body.position.y, body.angle))

		self._last_sleeping = new_sleeping
		return result

if __name__ == "__main__":

	arena = RealArena()
	while True:
		r = arena.tick()
		if r == []:
			break
		print r


