/* Config */
const spinSpeed = 5;
const spinFactor = 0.5;

/* Cached stuff */
const speedColour = Color(202, 202, 202); // #cacacaff

/* Cool spin animation */
const eggtrifuge = extendContent(GenericCrafter, "eggtrifuge", {
	draw(tile){
		Draw.rect(Core.atlas.find("vbucks-eggtrifuge"), tile.drawx(), tile.drawy());

		// Draw the speed effect
		var factor = tile.entity.warmup;
		if(factor > 0.03){
			Draw.color(speedColour, factor * 0.75);
			Draw.rect(Core.atlas.find("vbucks-eggtrifuge-speed"), tile.drawx(), tile.drawy());
		}
		Draw.color();
	},

	drawLayer(tile){
		var newSpin = (Time.time() * spinSpeed * tile.entity.progress * tile.entity.warmup) % 360;
		if(this.lastSpin == null){
			this.lastSpin = newSpin
		}
		//newSpin = Mathf.lerp(this.lastSpin, newSpin, spinFactor);
		if((newSpin - this.lastSpin) > 50){
			newSpin = this.lastSpin + 50;
		}
		Draw.rect(Core.atlas.find("vbucks-eggtrifuge-rotator"), tile.drawx(), tile.drawy(), newSpin);
		this.lastSpin = newSpin;
	},

	generateIcons(){
		return [
			Core.atlas.find("vbucks-eggtrifuge"),
			Core.atlas.find("vbucks-eggtrifuge-rotator")
		];
	}
});

eggtrifuge.layer = Layer.turret;