/* Config */
const rotateSpeed = 1.45; // Max degrees the mech can rotate every shot attempt
const fireRate = 600; // RPM of each gun

/* Bullet */
const miniVbuck = extend(BasicBulletType, {});
miniVbuck.speed = 10;
miniVbuck.damage = 16;
miniVbuck.bulletWidth = 2;
miniVbuck.bulletHeight = 3;
miniVbuck.shootEffect = Fx.shootSmall;
miniVbuck.smokeEffect = Fx.coreLand;
miniVbuck.homingPower = 3;
miniVbuck.homingRange = 5;
miniVbuck.knockback = 0;
miniVbuck.hitShake = 0;
miniVbuck.bulletSprite = "vbucks-vbuck-bullet";
miniVbuck.frontColor = Color.valueOf("#ffdddd");
miniVbuck.lightining = 3;
miniVbuck.lightningLength = 1;

const gun = extendContent(Weapon, "hurricane-gun", {});
gun.ejectEffect = Fx.blastsmoke;
gun.length = 3;
gun.width = 0;
gun.bullet = miniVbuck;
gun.alternate = true;

const hurrcane = extendContent(entityLib.Mech, {
	loadAfter: function(){
		this.rotorRegion = Core.atlas.find(this.name + "-rotor");
		this.gunBarrelRegion = Core.atlas.find(this.name + "-gun-barrel");
		this.bodyRegion = Core.atlas.find(this.name + "-body");
	},

	// @Override
	update: function(player){
		this.rotorSpeed(player, Mathf.lerp(this.rotorSpeed(player), 15, 0.001));
	},

	// @Override
	drawAbove: function(player, rot){
		Draw.rect(this.bodyRegion, player.x, player.y, rot);
		Draw.rect(this.rotorRegion, player.x, player.y, rot + Time.time() * this.rotorSpeed(player));
	},

	// @Override
	drawWeapons: function(player, rot){
		for(var side = -1; side < 2; side += 2){
			this.drawBarrel(player, rot, side, 0);
			this.drawBarrel(player, rot, side, 2);
			this.drawBarrel(player, rot, side, 1);
		}
	},

	drawBarrel: function(player, rot, side, num){
		const barrel = (this.rotateBarrel(player) + num / 3) % 1;
		const barrelX = Angles.trnsx(rot, weapon.length - Math.abs(barrel - 0.5), side * (weapon.width + barrel));
		const barrelY = Angles.trnsy(rot, weapon.length - Math.abs(barrel - 0.5), side * (weapon.width + barrel));
		Draw.rect(this.gunBarrelRegion, player.x + barrelX, player.y + barrelY, rot - 90);
	},

	rotorSpeed: function(player, speed){
		var ent = this.entity(player);
		ent.rotorSpeed = speed;
		this.entity(player, ent);
		return speed;
	},
	rotorSpeed: function(player){
		return this.entity(player).rotorSpeed;
	},

	rotateBarrel: function(player, rotation){
		var ent = this.entity(player);
		ent.barrelRotation = rotation;
		this.entity(player, ent);
		return rotation;
	},
	rotateBarrel: function(player){
		return this.entity(player).barrelRotation;
	}
});
hurricane.weapon.reload = 60 / (fireRate / 60);
hurricane.weapon.length = 4;
hurricane.weapon.width = 6.5;
hurricane.weapon.bullet = miniVbuck;
hurricane.weapon.shots = Math.round(fireRate / 360); // Compensate for >1 tick fire delay
hurricane.weapons = [gun];

