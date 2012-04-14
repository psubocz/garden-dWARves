var gamejs = require("gamejs");

var StartScene = exports.StartScene = function(director) {
	// pass
	this.startPicture = gamejs.image.load('./statics/images/logo.png');
};

StartScene.prototype.handleEvent = function handleEvent(event) {
     console.log("EVENT");
};

StartScene.prototype.draw = function(display) {
     display.blit(this.startPicture);
};