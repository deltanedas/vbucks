extendContent(GenericCrafter, "hypercoolant-factory", {
	load(){
		this.super$load();
		this.liquidRegion = Core.atlas.find(this.name + "-liquid");
		this.rotatorRegion = Core.atlas.find(this.name + "-rotator");
		this.topRegion = Core.atlas.find(this.name + "-top");
	},

	draw(tile){
		this.super$draw(tile);
		Draw.rect(this.region, tile.drawx(), tile.drawy());

		Draw.color(this.outputLiquid.liquid.color);
		Draw.alpha(tile.entity.liquids.get(this.outputLiquid.liquid) / this.liquidCapacity);
		Draw.rect(this.liquidRegion, tile.drawx(), tile.drawy());
		Draw.color();

		Draw.rect(this.rotatorRegion, tile.drawx(), tile.drawy(), Time.time() * (this.craftTime / 60));
		Draw.rect(this.topRegion, tile.drawx(), tile.drawy());
	},

	generateIcons(){
		return [
			Core.atlas.find(this.name),
			Core.atlas.find(this.name + "-rotator"),
			Core.atlas.find(this.name + "-top")
		];
	}
});