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
var Dwarf = exports.Dwarf = function Dwarf(director, health, id) {
	Dwarf.superConstructor.apply(this, arguments);
	this.id = id || "dwarf";
	this.image = game_world.get_image(this.id);
	this.max_health = this.health = health;
	this.director = director;
};

gamejs.utils.objects.extend(Dwarf, sprite.Sprite);

Dwarf.prototype.draw = function(canvas) {
	gamejs.sprite.Sprite.prototype.draw.apply(this, arguments);
	gamejs.draw.rect(canvas, "red", 
		new gamejs.Rect(this.rect.left-0.5,
						this.rect.top+this.rect.height+2, this.rect.width, 6));
	gamejs.draw.rect(canvas, "green", 
			new gamejs.Rect(this.rect.left-0.5,
							this.rect.top+this.rect.height+2, 
							this.rect.width*(this.health/this.max_health), 6.5));
};
