/* Config */
const spinSpeed = 5;
const spinFactor = 0.5;

/* Cached stuff */
const speedColour = Color(202, 202, 202); // #cacacaff
const entities = {};

/* Cool spin animation */
const eggtrifuge = extendContent(GenericCrafter, "eggtrifuge", {
	// @Override
	drawLayer: function(tile){
		// Draw the speed effect
		const factor = tile.entity.warmup;
		if(factor > 0.03){
			Draw.color(speedColour, factor * 0.75);
			Draw.rect(Core.atlas.find("vbucks-eggtrifuge-speed"), tile.drawx(), tile.drawy());
		}
		Draw.color();

		var newSpin = (Time.time() * spinSpeed * tile.entity.progress * tile.entity.warmup) % 360;
		const key = tile.x + "," + tile.y;
		const lastSpin = entities[key];
		if(lastSpin === undefined){
			entities[key] = newSpin;
			lastSpin = newSpin;
		}
		if((newSpin - lastSpin) > 50){
			newSpin = lastSpin + 50;
		}

		Draw.rect(Core.atlas.find("vbucks-eggtrifuge-rotator"), tile.drawx(), tile.drawy(), newSpin);
		entities[key] = newSpin;
	},

	generateIcons(){
		return [
			Core.atlas.find("vbucks-eggtrifuge"),
			Core.atlas.find("vbucks-eggtrifuge-rotator")
		];
	}
});

eggtrifuge.layer = Layer.turret;
