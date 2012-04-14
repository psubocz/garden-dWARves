/**
  * Sprite representing the players castle.
  */
var gamejs = require("gamejs"),
	sprite = require("gamejs/sprite"),
	game_world = require("world"),
	transform = require("gamejs/transform");

/**
 * @param elements - Castle pieces. 
 */
var Castle = exports.Castle = function Castle(director, name, bbox, elements) {
	Castle.superConstructor.apply(this, arguments);
	this.name = name;
	this.elements = elements || [];
	this.rect = bbox.clone();
};

gamejs.utils.objects.extend(Castle, sprite.Group);

Castle.prototype.draw = function(canvas) {
	sprite.Group.prototype.draw.apply(this, arguments);
	// canvas.blit(this._font.render(this.name), [this.rect.left, this.rect.top]);
};