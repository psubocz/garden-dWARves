/**
  * Sprite representing the players castle.
  */
var gamejs = require("gamejs"),
	sprite = require("gamejs/sprite"),
	game_world = require("world"),
	transform = require("gamejs/transform"),
	vop = require("gamejs/utils/vectors"),
	matrix = require("gamejs/utils/matrix");

/**
 * @param elements - Castle pieces. 
 */
var Fork = exports.Fork = function Fork(director, flip) {
	Fork.superConstructor.apply(this, arguments);
	this._fork_image = game_world.get_image("fork");
	this._bullet_image = game_world.get_image("cannonball");
	this.image = new gamejs.Surface(this._fork_image.getSize());
	this.director = director;
	this.being_pulled = false;
	this.flipped = !!flip;
	this.angle = 0;
	this.has_meatloaf = false;
	
	// this._boink_sample = new gamejs.mixer.Sound("./statics/boink.wav");
};

gamejs.utils.objects.extend(Fork, sprite.Sprite);

Fork.prototype.draw = function(canvas) {
	var ctx = canvas.context;
	this.image.clear();
	this.image.blit(this._fork_image);
	if(this.has_meatloaf) {
		this.image.blit(this._bullet_image);
	}
	if(this.flipped) {
		this.image = transform.flip(this.image, true, false);
	}
	ctx.save();
	var s = this.image.getSize(), a = this.angle;
	ctx.translate(this.rect.left+s[0]/2, this.rect.top+s[1]);
	ctx.rotate(a);
	ctx.drawImage(this.image.canvas, -s[0]/2, -s[1], s[0], s[1]);
	ctx.restore();
};


Fork.prototype.start_sling = function(event) {
	this.orect = this.rect.clone();
	this.startx = event.pos[0];
};

Fork.prototype.stop_sling = function(event) {
	this.director.send_shot(Math.abs(5 * this.angle / Math.PI));
	this.angle = 0;
	this.has_meatloaf = false;
	// this._boink_sample.play();
};

Fork.prototype.sling_moved = function(event) {
	var deltax = -(this.startx - event.pos[0]);
	this.angle = Math.max(Math.min(0, Math.asin(deltax*1.2/event.pos[1])), -Math.PI/5);
};