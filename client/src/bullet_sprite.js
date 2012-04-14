/**
 * Sprite representing the object that will be thrown.
 */
var gamejs = require("gamejs"), sprite = require("gamejs/sprite");

var Bullet = exports.Bullet = function BulletSprite(sx, sy, tx, ty) {
	Bullet.superConstructor.apply(this, arguments);
	
	this.image = gamejs.image.load("./statics/images/cannonball.png");
	var iw = ih = 24;

	this._srcRect = new gamejs.Rect(sx - iw/2, sy - ih/2, iw, ih);
	this._tgtRect = new gamejs.Rect(tx - iw/2, ty - ih/2, iw, ih);
	this.rect = this._srcRect.clone();
	this.time_elapsed = 0; 
	this.speed = 0.5;
	this.eta = Math.sqrt( Math.pow(tx-sx, 2), Math.pow(ty-sy, 2)) / this.speed;
};

gamejs.utils.objects.extend(Bullet, sprite.Sprite);

Bullet.prototype.update = function(msDuration) {
	this.time_elapsed += msDuration;
	var progress = this.time_elapsed / this.eta;
	this.rect = this.rect_for_progress(Math.min(1, progress));
	return (progress > 1.05);
};


/**
 * TODO: simple linear easing
 */
Bullet.prototype.rect_for_progress = function(progress) { 
	return new gamejs.Rect(
		(1-progress)*this._srcRect.left + progress*this._tgtRect.left,
		(1-progress)*this._srcRect.top + progress*this._tgtRect.top,
		this.rect.width,
		this.rect.height);
};