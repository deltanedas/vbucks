/* Config */
const eggChance = 7000; // Same odds as rare egg in EggBot.
const spinSpeed = 2;
const feathersSpawned = 20;
const featherRotations = 5; // Times a feather rotates before despawning, set to 60 to disable rotation.
const featherLifetime = 2.5; // Seconds before a feather despawns.
const spam = true; /*
	Print "egg" when an egg is spawned like EggBot.
	Also creates a 3 second toast.
*/

/* Stuff used by Chicken Coop */

function toast(text, lifetime){
	if(Vars.ui !== null){ // Prevent crash on server
		Vars.ui.showInfoToast(text, lifetime);
	}
}

/*print(BulletType);
featherLifetime *= 60;
const feather = extendContent(BulletType, 1, 0, {
	draw(bullet){
		Draw.rect(Core.atlas.find("vbucks-feather"), bullet.x, bullet.y, bullet.rot() * (360 / (featherLifetime / featherRotations)));
	},

	despawned(bullet){}
});
feather.hitTiles = false;
feather.lifetime = featherLifetime;
feather.collidesTiles = false;
feather.collidesAir = false;
feather.collides = false;*/
// idk how to extend bullettype it doesnt work so i cant make feather particles on egg creation

/* The big boy himself */
const coop = extendContent(Block, "chicken-coop", {
	update(tile){
		if(tile.entity.cons.valid()){
			tile.entity.block.consumes.get(ConsumeType.power).trigger(tile.entity);
			if(Mathf.random(0, eggChance) < 1){
				tile.entity.block.consumes.get(ConsumeType.item).trigger(tile.entity);
				if(spam){
					print("egg");
					toast("egg", 1.5);
				}

				/*for(var i = 0; i < feathersSpawned; i++){
					Calls.createBullet(
						feather,
						tile.getTeam(),
						tile.drawx(),
						tile.drawy(),
						Mathf.random(360),
						Mathf.random(0.5, 1.0),
						Mathf.random(0.2, 1.0)
					);
				}*/

				// Add rare eeg
				const egg = Vars.content.getByName(ContentType.item, "vbucks-egg");
				tile.entity.items.add(egg, 1);
				this.tryDump(tile, egg);
			}
		}
	},

	draw(tile){
		Draw.rect(Core.atlas.find("vbucks-chicken-coop"), tile.drawx(), tile.drawy());
		Draw.color();
	},
	drawLayer(tile){
		Draw.rect(Core.atlas.find("vbucks-chicken-coop-rotator"), tile.drawx(), tile.drawy(), Time.time() * spinSpeed);
	},

	generateIcons(){
		return [
			Core.atlas.find("vbucks-chicken-coop"),
			Core.atlas.find("vbucks-chicken-coop-rotator")
		];
	}
});

// .name and .description act as warnings for players without scripting support.
coop.ticksActive = 0;
coop.localizedName = Core.bundle.get("block.vbucks-chicken-coop.real-name");
coop.description = Core.bundle.format("block.vbucks-chicken-coop.real-description", eggChance);
coop.layer = Layer.turret;
