from Box2D import *

class RealArena(object):

	def __init__(self):
		self._last_sleeping = []
		self._nextid = 1
			
		gravity = b2Vec2(0, -10)
		doSleep = True
		self._world = b2World(gravity=gravity, doSleep=doSleep)

		groundBody = self._world.CreateStaticBody( position=(0,0), 
										shapes=b2PolygonShape(box=(100, 1.4)))

		self._put_object(1, 5.0, 1.5)
		self._put_object(1, 8.0, 1.5)
		self._put_object(2, 5.0, 5)

		self._put_object(1, 41.0, 1.5)
		self._put_object(1, 44.0, 1.5)
		self._put_object(2, 41.0, 5)

		self._timeStep = 1.0 / 60
		self._vel_iters = 10
		self._pos_iters = 8

	def _put_object(self, obtype, x, y):

		body = self._world.CreateDynamicBody(position=(x,y), userData=(self._nextid, obtype, 1))

		if obtype == 1:
			body.CreatePolygonFixture(box=(0.5,3.5), density=1, friction=0.3)
		elif obtype == 2:
			body.CreatePolygonFixture(box=(3.5,0.5), density=1, friction=0.3)
		elif obtype == 3:
			circle=b2CircleShape(pos=(0,0), radius=1)
			body.CreateFixture(shape=circle, density=1)

		self._nextid = self._nextid + 1
		return body

	def shot(self, actorid, force, angle):
		if actorid == 0:
			x = 3.5
			f = 1 * force
		else:
			x = 46.5
			f = -1 * force

		body = self._put_object(3, x, 8.5)
		body.ApplyForce((f,0), (0,0))

	def tick(self):

		self._world.Step(self._timeStep, self._vel_iters, self._pos_iters)
		self._world.ClearForces()
		new_sleeping = []
		result = []
		for body in self._world.bodies:
			if body.userData == None:
				continue
			if not body.awake:
				new_sleeping.append(body.userData)
			if not body.awake and body.userData in self._last_sleeping:
				continue
			result.append({'id': body.userData[0], 'type': body.userData[1], 'x': body.position.x, 'y': body.position.y, 'angle': body.angle})

		self._last_sleeping = new_sleeping
		return result

	def get_all_objects(self):

		result = []
		for body in self._world.bodies:
			if body.userData == None:
				continue

			result.append({'id': body.userData[0], 'type': body.userData[1], 'x': body.position.x, 'y': body.position.y, 'angle': body.angle})
		return result

	
if __name__ == "__main__":

	arena = RealArena()
	while True:
		r = arena.tick()
		if r == []:
			break
		print r
	#print arena.get_all_objects()

