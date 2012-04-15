/**
  * Sprite representing the players castle.
  */
var gamejs = require("gamejs"),
	sprite = require("gamejs/sprite"),
	game_world = require("world"),
	transform = require("gamejs/transform"),
	Dwarf = require("elements/dwarf").Dwarf,
	Fork = require("elements/fork").Fork;

/**
 * @param elements - Castle pieces. 
 */
var Castle = exports.Castle = function Castle(director, name, bbox, flip, elements) {
	Castle.superConstructor.apply(this, arguments);
	this.name = name;
	this.elements = elements || [];
	this.rect = bbox.clone();
	this._font = new gamejs.font.Font("36px serif");
	this._name = this._font.render(this.name);
	this._flipped = !!flip;

	var dwarf = new Dwarf(director, 100);
	dwarf.layout(this.rect, this.flipX(200), 0);
	this.add(dwarf);
	
	var fork = this.fork = new Fork(director, flip);
	fork.layout(this.rect, this.flipX(50), -20);
	this.add(fork);
};

gamejs.utils.objects.extend(Castle, sprite.Group);

Castle.prototype.flipX = function(x) {
	return !this._flipped ? x : this.rect.width - x;
};

Castle.prototype.draw = function(canvas) {
	sprite.Group.prototype.draw.apply(this, arguments);
	var nsize = this._name.getSize();
	canvas.blit(this._name, [
          this.rect.left + (this.rect.width - nsize[0])/2, 
          this.rect.top + this.rect.height+10
    ]);
};