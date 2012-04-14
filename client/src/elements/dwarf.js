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
var Dwarf = exports.Dwarf = function Castle(director, health, id) {
	Dwarf.superConstructor.apply(this, arguments);
	this.id = id || "dwarf";
	this.image = game_world.get_image(id);
	this.max_health = this.health = health;
	this.director = director;
};

gamejs.utils.objects.extend(Dwarf, sprite.Sprite);

Dwarf.prototype.draw = function(canvas) {
	Sprite.prototype.draw.apply(this, arguments);
	gamejs.draw.rect(canvas, 
		new gamejs.Rect(this.rect.left,
						this.rect.top-20,
						this.rect.width, 
						20), "red");

	gamejs.draw.rect(canvas, 
			new gamejs.Rect(this.rect.left,
							this.rect.top-20,
							this.rect.width * (this.healt/this.max_health), 
							20), "green")
};
