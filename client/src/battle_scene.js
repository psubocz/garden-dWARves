var gamejs = require("gamejs"), matrix = require("gamejs/utils/matrix"), font = require("gamejs/font");

var BattleScene = exports.BattleScene = function(director) {
	this.director = director;
	this.width = 1600;
	this.height = this.director.height;
	
//	this.zoom = 1.0;
//	this.min_zoom = 0.5;
//	this.max_zoom = 3.0;
	
	this._font = new font.Font('48px sans');

	this.scrolling = false;

	this._boundingbox = new gamejs.Rect(0, 0, this.width, this.height);
	this._viewport = new gamejs.Rect(
			0, this.height-director.height, 
			director.width, director.height);
	this._zoomedport = this._viewport.clone();

	this._surface_battle = new gamejs.Surface(this.width, this.height);
	this._surface_battle_bg = new gamejs.Surface(this.width, this.height);

	/* predraw the background */
	
	gamejs.draw.rect(this._surface_battle_bg, 
		"#40ca40", 
		new gamejs.Rect(0, this.height-100, this.width, 100)
	);

	gamejs.draw.rect(this._surface_battle_bg, 
		"#8080da", 
		new gamejs.Rect(0, 0, this.width, this.height-100)
	);
	
	// draw the debug grid
	for(var i=0.5; i < this.width; i += 200) {
		gamejs.draw.line(this._surface_battle_bg,
			"red", [i, 0], [i, this.height], 1);
	};
	
	this._surface_battle_bg.blit(this._font.render("A"), [300, this.height-100]);
	this._surface_battle_bg.blit(this._font.render("B"), [this.width-300, this.height-100]);

};

/**
 * Scale up the rect by factor, so that it never is larger
 * then maxRect or smaller then minRect. This keeps the aspect ratio
 * of rect.
 * 
 * @param rect
 * @param maxRect
 * @param factor
 */
function scaleRect(rect, factor, maxRect, minRect) {
	var deltax = rect.width * factor;
	
	var sh = rect.height * factor;
	var aspect  = rect.width / rect.height;
	
	console.log("B", factor, rect.toString(), "U", maxRect.toString(), "L", minRect.toString());
	
	sh = Math.max(Math.min(sh, maxRect.height), minRect.height);
	sw = sh * aspect;
	var r = new gamejs.Rect(
			rect.left * factor,
			rect.top * factor,
			rect.width * 
			Math.max(rect.top - (sh + rect.height), 0),
			sw, sh); 
	console.log(r.toString(), factor, rect.toString(), "U", maxRect.toString(), "L", minRect.toString());
	return r;
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
//		case gamejs.event.MOUSE_WHEEL:
//			var new_zoom = this.zoom * (1 - event.delta/100);
//			this.zoom = Math.max(this.min_zoom, Math.min(this.max_zoom, new_zoom));
//			this._zoomedport = scaleRect(this._viewport,
//				this._boundingbox, 
//				new gamejs.Rect(0, 0, this.director.width, this.director.height),
//				this.zoom
//			);
//			break;
	}
};

BattleScene.prototype.draw = function(display) {
	this._surface_battle.blit(this._surface_battle_bg);
	display.clear();
	var vp = this._viewport;
	display.raw_blit(this._surface_battle, 
		vp.left, vp.top, vp.width, vp.height,
		0, 0, this.director.width, this.director.height);
};