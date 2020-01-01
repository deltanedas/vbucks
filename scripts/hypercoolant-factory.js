extendContent(GenericCrafter, "hypercoolant-factory", {
	draw: function(tile){
		Draw.rect(this.region, tile.drawx(), tile.drawy());

		Draw.color(this.outputLiquid.liquid.color);
		Draw.alpha(tile.entity.liquids.get(this.outputLiquid.amount) / this.liquidCapacity);
		Draw.rect(Core.atlas.find("vbucks-hypercoolant-factory-liquid"), tile.drawx(), tile.drawy());
		Draw.color();

		Draw.rect(Core.atlas.find("vbucks-hypercoolant-factory-rotator"), tile.drawx(), tile.drawy(), Time.time() * (this.craftTime / 60));
		Draw.rect(Core.atlas.find("vbucks-hypercoolant-factory-top"), tile.drawx(), tile.drawy());
	},

	generateIcons: function(){
		return [
			Core.atlas.find("vbucks-hypercoolant-factory"),
			Core.atlas.find("vbucks-hypercoolant-factory-rotator"),
			Core.atlas.find("vbucks-hypercoolant-factory-top")
		];
	}
});