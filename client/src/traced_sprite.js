/**
 * Sprite with predefined trace of movement.
 * 
 */
var gamejs = require("gamejs"),
	sprite = require("gamejs/sprite"),
	game_world = require("world"),
	transform = require("gamejs/transform");

var TracedSprite = exports.TracedSprite = function TracedSprite(obj_id, trace) {
	TracedSprite.superConstructor.apply(this, arguments);
	
	this.obj = game_world.OBJECT_SPRITES[obj_id];
	this._src_image = game_world.get_image(obj_id);

	this.trace = trace;
	this._lastframe = 0;
	this._totaltime = 0;

	this.render_frame(trace[0]);
};

gamejs.utils.objects.extend(TracedSprite, sprite.Sprite);


TracedSprite.prototype.update = function(msDuration) {
	var i = this._lastframe;
	this._totaltime += msDuration;
	
	/* advance some frames */
	while(i < this.trace.length && this._totaltime >= this.trace[i].stamp) i++;
	this._lastframe = i = Math.min(i, this.trace.length-1);

	/* update image */
	this.render_frame(this.trace[this._lastframe]);
	return (this._totaltime > this.trace[this.trace.length-1].stamp);
};


TracedSprite.prototype.render_frame = function(frame) {
	var image = this.image = transform.rotate(this._src_image, frame.rotation);
	
	if(frame.alpha !== undefined)
		image.setAlpha(frame.alpha);
	
	// we need to adjust position to compensate for surface rotation
	var x = frame.x, y = frame.y, size = image.getSize(), osize = this._src_image.getSize();
	x += (osize[0] - size[0]) / 2;
	y += (osize[1] - size[1]) / 2;
	console.log(frame.alpha);
	this.rect = new gamejs.Rect(x+0.5, y+0.5, size.width, size.height);
}
