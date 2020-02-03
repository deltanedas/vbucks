const entityLib = this.global.entityLib;

/* Config */
const yolkChance = 1 / 5; // 1 in X chance every shot to shoot an extra yolk bullet.
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
friedEgg.hitSound = Sounds.flame;
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
eggShell.splashDamage = 20;
eggShell.ammoMultiplier = 3;
eggShell.incendAmount = 20;
eggShell.frontColor = Color.valueOf("#ecaf7c");

// Doesn't work idk why
/*const yolkStatus = extendContent(StatusEffect, "egged", {
	init(){
		this.initblock = run(() => {});
		print("yolk init")
		this.trans(StatusEffects.shocked, StatusEffect.TransitionHandler({
			handle(unit, time, newTime, result) {
				unit.damage(10); // Less conductive than water
				if(unit.getTeam() == Vars.state.rules.waveTeam){
					Events.fire(EventType.Trigger.shock);
				}
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

const realLoad = {
	load(){
		print("my name is " + this.name + " (manually added prefix)")
		this.region = Core.atlas.find(this.name);
	}
};

const cannon = extendContent(Weapon, "vbucks-mother-hen-cannon", realLoad);
cannon.ejectEffect = Fx.blastsmoke;
cannon.length = 5.2;
cannon.width = 9;
cannon.bullet = friedEgg;
cannon.recoil = 2;
cannon.reload = 15;

const flak = extendContent(Weapon, "vbucks-mother-hen-flak", realLoad);
flak.ejectEffect = Fx.shellEjectMedium;
flak.length = 5.2;
flak.width = 9;
flak.bullet = eggShell;
flak.recoil = 1.5;
flak.reload = 12;
flak.shots = 2;

/* Complete rewrite of mech */
const hen = entityLib.extendMech(Mech, "mother-hen", [{
	// @Override
	loadAfter(){
		print("my name is " + this.name + " (automatic prefix)")
		this.legRegion = Core.atlas.find(this.name + "-leg");
		this.baseRegion = Core.atlas.find(this.name + "-base");
		this.wingsRegion = Core.atlas.find(this.name + "-wings");
		this.headRegion = Core.atlas.find(this.name + "-head");
	},

	// @Override
	onShoot(player, num, x, y, angle){
		if(Mathf.chance(yolkChance)){
			const tmp = this.weapon;
			const weapon = this.weapons[num];
			this.weapon = weapon;
			const old = weapon.bullet;
			this.weapon.bullet = yolk;
			if(Vars.net.client()){
				tmp.shootDirect(player, x, y, angle, false);
			}else{
				Call.onPlayerShootWeapon(player, x, y, angle, false);
			}
			weapon.bullet = old;
			this.weapon = tmp;
		}
	},

	// Players draws legs automatically, how helpful!

	// @Override
	drawAbove(player, rot){
		Draw.rect(this.wingsRegion, player.x, player.y, rot);
		Draw.rect(this.headRegion, player.x, player.y, rot);
	}
}]);
hen.weapons = [flak, cannon];
hen.speed = 0.3;
hen.boostSpeed = 0.35;
hen.buildPower = 0.5;
hen.mass = 20;
hen.engineColor = Color.valueOf("#d62d19");
hen.flying = false;
hen.health = 4000;
hen.cellTrnsY = -6.5;
hen.engineOffset = 7.5;
hen.rotationLimit = rotateSpeed;

/* Custom mech spawn animation + name change */
const silo = extendContent(MechPad, "hen-silo", {/*
Doesn't work because entity.player is ALWAYS null.
Probably because tile.ent() wont cast to mechpad tileentity?
	// @Override
	drawLayer(tile){
		const entity = tile.ent();
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
	}*/
});
silo.mech = hen;
silo.update = true;

// If any errors occur in mother hen, these will not be set.
silo.localizedName = Core.bundle.get("block.vbucks-hen-silo.real-name");
silo.description = Core.bundle.get("block.vbucks-hen-silo.real-description");
