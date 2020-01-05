/* Config */
const yolkChance = 5; // 1 in X chance every shot to shoot an extra yolk bullet.
const rotateSpeed = 0.45; // Max degrees the mech can rotate every tick

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
friedEgg.homingPower = 1;
friedEgg.homingRange = 25;
friedEgg.knockback = 0.1;
friedEgg.hitShake = 1;
friedEgg.incendAmount = 20;
friedEgg.bulletSprite = "vbucks-fried-egg";
friedEgg.frontColor = Color.valueOf("#ffeecc");

const eggShell = extend(FlakBulletType, {});
eggShell.speed = 7.5;
eggShell.damage = 15;
eggShell.homingPower = 0.001;
eggShell.homingRange = 25;
eggShell.splashDamageRadius = 40;
eggShell.splashDamage = 30;
eggShell.ammoMultiplier = 3;
eggShell.incendAmount = 20;
eggShell.frontColor = Color.valueOf("#ecaf7c");

// Doesn't work idk why
/*const yolkStatus = extendContent(StatusEffect, "egged", {
	init: function(){
		this.trans(StatusEffects.shocked, StatusEffect.TransitionHandler({
			handle: function(unit, time, newTime, result) {
				unit.damage(10); // Less conductive than water
				if(unit.getTeam() == state.rules.waveTeam){
					Events.fire(Trigger.shock);
				} // Can't use because Events isnt allowed :(
				this.result.set(this, time);
			}
		}));
		this.opposite(StatusEffects.burning);
	}
});
yolkStatus.speedMultiplier = 0.25;
yolkStatus.effect = Fx.wet;
yolkStatus.color = Color.valueOf("#dac114");*/

const yolk = extend(MissileBulletType, {});
yolk.speed = 3;
yolk.damage = 10;
yolk.splashDamageRadius = 30;
yolk.splashDamage = 10;
yolk.ammoMultiplier = 3;
//yolk.status = yolkStatus;
yolk.status = StatusEffects.tarred;
yolk.frontColor = Color.valueOf("#dac114");

const cannon = extendContent(Weapon, "mother-hen-cannon", {});
cannon.ejectEffect = Fx.blastsmoke;
cannon.length = 3;
cannon.width = 5.2;
cannon.bullet = friedEgg;

const flak = extendContent(Weapon, "mother-hen-flak", {});
flak.ejectEffect = Fx.shellEjectBig;
flak.length = 3;
flak.width = 5.2;
flak.bullet = eggShell;

// Let the player handle cannon ->  flak switching
const multiWeapon = extendContent(Weapon, "mother-hen-multi", {
	// Don't ask
	// @Override
	load: function(){
		print("No!!!!!!");
	},
	loadProperly: function(mech){
		this.region = Core.atlas.find("clear");
		if(mech != null){
			this.parent = mech;
		}
	},

	// Do turning slowly like a tank
	// @Override
	update: function(shooter, pX, pY){
		var left = false;
		do{
			var pos = Vec2(pX, pY);
			pos.sub(shooter.getX(), shooter.getY());
			if(pos.len() < this.minPlayerDist){
				pos.setLength(this.minPlayerDist);
			}
			var cx = pos.x + shooter.getX(), cy = pos.y + shooter.getY();

			var ang = pos.angle();
			pos.setAngle(ang);
			pos.trns(ang - 90, this.width * Mathf.sign(left), this.length + Mathf.range(this.lengthRand));

			// "realUpdate" to avoid bs infinite recursion
			this.realUpdate(shooter, pos.x, pos.y, Angles.angle(shooter.getX() + pos.x, shooter.getY() + pos.y, cx, cy), left);
			left = !left;
		}while(left);
	},

	realUpdate: function(shooter, x, y, angle, left){
		if(shooter.getTimer().get(shooter.getShootTimer(left), this.reload)){
			if(this.alternate){
				shooter.getTimer().reset(shooter.getShootTimer(!left), this.reload / 2);
			}

			this.shoot(shooter, x, y, angle, left);
		}
	},

	// @Override
	shoot: function(shooter, x, y, angle, left){
		if(this.parent != null){
			const lastRotation = this.parent.getRotation();

			// Prevent wrapping around at +X
			if(Math.abs(angle - lastRotation) > 180){
				angle += 360;
				print("Angle " + angle + " - " + lastRotation);
			}
			// Limit rotation speed
			if(Math.abs(angle - lastRotation) > rotateSpeed){
				// Decide which direction to turn
				if((angle - this.parent.getBaseRotation()) > lastRotation){
					angle = rotateSpeed;
				}else{
					angle = -rotateSpeed;
				}
				angle += lastRotation;
			}
			this.parent.setRotation(angle);

			this.bullet = left ? eggShell : friedEgg; // Alternate between flak and cannon reload speed
			const shootYolk = Mathf.random(0, yolkChance) < 1;
			if(Vars.net.client()){
				this.shootDirect(shooter, x, y, angle, left);
				if(shootYolk){
					this.bullet = yolk;
					this.shootDirect(shooter, x, y, angle, false);
				}
			}else{
				// WILL NOT WORK FOR GENERIC STUFF!!!!
				// I'm hoping nobody will set a units weapon to this...
				Call.onPlayerShootWeapon(shooter, x, y, angle, left);
				if(shootYolk){
					this.bullet = yolk;
					Call.onPlayerShootWeapon(shooter, x, y, angle, false);
				}
			}
			// Handle visual recoil properly
			this.parent.setOffset(left);
		}
	}
});
multiWeapon.reload = 15;
multiWeapon.length = 3;
multiWeapon.alternate = true;
multiWeapon.bullet = friedEgg; // Assumed to be flak at first
multiWeapon.width = 5.2;

