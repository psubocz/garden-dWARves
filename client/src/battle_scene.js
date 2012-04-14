var gamejs = require("gamejs");

var BattleScene = exports.BattleScene = function(director) {
	
	this.director = director;
	this.width = 2000;
	this.height = 1000;
	
	this.scrolling = false;
	
	this._boundingbox = new gamejs.Rect(0, 0, this.width, this.height);
	this._viewport = new gamejs.Rect(
			0, this.height-director.height, 
			director.width, director.height);
	
	this._surface_battle = new gamejs.Surface(this.width, this.height);
	this._surface_battle_bg = new gamejs.Surface(this.width, this.height);
	
	/* predraw the background */
	
	gamejs.draw.rect(this._surface_battle_bg, 
		"#40ca40", 
		new gamejs.Rect(0, this.height-300, this.width, 300)
	);

	gamejs.draw.rect(this._surface_battle_bg, 
		"#8080da", 
		new gamejs.Rect(0, 0, this.width, this.height-300)
	);
	
	// draw the debug grid
	for(var i=0.5; i < this.width; i += 50) {
		gamejs.draw.line(this._surface_battle_bg,
			"red", [i, 0], [i, this.height], 1);
	};

	for(var i=0.5; i < this.height; i += 50) {
		gamejs.draw.line(this._surface_battle_bg,
			"blue", [0, i], [this.width, i], 1);
	};


//	this.startPicture = new gamejs.sprite.Sprite();
//	this.startPicture.image = gamejs.image.load('./statics/images/logo.png');
//	this.startPicture.rect = new gamejs.Rect(0, 0, 64, 64);
//	this.pos = 0;
//	this.speed = 100; 
};

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