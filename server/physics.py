from Box2D import *

class RealArena(object):

	def __init__(self):
		self._last_sleeping = []
	
		gravity = b2Vec2(0, -10)
		doSleep = True
		self._world = b2World(gravity=gravity, doSleep=doSleep)

		groundBody = self._world.CreateStaticBody( position=(0,0), shapes=b2PolygonShape(box=(100, 0.36)))

		self._put_object(1, 1, 3.0, 0.86)
		self._put_object(2, 1, 4.0, 0.86)
		self._put_object(3, 2, 3.5, 1.41)

		self._put_object(4, 1, 45.0, 0.86)
		self._put_object(5, 1, 46.0, 0.86)
		self._put_object(6, 2, 45.5, 1.41)

		self._timeStep = 1.0 / 60
		self._vel_iters = 10
		self._pos_iters = 8

	def _put_object(self, obid, obtype, x, y):

		body = self._world.CreateDynamicBody(position=(x,y), userData=(obid, obtype, 1))

		if obtype == 1:
			body.CreatePolygonFixture(box=(0.11,1.0), density=1, friction=0.3)
		elif obtype == 2:
			body.CreatePolygonFixture(box=(1,0.11), density=1, friction=0.3)
		

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

