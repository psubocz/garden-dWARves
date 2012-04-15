var gamejs = require('gamejs'), matrix = require('gamejs/utils/matrix'), world = require('world'), SplashScene = require("splash_scene").SplashScene, BattleScene = require("battle_scene").BattleScene, TracedSprite = require("traced_sprite").TracedSprite;

var player1Name = '';
var player2Name = '';

var object_sprites = [];
for ( var k in world.OBJECT_SPRITES) {
	object_sprites.push(world.OBJECT_SPRITES[k].path);
};

gamejs.preload(object_sprites.concat(['./statics/images/startScreen.png']));

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

	var director = new Director(800, 600);
	director.start(new SplashScene(director));

	$("#start").click(function(event) {
		var playerName = $("#player_name").val();
		
		if(playerName.length < 1) {
			alert('Please enter your name');
		} else {
			player1Name = playerName;
			
			// hide player name entry fields
			$("#login-screen").hide();
			
			// display loader
			$("#loader").show();
			$("#load_msg").html('...');
			
			socket.emit('connect', {'nick': playerName});
		}
	});
	
	socket.on('connected', function () {
		socket.emit('search_for_opponent', {});
		$("#load_msg").html('Waiting for opponent...');
		console.log('connected');
	});
	
	socket.on('joined_arena', function(udata) {
		player1Name = udata['nick'];
		console.log('i joined: ' + udata['nick']);
	});
	
	socket.on('opponent_joined', function(udata) {
		player2Name = udata['nick'];
		console.log('opponent joined: ' + udata['nick']);
	});
	
	socket.on('game_ready', function() {
		console.log('game ready');
		
		$("#loader").hide();
		
		// display battle scene
		battle_scene = new BattleScene(director, {name: player1Name}, {name: player2Name});
		director.start(battle_scene);
	});
	
	/*
	document.getElementById("start").onclick = function() {
		this.style.display = "none";
		battle_scene = new BattleScene(director, {name: "Zuber"}, {name: "Ślimak"});
		director.start(battle_scene);
	};
	*/

	/*	
	document.getElementById("btnA").onclick = function() {
		battle_scene.scrollTo(300, 450);
	};

	document.getElementById("btnB").onclick = function() {
		battle_scene.scrollTo(1300, 450);
	};

	document.getElementById("shot").onclick = function() {
		var trace = []; 
		for(var i=0; i < 60; i++) {
			trace.push({
				stamp : i*30,
				x : i*5,
				y : 100+50*Math.sin(i/10),
				rotation : i*3,
				alpha: (i < 55 ? 0: Math.sin((i-55)/10*3.1415926535))
			});
		}
		battle_scene.add(new TracedSprite("cannonball", trace));
	};
	*/
	
});
