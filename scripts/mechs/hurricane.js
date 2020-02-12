const entityLib = this.global.entityLib;

/* Config */
const rotateSpeed = 1.45; // Max degrees the mech can rotate every shot attempt
const fireRate = 600; // RPM of each gun

/* Bullet */
const miniVbuck = extend(BasicBulletType, {});
miniVbuck.speed = 7.5;
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

const gun = extendContent(Weapon, "hurricane-gun", {
	load(){}
});
gun.ejectEffect = Fx.shellEjectSmall;
gun.reload = Math.ceil(60 / (fireRate / 60));
gun.shots = fireRate > 720 ? Math.round(fireRate / 720) : 1; // Compensate for >1 tick fire delay, 720 not 360 because 2 of em
gun.length = 4;
gun.width = 6.5;
gun.bullet = miniVbuck;
gun.recoil = 0;

const hurricane = entityLib.extendMech(Mech, "hurricane", [{
	// @Override
	loadAfter(){
		this.rotorRegion = Core.atlas.find(this.name + "-rotor");
		this.gunBarrelRegion = Core.atlas.find(this.name + "-gun-barrel");
		this.bodyRegion = Core.atlas.find(this.name + "-body");
	},

	// @Override
	update(player){
		this.setRotorSpeed(player, Mathf.lerp(this.getRotorSpeed(player), 15, 0.001));
	},

	// @Override
	onShoot(player, weapon, x, y, angle){
		this.rotateBarrel(player, 0.025);
	},

	// @Override
	drawAbove(player, rot){
		Draw.rect(this.bodyRegion, player.x, player.y, rot);
		Draw.rect(this.rotorRegion, player.x, player.y, rot + Time.time() * this.getRotorSpeed(player));
	},

	// @Override
	drawWeapons(player, rot){
		for(var side = -1; side < 2; side += 2){
			this.drawBarrel(player, rot, side, 0);
			this.drawBarrel(player, rot, side, 2);
			this.drawBarrel(player, rot, side, 1);
		}
	},

	drawBarrel(player, rot, side, num){
		const barrel = ((this.getBarrelRotation(player) + num / 3) % 1) * 2;
		const weapon = this.weapons[0];
		const barrelX = Angles.trnsx(rot + 90, weapon.length - Math.abs(barrel - 1), side * (weapon.width + barrel));
		const barrelY = Angles.trnsy(rot + 90, weapon.length - Math.abs(barrel - 1), side * (weapon.width + barrel));
		Draw.rect(this.gunBarrelRegion, player.x + barrelX, player.y + barrelY, rot);
	},

	setRotorSpeed(player, speed){
		var ent = this.getEntity(player);
		ent.rotorSpeed = speed;
		this.setEntity(player, ent);
		return speed;
	},
	getRotorSpeed(player){
		return this.getEntity(player).rotorSpeed || 0;
	},

	rotateBarrel(player, add){
		return this.setBarrelRotation(player, this.getBarrelRotation(player) + add);
	},
	setBarrelRotation(player, rotation){
		var ent = this.getEntity(player);
		ent.barrelRotation = rotation;
		this.setEntity(player, ent);
		return rotation;
	},
	getBarrelRotation(player){
		return this.getEntity(player).barrelRotation || 0;
	}
}]);
hurricane.weapons = [gun, gun];
hurricane.rotationLimit = rotateSpeed;
hurricane.rotationLerp = 0.02;

hurricane.speed = 0.6;
hurricane.buildPower = 0.1;
hurricane.mass = 10;
hurricane.engineColor = Color.valueOf("#7fd5fe");
hurricane.flying = true;
hurricane.health = 500;
hurricane.cellTrnsY = -5;
hurricane.engineOffset = 6;

/* Custom mech spawn animation + name change */
const pad = extendContent(MechPad, "helipad", {/*
Doesn't work because entity.player is ALWAYS null.
Probably because tile.ent() wont cast to mechpad tileentity?
	// @Override
	drawLayer(tile){
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
