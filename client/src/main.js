var gamejs = require('gamejs'), matrix = require('gamejs/utils/matrix'), world = require('world'), SplashScene = require("splash_scene").SplashScene, BattleScene = require("battle_scene").BattleScene, TracedSprite = require("traced_sprite").TracedSprite;

var player1Name = '';
var player2Name = '';
var isChatVisible = false;
var isGameOn = false;

var object_sprites = [];
for ( var k in world.OBJECT_SPRITES) {
	object_sprites.push(world.OBJECT_SPRITES[k].path);
};

gamejs.preload(object_sprites.concat([
    './statics/images/startScreen.png',
]));
/*
gamejs.mixer.preload({"boink.wav": './statics/boink.wav'});
*/
gamejs.Surface.prototype.raw_blit = function(src, sx, sy, sw, sh, dx, dy, dw, dh) {
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

gamejs.sprite.Sprite.prototype.layout = function(bbox, left, bottom) {
	var sizes = this.image.getSize();
	this.rect = new gamejs.Rect(
		bbox.left + left - sizes[0]/2,
		bbox.top + bbox.height - bottom - sizes[1],
		sizes[0], sizes[1]
	);
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
	
	Director.prototype.send_shot = function(power) {
		socket.emit("shot", power, 0);
	};

	var director = new Director(1024, 600);
	director.start(new SplashScene(director));
	
	// focus on name entry
	$("#player_name").focus();
	
	// handle start button
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
			$("#load_msg").html('Connecting ...');
			
			socket.emit('connect', {'nick': playerName});
		}
	});
	
	// check if chat triggered
	$(document).keypress(function(event){
		if(isGameOn) {
			var keycode = (event.keyCode ? event.keyCode : event.which);
			
			var txt = $("#msgInput").val();
			
			// if pressed 't' key
			if(keycode == '116') {
				if(!isChatVisible) {
					$("#chatbox").show();
					$("#msgInput").val("");
					$("#msgInputDiv > span").html("# " + player1Name + ": ");
					$("#msgInput").focus();
					isChatVisible = true;
				} else if (txt.length == 0) {
					$("#chatbox").hide();
					$("#msgInput").val("");
					isChatVisible = false;
				}
			}
		}
	});
	
	// send message to the opponent
	$('#msgInput').keypress(function(e){
		if(e.which == 13 && isChatVisible) {
			var txt = $("#msgInput").val();
			if(txt.length > 0) {
				socket.emit('say', txt);
				$("#msgInput").val("");
				$("#chatbox").hide();
				isChatVisible = false;
			}
		}
	});
	
	// receive message from opponent
	socket.on('chat', function(udata, txt) {
		$("#chatbox").show();
		$("#msgInput").val("");
		$("#msgInputDiv > span").html("# " + player1Name + ": ");
		$("#msgInput").focus();
		$("#prevMessage").html("# " + udata['nick'] + ":  " + txt);
		isChatVisible = true;
		console.log(udata['nick']+':'+txt);
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
		isGameOn = true;
	});
	
	socket.on('turn_changed', function(udata) {
		battle_scene.setActivePlayer(udata);
	});
	
	var PPM = 36;
	
	function create_trace_object(item) {
		var sprite = item.type == 3 ? "cannonball" : "wood";
		var orientation = (item.type == 2);
		return new TracedSprite(
				item.id, 
				sprite,
				[{
					stamp: 0, 
					rotation: item.angle * 180 / Math.PI,
					x: item.x * PPM,
					y: director.height - item.y * PPM
				}], 
				orientation
		);
	}

	socket.on('arena_layout', function(udata) {
		var item;
		for(var i=0; i < udata.length; i++) {
			item = udata[i];
			battle_scene.add(create_trace_object(item));
		}
	});

	socket.on('arena_update', function(udata) {
		console.log(udata);
		var traces = {};
		var i, j, batch, trace, obj;

		function add_trace(stamp, data) {
			var l = traces[data.id] || [];
			if(!(data.id in TracedSprite._objects)) {
				battle_scene.add(create_trace_object(data));
			}
			l.push({stamp: stamp, rotation: data.angle * 180 / Math.PI,
				x: data.x * PPM, y: director.height - data.y * PPM});
			traces[data.id] = l;
		}

		for(i=0; i < udata.length; i++) {
			batch = udata[i];
			for(j=0; j < batch.objects.length; j++) {
				add_trace(batch.time * 1000, batch.objects[j]);
			}
		}

		for(i in traces) {
			trace = traces[i];
			obj = TracedSprite._objects[i];
			obj.reset_trace(trace);
		}
	});
	
});
