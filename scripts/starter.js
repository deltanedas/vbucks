const bullets = [
	Bullets.bombOil,
	Bullets.missileSurge,
	Bullets.flakExplosive,
	Bullets.flakGlass
];

const icons = [
	Icon.arrowUpSmall,
	Icon.arrowDownSmall,
	Icon.arrowLeftSmall,
	Icon.arrowRightSmall
];

//create the block type
const starter = extendContent(Block, "starter", {
    //override the method to build configuration
    buildConfiguration(tile, table){
		for(var i = 0; i < 4; i++){
			table.addImageButton(icons[i], Styles.clearTransi, run(() => {
				tile.configure(i);
			})).size(50);
		}
	},

    //override configure event
    configured(tile, player, value){
		for(var b = 0; b < 15; b++){
			print(Calls.createBullet);
			print(Call.createBullet);
			Calls.createBullet(
				bullets[value],
				tile.getTeam(),
				tile.drawx(),
				tile.drawy(),
				Mathf.random(360),
				Mathf.random(0.5, 1.0),
				Mathf.random(0.2, 1.0)
			);
		}
		tile.entity.cons.trigger();
	}
});
starter.configurable = true;
starter.category = Category.turret;
starter.buildVisibility = BuildVisibility.shown
starter.localizedName = "Starter";