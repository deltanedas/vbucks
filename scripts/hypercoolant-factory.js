extendContent(GenericCrafter, "hypercoolant-factory", {
	draw: function(tile){
		Draw.rect(this.region, tile.drawx(), tile.drawy());
		this.drawCracks(tile);

		Draw.color(this.outputLiquid.liquid.color);
		Draw.alpha(tile.entity.liquids.get(this.outputLiquid.liquid) / liquidCapacity);
		Draw.rect(Core.atlas.find("hypercoolant-factory-liquid"), tile.drawx(), tile.drawy());
		Draw.color();

		Draw.rect(Core.atlas.find("hypercoolant-factory-rotator"), tile.drawx(), tile.drawy(), Time.time() * (this.craftTime / 60));
		Draw.rect(Core.atlas.find("hypercoolant-factory-top"), tile.drawx(), tile.drawy());
	},

	generateIcons: function(){
		return [
			Core.atlas.find("hypercoolant-factory"),
			Core.atlas.find("hypercoolant-factory-rotator"),
			Core.atlas.find("hypercoolant-factory-top")
		];
	}
});