/* Complete rewrite of mech */
const hurricane = extendContent(Mech, "hurricane", {
	// @Override
	load: function(){ // YAY I can use load() because it doesn't need super!
		this.weapon.loadProperly(this);
		this.gun.load();

		this.region = Core.atlas.find("clear");
		this.rotorRegion = Core.atlas.find(this.name + "-rotor");
		this.gunBarrelRegion = Core.atlas.find(this.name + "-gun-barrel");
		this.bodyRegion = Core.atlas.find(this.name + "-body");
	},

	// @Override
	updateAlt: function(player){
		// Rotation stuff
		if(this.targetRotation === null){
			this.targetRotation = player.rotation;
		}
		this.targetRotation = Mathf.lerp(this.targetRotation, player.rotation, 0.03);
		this.rotorSpeed = Mathf.lerp(this.rotorSpeed, 15, 0.001);
	},

	// @Override
	draw: function(player){
		const rotation = this.targetRotation - 90;
		this.drawGuns(player);
		Draw.rect(this.bodyRegion, player.x, player.y, rotation);

		const tmp = player.rotation;
		player.rotation = this.targetRotation;
		player.drawLight();
		player.drawBackItems();
		player.rotation = tmp;

		Draw.rect(this.rotorRegion, player.x, player.y, rotation + Time.time() * this.rotorSpeed);
	},

	drawGuns: function(player){
		for(var side = -1; side < 2; side += 2){
			this.drawBarrel(player, side, 0);
			this.drawBarrel(player, side, 2);
			this.drawBarrel(player, side, 1);
		}
	},

	drawBarrel: function(player, side, num){
		const barrel = (this._barrelRotation + num / 3) % 1;
		const barrelX = Angles.trnsx(this.targetRotation, this.gunOffsetY - Math.abs(barrel - 0.5), side * (this.gunOffsetX + barrel));
		const barrelY = Angles.trnsy(this.targetRotation, this.gunOffsetY - Math.abs(barrel - 0.5), side * (this.gunOffsetX + barrel));
		Draw.rect(this.gunBarrelRegion, player.x + barrelX, player.y + barrelY, this.targetRotation - 90);
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
	},

	rotateBarrel: function(){
		this._barrelRotation = this._barrelRotation + 0.1;
	},

	setRotation: function(rotation){
		this.targetRotation = rotation;
	},

	getRotation: function(){
		return this.targetRotation;
	}
});
hurricane.rotorRegion = null;
hurricane.gunBarrelRegion = null;
hurricane.bodyRegion = null;
hurricane.speed = 0.6;
hurricane.buildPower = 0.1;
hurricane.mass = 10;
hurricane.engineColor = Color.valueOf("#7fd5fe");
hurricane.flying = true;
hurricane.health = 500;
hurricane.weapon = multiWeapon;
hurricane.cellTrnsY = -5;
hurricane.engineOffset = 6;

hurricane.gun = gun;
hurricane._barrelRotation = 0;
hurricane.rotorSpeed = 0;
hurricane.targetRotation = null;
hurricane.gunOffsetX = 6.5;
hurricane.gunOffsetY = 4;

/* Custom mech spawn animation + name change */
const pad = extendContent(MechPad, "helipad", {/*
Doesn't work because entity.player is ALWAYS null.
Probably because tile.ent() wont cast to mechpad tileentity?
	// @Override
	drawLayer: function(tile){
		const entity = tile.ent();
		if(entity.player != null){
			print("Player isnt null");
			if(!entity.sameMech || entity.player.mech != this.mech){
				print("eeeeeee")
				Draw.rect(Core.atlas.find("vbucks-hurricane"), tile.drawx(), tile.drawy());
				// Cover mech with a shadow as if it were slowly emerging from the silo.
				Draw.color(black, 1 - entity.progress);
				Draw.rect(Core.atlas.find("vbucks-hurricane-shadow"), tile.drawx(), tile.drawy());
				Draw.color();
			}else{
				// Draw normally as the player is not constructing a mother hurricane
				RespawnBlock.drawRespawn(tile, entity.heat, entity.progress, entity.time, entity.player, Mechs.starterMech);
			}
		}
	}*/
});
pad.mech = hurricane;
pad.update = true;

// If any errors occur in mother hurricane, these will not be set.
pad.localizedName = Core.bundle.get("block.vbucks-helipad.real-name");
pad.description = Core.bundle.get("block.vbucks-helipad.real-description");
