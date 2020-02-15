const ticksRequired = 60 * 60 * 15; // 15 minutes at 60 TPS, sorry zac!
const ticks = 0;

const borer = extendContent(GenericCrafter, "bread-borer", {
	update(tile){
		if(tile.entity.cons.valid()){
			print("TODO");
			if(++ticks > ticksRequired){
				print("YAY");
			}
		}
	}
});
borer.localizedName = Core.bundle.get("block.vbucks-bread-borer.real-name");
borer.description = Core.bundle.get("block.vbucks-bread-borer.real-description");

Events.on(EventType.PlayEvent, run(() => {
	print("Play!");
	ticks = Vars.world.getMap().tags.get("vbucks-borer-ticks", "0") - 0;
	print("Ticks are " + ticks);
}));

Events.on(EventType.SaveEvent, run(() => {
	print("Save!!!");
	Vars.world.getMap().tags.put("vbucks-borer-ticks", ticks);
	print("set ticks to " + Vars.world.getMap().tags.get("vbucks-borer-ticks", "0"));
}));