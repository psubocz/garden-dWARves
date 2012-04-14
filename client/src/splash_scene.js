var gamejs = require("gamejs");

var SplashScene = exports.SplashScene = function SplashScene(director) {
	this.director = director;
	this.image = gamejs.image.load('./statics/images/startScreen.png');
	this.rect = new gamejs.Rect(0, 0, director.width, director.height);
};

gamejs.utils.objects.extend(SplashScene, gamejs.sprite.Sprite);