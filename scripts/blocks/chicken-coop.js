/* Config */
const eggChance = 1 / 7000; // Same odds as rare egg in EggBot.
const spinSpeed = 2;
const feathersSpawned = 20;
const featherRotations = 5; // Times a feather rotates before despawning, set to 60 to disable rotation.
const featherLifetime = 2.5; // Seconds before a feather despawns.
const spam = true; /*
	Print "egg" when an egg is spawned like EggBot.
	Also creates a short toast.
*/

/* Stuff used by Chicken Coop */

function toast(text, lifetime){
	if(Vars.ui !== null){ // Prevent crash on server
		Vars.ui.showInfoToast(text, lifetime);
	}
}

featherLifetime *= 60;
const feather = extend(BasicBulletType, {
	// @Override
	load(){
		this.frontRegion = Core.atlas.find("vbucks-feather");
	},

	// @Override
	draw(bullet){
		Draw.rect(this.frontRegion, bullet.x, bullet.y, bullet.rot() * (360 / (featherLifetime / featherRotations)));
	},

	// @Override
	despawned(bullet){}
});
feather.speed = 1;
feather.damage = 0;
feather.hitTiles = false;
feather.lifetime = featherLifetime;
feather.collidesTiles = false;
feather.collidesAir = false;
feather.collides = false;

/* The big boy himself */
const coop = extendContent(Block, "chicken-coop", {
	update(tile){
		if(tile.entity.cons.valid()){
			tile.entity.block.consumes.get(ConsumeType.power).trigger(tile.entity);
			if(Mathf.chance(eggChance)){
				tile.entity.block.consumes.get(ConsumeType.item).trigger(tile.entity);
				if(spam){
					print("egg");
					toast("egg", 1.5);
				}

				for(var i = 0; i < feathersSpawned; i++){
					Calls.createBullet(
						feather,
						tile.getTeam(),
						tile.drawx(),
						tile.drawy(),
						Mathf.random(360),
						Mathf.random(0.5, 1.0),
						Mathf.random(0.2, 1.0)
					);
				}

				// Add rare eeg
				const egg = Vars.content.getByName(ContentType.item, "vbucks-egg");
				tile.entity.items.add(egg, 1);
				this.tryDump(tile, egg);
			}
		}
	},

	// @Override
	drawLayer(tile){
		Draw.rect(Core.atlas.find("vbucks-chicken-coop-rotator"), tile.drawx(), tile.drawy(), Time.time() * spinSpeed);
	},

	// @Override
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
