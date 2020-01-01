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
friedEgg.recoil = 0;
friedEgg.incendAmount = 20;
friedEgg.bulletSprite = "vbucks-fried-egg";
friedEgg.frontColor = Color.valueOf("#ffeecc");

const eggShell = extend(FlakBulletType, {});
eggShell.speed = 7.5;
eggShell.damage = 20;
eggShell.splashDamageRadius = 50;
eggShell.splashDamage = 40;
eggShell.ammoMultiplier = 3;
eggShell.incendAmount = 20;
eggShell.recoil = 500;
eggShell.frontColor = Color.valueOf("#ecaf7c");

const cannon = extendContent(Weapon, "mother-hen-cannon", {});
cannon.length = 1.5;
cannon.reload = 60;
cannon.bullet = friedEgg;

const flak = extendContent(Weapon, "mother-hen-flak", {});
flak.length = 1.5;
flak.reload = 40;
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
		print("Parent is " + this.parent);
		if(this.parent != null){
			const current = left ? friedEgg : eggShell;
			this.bullet = left ? eggShell : friedEgg; // Alternate between flak and cannon reload speed
			if(Vars.net.client()){
				this.shootDirect(shooter, x, y, angle, left);
			}else{
				// WILL NOT WORK FOR GENERIC STUFF!!!!
				// I'm hoping nobody will set a units weapon to this...
				Call.onPlayerShootWeapon(shooter, x, y, angle, left);
			}
			// Handle visual recoil properly
			this.parent.setOffset(left ? 1 : 0, current.recoil);
		}
	}
});
multiWeapon.alternate = true;
multiWeapon.bullet = friedEgg; // Assumed to be flak at first

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
		this.flakOffset = Mathf.lerp(this.flakOffset, 0, 0.02);
		this.cannonOffset = Mathf.lerp(this.cannonOffset, 0, 0.015);
	},

	draw: function(player){
		const rotation = player.rotation - 90;
		const flakTotal = this.gunOffsetY - this.flakOffset;
		const cannonTotal = this.gunOffsetY - this.cannonOffset;

		// OffsetX and OffsetY are swapped because sprite is rotated by 1/4
		const flakX = Angles.trnsx(player.rotation, this.gunOffsetY, -this.gunOffsetX);
		const cannonX = Angles.trnsx(player.rotation, this.gunOffsetY, this.gunOffsetX);
		const flakY = Angles.trnsy(player.rotation, this.gunOffsetY, -this.gunOffsetX);
		const cannonY = Angles.trnsy(player.rotation, this.gunOffsetY, this.gunOffsetX);
		Draw.rect(this.cannonRegion, player.x + cannonX, player.y + cannonY, rotation);
		Draw.rect(this.flakRegion, player.x + flakX, player.y + flakY, rotation);
		Draw.rect(this.wingsRegion, player.x, player.y, rotation);
		Draw.rect(this.headRegion, player.x, player.y, rotation);
	},

	// No more overrides
	setOffset: function(left, recoil){
		if(left == 1){
			this.cannonOffset = recoil;
		}else{
			this.flakOffset = recoil;
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
/* Custom mech spawn animation + name change */
const silo = extendContent(MechPad, "hen-silo", {});
silo.mech = hen;

// If any errors occur in mother hen, these will not be set.
silo.localizedName = Core.bundle.get("block.vbucks-hen-silo.real-name");
silo.description = Core.bundle.get("block.vbucks-hen-silo.real-description");