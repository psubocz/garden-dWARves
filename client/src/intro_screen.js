var gamejs = require("gamejs");

var StartScene = exports.StartScene = function(director) {
	this.director = director;
	this.startPicture = new gamejs.sprite.Sprite();
	this.startPicture.image = gamejs.image.load('./statics/images/logo.png');
	this.startPicture.rect = new gamejs.Rect(0, 0, 64, 64);
	this.pos = 0;
	this.speed = 100; 
};

/* StartScene.prototype.handleEvent = function handleEvent(event) {
	console.log("EVENT");
}; */

StartScene.prototype.draw = function(display) {
	display.fill("#808080");
	this.startPicture.draw(display);
};

StartScene.prototype.update = function(msDuration) {
	this.pos += this.speed * (msDuration / 1000);
	if(this.pos > this.director.wid)
	this.startPicture.rect.x = this.pos;
};