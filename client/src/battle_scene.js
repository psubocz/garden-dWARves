var gamejs = require("gamejs"), 
	matrix = require("gamejs/utils/matrix"),
	vector = require("gamejs/utils/vectors"),
	world = require("world"),
	font = require("gamejs/font"),
	Castle = require("elements/castle").Castle;


var BattleScene = exports.BattleScene = function(director, playerA, playerB) {
	this.director = director;
	this.width = 1800;
	this.height = this.director.height;
	
	this._font = new font.Font('48px sans');

	this.scrolling = false;
	this.forking = false;
	this.locked = true;
	this.scroll_locked = false;

	this._boundingbox = new gamejs.Rect(0, 0, this.width, this.height);
	this._viewport = new gamejs.Rect(
			0, this.height-director.height, 
			director.width, director.height);
	this._zoomedport = this._viewport.clone();

	this._surface_battle = new gamejs.Surface(this.width, this.height);
	this._surface_battle_bg = new gamejs.Surface(this.width, this.height);
	this._objects = [];

	/* predraw the background */
	this.drawBackground();
	
	this.playerA = playerA;
	this.playerB = playerB;
	
	this.active_player = null;

	this.castleA = new Castle(director, playerA.name, new gamejs.Rect(0, 230, 400, 300), false);
	this.add(this.castleA);
	this.castleB = new Castle(director, playerB.name, new gamejs.Rect(1400, 230, 400, 300), true)
	this.add(this.castleB);
	
	this.fork = this.castleA.fork;
};

BattleScene.prototype.drawBackground = function() {
	// load cloud images
	this.cloudImgs = [];
	for (var i=1; i <= 6; i++) {
		this.cloudImgs.push(world.get_image("cloud_"+i));
	};
	
	this.grassImg = world.get_image("grass");
	this.groundLeft = world.get_image("ground-left");
	this.groundRight = world.get_image("ground-right");
	
	// draw sky
	gamejs.draw.rect(this._surface_battle_bg,
		"#babaf2",
		new gamejs.Rect(0, 0, this.width, this.height)
	);
	
	// draw clouds
	for (i=0; i < this.width/220; ++i) {
		var x = Math.floor((Math.random()*10)+1) % 6;
		this._surface_battle_bg.blit(this.cloudImgs[x],[220*i,10]);
	}
	
	
	// draw ground
	this._surface_battle_bg.blit(this.groundLeft,[0, this.height-96]);
	this._surface_battle_bg.blit(this.groundRight,[this.width-528, this.height-96]);
	
	// draw grass
	this._surface_battle_bg.blit(this.grassImg, [0, this.height-75]);
}

BattleScene.prototype.handleEvent = function handleEvent(event) {
	switch(event.type) {
		case gamejs.event.MOUSE_DOWN:
			var vpos = vector.add(this._viewport.topleft, event.pos);
			var bit = this.fork.rect.collidePoint(vpos);
			if(bit && !this.locked) {
				this.fork.start_sling(event);
				this.forking = true;
				break;
			}
			if(this.scroll_locked) 
				break;
			this.scrolling = true;
			break;
		case gamejs.event.MOUSE_UP:
			if(this.forking) {
				this.fork.stop_sling(event);
				this.forking = false;
				break;
			}
			this.scrolling = false;
			break;
		case gamejs.event.MOUSE_MOTION:
			if(this.forking) {
				console.log(event);
				this.fork.sling_moved(event);
				break;
			}
			if(!this.scrolling) {
				break;
			}
			this.scrollNowBy(event.rel[0], event.rel[1]);
			break;
	}
};


BattleScene.prototype.update = function(msDuration) {
	this._objects = this._objects.filter(function(b) {
		return !b.update(msDuration);
	}, this);
};


BattleScene.prototype.draw = function(display) {
	this._surface_battle.blit(this._surface_battle_bg);
	this._objects.forEach(function(b) {
		b.draw(this._surface_battle);
	}, this);

	var vp = this._viewport;
	display.raw_blit(this._surface_battle, 
		vp.left, vp.top, vp.width, vp.height,
		0, 0, this.director.width, this.director.height);
	
	if(this.active_player !== null) {
		var ctx = display.context;
		ctx.save();
		ctx.font = "20pt Arial";
		ctx.color = "white";
		var text = (this.active_player === this.playerA ? 
				"It's your turn" : "Player " + this.active_player.name + " is moving");
		var metric = ctx.measure(text)
		ctx.translate(this._viewport.left, this._viewport.top);
		ctx.translate(this._viewport.width - metric.width/2, 20);
		ctx.fillText(text, 0, 0, this._viewport.width);
		ctx.restore();
	}
};


BattleScene.prototype.sanitizeX = function(x) {
	return Math.min(Math.max(0, x), this._boundingbox.width - this._viewport.width);
};


BattleScene.prototype.sanitizeY = function(y) {
	return Math.min(Math.max(0, y), this._boundingbox.height - this._viewport.height);
};


BattleScene.prototype.scrollNowBy = function(x, y) {
	this._viewport.left += x || 0;
	this._viewport.left = this.sanitizeX(this._viewport.left);
	
	this._viewport.top += y || 0;
	this._viewport.top = this.sanitizeY(this._viewport.top);
};


BattleScene.prototype.scrollTo = function(x, y, duration) {
	if(this.scroll_locked)
		return;
	/* Animate scrolling to point (x, y) [as the center of the screen]. */
	var tx = this.sanitizeX(x - this._viewport.width/2),
		ty = this.sanitizeY(y - this._viewport.height/2),
		deltax = tx - this._viewport.left,
		deltay = ty - this._viewport.top,  
		total = 0, duration = duration || 1000;

	var speedx = deltax / duration; // pixels per ms
	var speedy = deltay / duration; // pixels per ms
	
	if(speedx < 1 && !speedy < 1) {
		duration = 0;
	}
	
	this.scroll_locked = true;

	function scroller(msElapsed) {
		total += msElapsed;
		
		if(total > duration) {
			this._viewport.left = tx;
			this._viewport.top = ty;
			gamejs.time.deleteCallback(scroller, 50);
			this.scroll_locked = false;
			return;
		} 
		this.scrollNowBy(msElapsed * speedx, msElapsed * speedy);
	}

	gamejs.time.fpsCallback(scroller, this, 50);
};


BattleScene.prototype.add = function(sprite) { 
	this._objects.push(sprite);
};


