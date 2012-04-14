var gamejs = require("gamejs");

// preload images
gamejs.preload([
"./statics/images/cloud_1.png",
"./statics/images/cloud_2.png",
"./statics/images/cloud_3.png",
"./statics/images/cloud_4.png",
"./statics/images/cloud_5.png",
"./statics/images/cloud_6.png",
"./statics/images/grass.png",
"./statics/images/ground-left.png",
"./statics/images/ground-right.png",
"./statics/images/ground-right.png",
"./statics/images/rock.png",
"./statics/images/metal.png",
"./statics/images/wood.png",
"./statics/images/moss.png",
"./statics/images/dwarf.png",
]);

// weapon
/*
var Rock = function(rect) {
	Rock.superConstructor.apply(this,arguments);
	this.speed = 100;
	this.posX = 0;
	this.posY = 0;
	this.image = gamejs.image.load("images/rock.png");
	this.rect = new gamejs.Rect(rect);
	return this;
}
gamejs.utils.objects.extend(Rock, gamejs.sprite.Sprite);
Rock.prototype.update = function(msDuration) {
	this.rect.moveIp(0, this.speed * (msDuration/1000));
}
*/

var Dwarf = function(rect) {
	Dwarf.superConstructor.apply(this.arguments);
	this.speed = 100;
	this.posX = 0;
	this.posY = 0;
	this.image = gamejs.image.load("images/dwarf.png");
	this.rect = new gamejs.Rect(rect);
	return this;
}
gamejs.utils.objects.extend(Dwarf, gamejs.sprite.Sprite);
Dwarf.prototype.update = function(msDuration) {
	this.rect.moveIp(0, this.speed * (msDuration/1000));
}


var BattleScene = exports.BattleScene = function(director) {
	
	this.director = director;
	this.width = 2000;
	this.height = 1000;
	this.scrolling = false;
	
	this.debug = false;
	
	this._boundingbox = new gamejs.Rect(0, 0, this.width, this.height);
	this._viewport = new gamejs.Rect(
			0, this.height-director.height, 
			director.width, director.height);
	
	this._surface_battle = new gamejs.Surface(this.width, this.height);
	this._surface_battle_bg = new gamejs.Surface(this.width, this.height);
	
	/* predraw the background */
	this.drawBackground();
	
	// draw the debug grid
	if (this.debug) {
		for(var i=0.5; i < this.width; i += 50) {
			gamejs.draw.line(this._surface_battle_bg,
				"red", [i, 0], [i, this.height], 1);
		};
		for(var i=0.5; i < this.height; i += 50) {
			gamejs.draw.line(this._surface_battle_bg,
				"blue", [0, i], [this.width, i], 1);
		};
	}
	
};

BattleScene.prototype.drawBackground = function() {
	// load cloud images
	this.cloudImgs = new Array();
	this.cloudImgs[0] = gamejs.image.load("./statics/images/cloud_1.png");
	this.cloudImgs[1] = gamejs.image.load("./statics/images/cloud_2.png");
	this.cloudImgs[2] = gamejs.image.load("./statics/images/cloud_3.png");
	this.cloudImgs[3] = gamejs.image.load("./statics/images/cloud_4.png");
	this.cloudImgs[4] = gamejs.image.load("./statics/images/cloud_5.png");
	this.cloudImgs[5] = gamejs.image.load("./statics/images/cloud_6.png");
	this.grassImg = gamejs.image.load("./statics/images/grass.png");
	this.groundLeft = gamejs.image.load("./statics/images/ground-left.png");
	this.groundRight = gamejs.image.load("./statics/images/ground-right.png");
	
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
	
	// draw an example dwarf
	this.dwarf = gamejs.image.load("./statics/images/dwarf.png");
	this._surface_battle_bg.blit(this.dwarf, [100, this.height-200]);
	this._surface_battle_bg.blit(this.dwarf, [180, this.height-200]);
	this._surface_battle_bg.blit(this.dwarf, [240, this.height-200]);
	
	// draw grass
	this._surface_battle_bg.blit(this.grassImg, [0, this.height-75]);
}

BattleScene.prototype.handleEvent = function handleEvent(event) {
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
			this._viewport.left += event.rel[0];
			this._viewport.left = Math.min(
				this._boundingbox.width - this._viewport.width, 
				Math.max(this._viewport.left, 0)
			);

			this._viewport.top += event.rel[1];
			this._viewport.top = Math.min(
				this._boundingbox.height - this._viewport.height, 
				Math.max(this._viewport.top, 0)
			);
			break;
	};
};

BattleScene.prototype.draw = function(display) {
	this._surface_battle.blit(this._surface_battle_bg);
	display.raw_blit(this._surface_battle, 
		this._viewport.left, this._viewport.top, 
		this._viewport.width, this._viewport.height,
		0, 0, 
		this._viewport.width, this._viewport.height);
};

//BattleScene.prototype.update = function(msDuration) {
//	this.pos += this.speed * (msDuration / 1000);
//	if(this.pos > this.director.wid)
//	this.startPicture.rect.x = this.pos;
//};