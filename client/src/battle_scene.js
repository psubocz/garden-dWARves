var gamejs = require("gamejs"), 
	matrix = require("gamejs/utils/matrix"),
	world = require("world"),
	font = require("gamejs/font");


var BattleScene = exports.BattleScene = function(director) {
	this.director = director;
	this.width = 1600;
	this.height = this.director.height;
	
// this.zoom = 1.0;
// this.min_zoom = 0.5;
// this.max_zoom = 3.0;
	
	this._font = new font.Font('48px sans');

	this.scrolling = false;
	this._locked = false;

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
	
	gamejs.draw.rect(this._surface_battle_bg, 
		"#40ca40", 
		new gamejs.Rect(0, this.height-100, this.width, 100)
	);
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
	this._surface_battle_bg.blit(this._font.render("A"), [300, this.height-100]);
	this._surface_battle_bg.blit(this._font.render("B"), [this.width-300, this.height-100]);

	// draw an example dwarf
	this.dwarf = gamejs.image.load("./statics/images/dwarf.png");
	this._surface_battle_bg.blit(this.dwarf, [100, this.height-200]);
	this._surface_battle_bg.blit(this.dwarf, [180, this.height-200]);
	this._surface_battle_bg.blit(this.dwarf, [240, this.height-200]);
	
	// draw grass
	this._surface_battle_bg.blit(this.grassImg, [0, this.height-75]);
}

BattleScene.prototype.handleEvent = function handleEvent(event) {
	if(this.locked)
		return;
	switch(event.type) {
		case gamejs.event.MOUSE_DOWN:
			this.scrolling = true;
			break;
		case gamejs.event.MOUSE_UP:
			this.scrolling = false;
			break;
		case gamejs.event.MOUSE_MOTION:
			if(!this.scrolling)
				break;
			this.scrollNowBy(event.rel[0], event.rel[1]);
			break;
// case gamejs.event.MOUSE_WHEEL:
// var new_zoom = this.zoom * (1 - event.delta/100);
// this.zoom = Math.max(this.min_zoom, Math.min(this.max_zoom, new_zoom));
// this._zoomedport = scaleRect(this._viewport,
// this._boundingbox,
// new gamejs.Rect(0, 0, this.director.width, this.director.height),
// this.zoom
// );
// break;
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
	if(this.locked)
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
	
	this.locked = true;

	function scroller(msElapsed) {
		total += msElapsed;
		
		if(total > duration) {
			this._viewport.left = tx;
			this._viewport.top = ty;
			gamejs.time.deleteCallback(scroller, 50);
			this.locked = false;
			return;
		} 
		this.scrollNowBy(msElapsed * speedx, msElapsed * speedy);
	}

	gamejs.time.fpsCallback(scroller, this, 50);
};

BattleScene.prototype.add = function(sprite) { 
	this._objects.push(sprite);
};
