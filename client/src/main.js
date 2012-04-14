var gamejs = require('gamejs'), StartScene = require("intro_screen").StartScene;

gamejs.preload(["./statics/images/logo.png"]);
// 

gamejs.ready(function() {
	function Director(width, height) {
		this.onAir = false;
		this.activeScene = null;
		this.display = gamejs.display.setMode([ width, height ]);
		gamejs.time.fpsCallback(this.tick, this, 30);
	}

	Director.prototype.tick = function tick(msDuration) {
		if (!this.onAir)
			return;

		if (this.activeScene.handleEvent) {
			gamejs.event.get().forEach(this.activeScene.handleEvent);
		} else {
			// throw all events away
			gamejs.event.get();
		}
		if (this.activeScene.update) {
			this.activeScene.update(msDuration);
		}
		if (this.activeScene.draw) {
			this.activeScene.draw(this.display);
		}
		return;
	};

	Director.prototype.start = function(scene) {
		this.onAir = true;
		this.replaceScene(scene);
		return;
	};

	Director.prototype.replaceScene = function(scene) {
		this.activeScene = scene;
	};

	Director.prototype.getScene = function() {
		return this.activeScene;
	};
	
	

	var director = new Director(1000, 550);
	director.start(new StartScene());

	// display.blit(
	// (new gamejs.font.Font('30px Sans-serif')).render('Hello World')
	// );

	/**
	 * function tick(msDuration) { // game loop return; };
	 * gamejs.time.fpsCallback(tick, this, 26);
	 */
});
