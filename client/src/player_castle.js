/**
  * Sprite representing the players castle.
  */
var gamejs = require("gamejs"),
	sprite = require("gamejs/sprite"),
	game_world = require("world"),
	transform = require("gamejs/transform");

var Castle = exports.Castle = function Castle() {
	Castle.superConstructor.apply(this, arguments);
	
};

gamejs.utils.objects.extend(Castle, sprite.Group);