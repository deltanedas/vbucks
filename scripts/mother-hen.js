/* Cache */
const black = Color(0);

/* Stuff mech needs */
const friedEgg = extend(BasicBulletType, {});
friedEgg.speed = 5;
friedEgg.damage = 90;
friedEgg.bulletWidth = 12;
friedEgg.bulletHeight = 18;
friedEgg.shootEffect = Fx.shootSmall;
//friedEgg.hitSound = Sounds.flame;
friedEgg.ammoMultiplier = 3;
friedEgg.homingPower = 0.001;
friedEgg.homingRange = 5;
friedEgg.knockback = 0.1;
friedEgg.hitShake = 1;
friedEgg.incendAmount = 20;
friedEgg.bulletSprite = "vbucks-fried-egg";
friedEgg.frontColor = Color.valueOf("#ffeecc");

const eggShell = extend(FlakBulletType, {});
eggShell.speed = 7.5;
eggShell.damage = 5;
eggShell.splashDamageRadius = 50;
eggShell.splashDamage = 10;
eggShell.ammoMultiplier = 3;
eggShell.incendAmount = 20;
eggShell.frontColor = Color.valueOf("#ecaf7c");

const cannon = extendContent(Weapon, "mother-hen-cannon", {});
cannon.ejectEffect = Fx.blastsmoke;
cannon.length = 3;
cannon.bullet = friedEgg;

const flak = extendContent(Weapon, "mother-hen-flak", {});
flak.ejectEffect = Fx.shellEjectBig;
flak.shots = 4;
flak.length = 3;
flak.width = 5.2;
flak.bullet = eggShell;

// Let the player handle cannon ->  flak switching
const multiWeapon = extendContent(Weapon, "mother-hen-multi", {
	// Don't ask
	load: function(){
		print("No!!!!!!");
	},
	loadProperly: function(mech){
		this.region = Core.atlas.find("clear");
		if(mech != null){
			this.parent = mech;
		}
	},

	shoot: function(shooter, x, y, angle, left){
		if(this.parent != null){
			this.bullet = left ? eggShell : friedEgg; // Alternate between flak and cannon reload speed
			if(Vars.net.client()){
				this.shootDirect(shooter, x, y, angle, left);
			}else{
				// WILL NOT WORK FOR GENERIC STUFF!!!!
				// I'm hoping nobody will set a units weapon to this...
				Call.onPlayerShootWeapon(shooter, x, y, angle, left);
			}
			// Handle visual recoil properly
			this.parent.setOffset(left);
		}
	}
});
multiWeapon.reload = 50;
multiWeapon.length = 3;
multiWeapon.alternate = true;
multiWeapon.bullet = friedEgg; // Assumed to be flak at first
multiWeapon.targetDistance = 8 * 64; // Stop it being cross-eyed, 64 tile range

/* Complete rewrite of mech */
const hen = extendContent(Mech, "mother-hen", {
	load: function(){ // YAY I can use load() because it doesn't need super!
		this.weapon.loadProperly(this);
		this.cannon.load();
		this.flak.load();

		this.region = Core.atlas.find(this.name);
		this.legRegion = Core.atlas.find(this.name + "-leg");
		this.baseRegion = Core.atlas.find(this.name + "-base");
		this.cannonRegion = Core.atlas.find(this.name + "-cannon");
		this.flakRegion = Core.atlas.find(this.name + "-flak");
		this.wingsRegion = Core.atlas.find(this.name + "-wings");
		this.headRegion = Core.atlas.find(this.name + "-head");
	},

	updateAlt: function(player){
		// Slowly reduce recoil
		this.flakOffset = Mathf.lerp(this.flakOffset, 0, 0.035);
		this.cannonOffset = Mathf.lerp(this.cannonOffset, 0, 0.03);
	},

	draw: function(player){
		const rotation = player.rotation - 90;
		const flakTotal = this.gunOffsetY - this.flakOffset;
		const cannonTotal = this.gunOffsetY - this.cannonOffset;

		// OffsetX and OffsetY are swapped because sprite is rotated by 1/4
		const flakX = Angles.trnsx(player.rotation, flakTotal, -this.gunOffsetX);
		const cannonX = Angles.trnsx(player.rotation, cannonTotal, this.gunOffsetX);
		const flakY = Angles.trnsy(player.rotation, flakTotal, -this.gunOffsetX);
		const cannonY = Angles.trnsy(player.rotation, cannonTotal, this.gunOffsetX);
		Draw.rect(this.cannonRegion, player.x + cannonX, player.y + cannonY, rotation);
		Draw.rect(this.flakRegion, player.x + flakX, player.y + flakY, rotation);
		Draw.rect(this.wingsRegion, player.x, player.y, rotation);
		Draw.rect(this.headRegion, player.x, player.y, rotation);
	},

	// No more overrides
	setOffset: function(left){
		if(left + "" === "true"){
			this.flakOffset = 1.5;
		}else{
			this.cannonOffset = 2;
		}
	}
});
hen.cannonRegion = null;
hen.flakRegion = null;
hen.wingsRegion = null;
hen.headRegion = null;
hen.gunOffsetX = 9;
hen.gunOffsetY = 5.2;
hen.speed = 0.3;
hen.boostSpeed = 0.2;
hen.buildPower = 0.5;
hen.mass = 20;
hen.engineColor = Color.valueOf("#d62d19");
hen.flying = false;
hen.health = 4000;
hen.weapon = multiWeapon;
hen.cellTrnsY = -6.5;
hen.engineOffset = 7.5;
hen.cannon = cannon;
hen.flak = flak;
hen.cannonOffset = 0;
hen.flakOffset = 0;
hen.turnCursor = false;
/* Custom mech spawn animation + name change */
const silo = extendContent(MechPad, "hen-silo", {/*
Doesn't work because entity.player is ALWAYS null.
Probably because tile.ent() wont cast to mechpad tileentity?
	drawLayer: function(tile){
		const entity = tile.ent();
		print(entity.player);

		if(entity.player != null){
			print("Player isnt null");
			if(!entity.sameMech || entity.player.mech != this.mech){
				print("eeeeeee")
				Draw.rect(Core.atlas.find("vbucks-mother-hen-complete"), tile.drawx(), tile.drawy());

				// Cover mech with a shadow as if it were slowly emerging from the silo.
				Draw.color(black, 1 - entity.progress);
				Draw.rect(Core.atlas.find("vbucks-mother-hen-shadow"), tile.drawx(), tile.drawy());
				Draw.color();
			}else{
				// Draw normally as the player is not constructing a mother hen
				RespawnBlock.drawRespawn(tile, entity.heat, entity.progress, entity.time, entity.player, Mechs.starterMech);
			}
		}
	}
*/});
silo.mech = hen;
silo.update = true;

// If any errors occur in mother hen, these will not be set.
silo.localizedName = Core.bundle.get("block.vbucks-hen-silo.real-name");
silo.description = Core.bundle.get("block.vbucks-hen-silo.real-description");