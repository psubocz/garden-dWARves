var gamejs = require('gamejs'),
	matrix = require('gamejs/utils/matrix'),
	StartScene = require("intro_screen").StartScene, 
	BattleScene = require("battle_scene").BattleScene;

gamejs.preload(["./statics/images/logo.png","./statics/images/cannonball.png" ]);

gamejs.Surface.prototype.raw_blit = function(src, sx, sy, sw, sh, dx, dy, dw,
		dh) {
	this.context.save();
	this.context.globalCompositeOperation = "source-over";
	// first translate, then rotate
	var m = matrix.translate(matrix.identity(), dx, dy);
	m = matrix.multiply(m, src._matrix);
	this.context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
	// drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
	this.context.globalAlpha = src._blitAlpha;
	this.context.drawImage(src.canvas, sx, sy, sw, sh, dx, dy, dw, sh);
	this.context.restore();
};

gamejs.ready(function() {
	
	function Director(width, height) {
		this.width = width;
		this.height = height;
		this.onAir = false;
		this.activeScene = null;

		this.display = gamejs.display.setMode([ width, height ]);

		gamejs.time.fpsCallback(this.tick, this, 50);
	}

	Director.prototype.tick = function tick(msDuration) {
		if (!this.onAir)
			return;

		if (this.activeScene.handleEvent) {
			gamejs.event.get().forEach(this.activeScene.handleEvent,
					this.activeScene);
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

	var director = new Director(1024, 550);
	var battle_scene = new BattleScene(director);
	
//	document.getElementById("start").onclick = function() {
//		document.getElementById("gjs-canvas").style.display = "block";
//		director.start(battle_scene);
//	};
	
	director.start(battle_scene);

	// display.blit(
	// (new gamejs.font.Font('30px Sans-serif')).render('Hello World')
	// );
	
	document.getElementById("btnA").onclick = function() {
		console.log("AAA");
		battle_scene.scrollTo(300, 450);
	};
	
	document.getElementById("btnB").onclick = function() {
		battle_scene.scrollTo(1300, 450);
	};
	
	document.getElementById("shot").onclick = function() {
		battle_scene.animateShot(50, 200, 500, 200);
	};
});
