/* Config */
const eggChance = 7000; // Same odds as rare egg in eggbot.
const spinSpeed = 2;
const feathersSpawned = 20;
const featherRotations = 5; // Times a feather rotates before despawning, set to 60 to disable rotation.
const featherLifetime = 60; // Ticks before a feather despawns.

/* Stuff used by Chicken Coop */
const egg = Vars.content.getByName(ContentType.item, "vbucks-egg");

const featherEffect = newEffect(featherLifetime, e => {
	Draw.rect(featherRegion, e.x, e.y, e.fin() * (360 / (featherLifetime / featherRotations)));
});

/* The big boy himself */
const coop = extendContent(Block, "chicken-coop", {
	update: function(tile){
		if(Math.random(1, eggChance) == 1){
			print("egg");
			for(var i = 0; i < feathersSpawned; i++){
				Effects.effect(featherEffect, tile);
			}
			var entity = tile.entity;
			if(entity != null){
				entity.items.add(egg, 1);
				this.tryDump(tile, egg);
			}else{
				print("entity is null :(");
			}
		}
	},

	draw: function(tile){
		Draw.rect(Core.atlas.find("vbucks-chicken-coop"), tile.drawx(), tile.drawy());
		Draw.rect(Core.atlas.find("vbucks-chicken-coop-rotator"), tile.drawx(), tile.drawy(), Time.time() * spinSpeed);
	},

	generateIcons: function(){
		return [
			Core.atlas.find("vbucks-chicken-coop"),
			Core.atlas.find("vbucks-chicken-coop-rotator")
		];
	}
});

// "chicken-coop.description" acts as a warning for players without scripting support.
coop.description = Core.bundle.format("block.vbucks-chicken-coop.real-description", eggChance);
