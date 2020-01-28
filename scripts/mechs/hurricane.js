print(this.global);
print(this.global.entityLib);
print(this.global.entityLib.Mech);

const entityLib = this.global.entityLib;

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
gun.length = 0;
gun.width = 6.5;
gun.bullet = miniVbuck;
gun.alternate = true;

const hurricane = extendContent(entityLib.Mech, "hurricane", {
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
	onShoot: function(weapon){
		this.rotateBarrel(0.01);
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
		const weapon = this.weapons[0];
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
		ent.barrelRotation += rotation;
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
hurricane.weapons = [gun, gun];

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