/* Complete rewrite of mech */
const hen = extendContent(Mech, "mother-hen", {
	// @Override
	load: function(){ // YAY I can use load() because it doesn't need super!
		this.weapon.loadProperly(this);
		this.cannon.load();
		this.flak.load();

		this.region = Core.atlas.find("clear");
		this.legRegion = Core.atlas.find(this.name + "-leg");
		this.baseRegion = Core.atlas.find(this.name + "-base");
		this.cannonRegion = Core.atlas.find(this.name + "-cannon");
		this.flakRegion = Core.atlas.find(this.name + "-flak");
		this.wingsRegion = Core.atlas.find(this.name + "-wings");
		this.headRegion = Core.atlas.find(this.name + "-head");
	},

	// @Override
	updateAlt: function(player){
		// Rotation stuff
		if(this.targetRotation === null){
			this.targetRotation = player.rotation;
		}
		this.targetRotation = Mathf.lerp(this.targetRotation, player.rotation, 0.02);
		this._baseRotation = player.baseRotation;

		// Slowly reduce recoil
		this.flakOffset = Mathf.lerp(this.flakOffset, 0, 0.035);
		this.cannonOffset = Mathf.lerp(this.cannonOffset, 0, 0.03);
	},

	// @Override
	draw: function(player){
		const rotation = this.targetRotation - 90;
		const flakTotal = this.gunOffsetY - this.flakOffset;
		const cannonTotal = this.gunOffsetY - this.cannonOffset;

		// OffsetX and OffsetY are swapped because sprite is rotated by 1/4
		const flakX = Angles.trnsx(this.targetRotation, flakTotal, -this.gunOffsetX);
		const cannonX = Angles.trnsx(this.targetRotation, cannonTotal, this.gunOffsetX);
		const flakY = Angles.trnsy(this.targetRotation, flakTotal, -this.gunOffsetX);
		const cannonY = Angles.trnsy(this.targetRotation, cannonTotal, this.gunOffsetX);
		Draw.rect(this.cannonRegion, player.x + cannonX, player.y + cannonY, rotation);
		Draw.rect(this.flakRegion, player.x + flakX, player.y + flakY, rotation);
		Draw.rect(this.wingsRegion, player.x, player.y, rotation);
		Draw.rect(this.headRegion, player.x, player.y, rotation);
	},

	// @Override
	drawStats: function(player){
		const health = player.healthf();
		Draw.color(Color.black, player.getTeam().color, health + Mathf.absin(Time.time(), health * 5, 1 - health));
		Draw.rect(player.getPowerCellRegion(),
			player.x + Angles.trnsx(this.targetRotation, this.cellTrnsY, 0),
			player.y + Angles.trnsy(this.targetRotation, this.cellTrnsY, 0),
			this.targetRotation - 90);
		Draw.reset();
		//player.drawBackItems(player.getItemtime(), player.isLocal);
		//player.drawLight();
	},

	setOffset: function(left){
		if(left){
			this.flakOffset = 1.5;
		}else{
			this.cannonOffset = 2;
		}
	},

	setRotation: function(rotation){
		this.targetRotation = rotation;
	},

	getRotation: function(){
		return this.targetRotation;
	},

	getBaseRotation: function(){
		return this._baseRotation;
	}
});
hen.cannonRegion = null;
hen.flakRegion = null;
hen.wingsRegion = null;
hen.headRegion = null;
hen.gunOffsetX = 9;
hen.gunOffsetY = 5.2;
hen.speed = 0.3;
hen.boostSpeed = 0.35;
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
hen.targetRotation = null;
hen._baseRotation = 0;

/* Custom mech spawn animation + name change */
const silo = extendContent(MechPad, "hen-silo", {/*
Doesn't work because entity.player is ALWAYS null.
Probably because tile.ent() wont cast to mechpad tileentity?
	// @Override
	drawLayer: function(tile){
		const entity = tile.ent();
		print(entity.player);

		if(entity.player != null){
			print("Player isnt null");
			if(!entity.sameMech || entity.player.mech != this.mech){
				print("eeeeeee")
				Draw.rect(Core.atlas.find("vbucks-mother-hen"), tile.drawx(), tile.drawy());

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