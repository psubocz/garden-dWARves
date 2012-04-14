var gamejs = require("gamejs"), transform = require("gamejs/transform");

var sprites = exports.OBJECT_SPRITES = {
	"cannonball": {
		path: "./statics/images/cannonball.png",
		scale: 0.5
	},
	"cloud_1": {path: "./statics/images/cloud_1.png"},
	"cloud_2": {path: "./statics/images/cloud_2.png"},
	"cloud_3": {path: "./statics/images/cloud_3.png"},
	"cloud_4": {path: "./statics/images/cloud_4.png"},
	"cloud_5": {path: "./statics/images/cloud_5.png"},
	"cloud_6": {path: "./statics/images/cloud_6.png"},
	"grass": {path: "./statics/images/grass.png"},
	"ground-left": {path: "./statics/images/ground-left.png"},
	"ground-right": {path: "./statics/images/ground-right.png"},
	"ground-right": {path: "./statics/images/ground-right.png"},
	"rock": {path: "./statics/images/rock.png"},
	"metal": {path: "./statics/images/metal.png"},
	"wood": {path: "./statics/images/wood.png"},
	"moss": {path: "./statics/images/moss.png"},
	"dwarf": {path: "./statics/images/dwarf.png", scale: 0.3},
};

exports.get_image = function(id) {
	var obj = sprites[id];
	if(!obj) 
		throw Error("No sprite for id: " + id);
	var img = gamejs.image.load(obj.path), sizes = img.getSize();
	return sprites[id].scale !== undefined ? 
		transform.scale(img, [sizes[0]*obj.scale, sizes[1]*obj.scale]) : img;
};
