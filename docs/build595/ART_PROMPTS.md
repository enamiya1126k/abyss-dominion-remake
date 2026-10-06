# Build595 painted foreground assets

Generated with the built-in image_gen tool. All 11 sources requested transparent backgrounds. Production exports only trim transparent padding, resize and encode WebP; original generated PNGs are preserved. No external stock assets were used for these new files.

Runtime preloads/decodes the current terrain plus shared sprites. Terrain ledges are assembled once into a bounded canvas cache. No full-size generated PNG is loaded during play.

## grass

Asset: `assets/runners595/grass.webp` · 117,810 bytes · SHA256 `c294325b8702771cb10fee55f68900dd30d0e1c5543b844fb19e13717ce57647`

Use case: stylized-concept. Asset type: production foreground terrain sprite for a premium 2D side scrolling fantasy platform game.
Create ONE isolated wide horizontal floating ledge of lush emerald grass over richly painted ochre earth and jagged rounded rocks. Orthographic straight-on SIDE ELEVATION, level walkable top. Exquisite hand-painted game art, substantial sculpted volume, moss tufts and a few tiny roots, bright readable edges, crisp small-scale silhouettes. The rectangular main ledge has width about 3 times its height; straight horizontal upper collision line, shallow grass tufts only. Dense earth fills the entire front face, no hole. Continuous earthy center useful for tiling. Left and right natural rock edges. Center the single object, fill most of a wide canvas. Genuine transparent background, no ground shadow outside sprite, no scene, no sky, no characters, no text, no border. Warm light from upper left. Original art; not existing game assets.

## ruin

Asset: `assets/runners595/ruin.webp` · 82,666 bytes · SHA256 `bff43e710789fd114454e46267fc81ac693eab8ddf553e85bc741372218ed7f2`

Use case: stylized-concept. Asset type: production terrain sprite for a premium 2D side scrolling fantasy platform game.
Create ONE isolated wide horizontal ledge of sunlit weathered sandstone, ancient warm golden stone blocks and a thin pale sandy/mossy flat upper rim. Orthographic straight-on SIDE ELEVATION, perfectly level walkable top. Rich hand-painted fantasy game art, sculpted rounded worn stone, fissures, layered amber shadows and polished highlights. Width about 3 times its height. Dense continuous rock fills entire front face, no hole, natural weathered left/right edges and shallow chipped lower edge. Center the single object filling most of a wide canvas. Genuine transparent background, no ground shadow outside sprite, no scene, no sky, no characters, no text, no symbols, no frame. Warm light from upper left. Suitable for coastal islands and old castle platforms.

## ice

Asset: `assets/runners595/ice.webp` · 93,246 bytes · SHA256 `07b709f283d64603bb407648671436931d22cdd36d9efdb971e9f4d9d6f3f63b`

Use case: stylized-concept. Asset type: production terrain sprite for a premium 2D side scrolling fantasy platform game.
Create ONE isolated wide horizontal ledge of translucent blue ice over blue-violet crystal rock with a thin snowy level top. Orthographic straight-on SIDE ELEVATION, perfectly level walkable top. Highly polished hand-painted fantasy game art, sculpted facets, luminous azure inner cracks, frosty edges and few short icicles beneath. Width about 3 times its height. Dense solid ice/crystal fills entire face, no hole. Natural sculpted left/right edges. Center the single object and fill most of a wide canvas. Genuine transparent background, no external floor shadow, no background scene, no sky, no characters, no text, no frame. Cool light from upper left. Readable at small sizes, original game asset.

## lava

Asset: `assets/runners595/lava.webp` · 82,426 bytes · SHA256 `4ca6e8803f00c663c29985bb6db4b9a12812aed55e3915f5f7f1cd5eaa253054`

Use case: stylized-concept. Asset type: production terrain sprite for a premium 2D side scrolling fantasy platform game.
Create ONE isolated wide horizontal ledge of dark obsidian and violet basalt with luminous orange lava veins, a thin flat worn copper-red top ridge. Orthographic straight-on SIDE ELEVATION, perfectly level walkable top. Highly polished hand-painted fantasy game art, sculpted craggy rock chunks, layered dark purple shadows and fiery fissures. Width about 3 times its height. Dense solid rock fills the entire face, no hole. Natural broken left/right edges, a few glowing chips along the underside. Center the single object filling most of a wide canvas. Genuine transparent background, no external ground shadow, no scenery, no sky, no characters, no text, no frame. Upper-left warm light. Original foreground game asset with clean silhouette.

## beetle

Asset: `assets/runners595/beetle.webp` · 10,354 bytes · SHA256 `3c379de25674443bff51b35da458b7e0520373a88f1cf75a5202fa0186dee5ec`

Use case: stylized-concept. Asset type: transparent enemy sprite, production 2D side scrolling fantasy game.
One squat armored beetle monster facing RIGHT in full side profile, its whole body visible. Rounded dark crimson and bronze shell, layered carved plates, two short mandibles, determined glowing amber eye, six small sturdy articulated legs underneath. Grounded walking pose. Original hand-painted fantasy game art with polished sculpted shading and a crisp silhouette, rich readable forms at 48 pixels tall. Smooth rounded top that the player can stomp; no spikes on the back. Upper left warm key light. Isolated centered single creature, fills most of a square canvas. Genuine transparent background, no cast floor shadow, no other objects, no words, no label, no scenery.

## bat

Asset: `assets/runners595/bat.webp` · 10,530 bytes · SHA256 `74d1273e5faad2147abb6aa6afb374f54741d08c50e7f60f0f7f7468d31f7583`

Use case: stylized-concept. Asset type: transparent airborne enemy sprite for a production 2D side scrolling fantasy platformer.
One small mischievous bat gargoyle imp, facing RIGHT in side three-quarter profile, floating with broad wings spread upward, readable silhouette. Deep violet stone skin, teal edge light, warm amber eyes, tiny feet tucked under round body. Original polished hand-painted fantasy game art, charming but dangerous, shaded sculpted details and crisp large forms that work at 50 pixels wide. Isolated single creature centered filling a square canvas, all wing tips visible. Genuine transparent background; no scene, no ground shadow, no text, no frame.

## fire

Asset: `assets/runners595/fire.webp` · 16,072 bytes · SHA256 `272d192bf73cf972bc5b18141e1e959ce8f64902e712135768a984b22ad5cb48`

Use case: stylized-concept. Asset type: transparent fire power-up pickup for a 2D fantasy platform game.
ONE ornate compact golden-bronze circular talisman surrounding a vivid sculpted orange fire flame with a white-gold core. Beautiful polished hand-painted fantasy game art, thick readable silhouette and glowing ember details. Minimal short glow confined closely to the object. Front view, isolated centered filling most of a square canvas. Genuine transparent background, no external shadow, no backdrop, no text, no other objects. It must instantly read as FIRE at 32 pixels wide.

## wind

Asset: `assets/runners595/wind.webp` · 16,404 bytes · SHA256 `5a728e7392355698a26430b659ed7c915fbbf1dba4b8879f95eac0b85a03d6e9`

Use case: stylized-concept. Asset type: transparent wind power-up pickup for a 2D fantasy platform game.
ONE ornate compact silver-and-jade circular talisman surrounding a luminous turquoise feather wrapped in a small curving ribbon of wind. Beautiful polished hand-painted fantasy game art, thick readable silhouette and bright mint highlights. Minimal short glow confined closely to the object. Front view, isolated centered filling most of a square canvas. Genuine transparent background, no shadow or scenery, no words, no other objects. It must instantly read as WIND and aerial mobility at 32 pixels wide.

## gate

Asset: `assets/runners595/gate.webp` · 42,078 bytes · SHA256 `c16ab0c95b28d8304634fdca30a722dfbfedc8cac49db9757134dbc794d0f820`

Use case: stylized-concept. Asset type: transparent goal portal for a 2D side scrolling fantasy game.
ONE magnificent compact ancient stone gateway, full frontal elevation, a sculpted arch of weathered ivory and bronze ornament, small emerald runes with no real letters, a luminous mint-green swirling portal inside. Rich painterly shading, original premium fantasy game asset. Slight ivy on the lower sides, thick base of three shallow stone steps. Self-contained silhouette, approximately 1:1.4 width to height. All parts visible, no surrounding environment or backdrop, genuine transparent background outside the arch. Center and fill most of canvas. No text, no label, no characters, no logos. Bright enough to stand out on both an ocean and dark volcano background.

## spikes

Asset: `assets/runners595/spikes.webp` · 17,812 bytes · SHA256 `ca8ee560285d1204cf1fc5f476d5be2a1f0765ed30dd76839f44f53fcc4e2539`

Use case: stylized-concept. Asset type: transparent floor hazard sprite for a 2D side scrolling fantasy platform game.
ONE compact horizontal trap strip: seven sharp iron spikes rising out of a narrow dark metal base, alternating tall and short points, tiny glowing red-orange warning rivets. Full straight-on side elevation, flat horizontal baseline, clear dangerous silhouette. Premium hand-painted fantasy game art with sculpted blue steel highlights, metallic rich shadows. Isolated centered single trap strip, width about 3 times height. Genuine transparent background, no floor shadow, no scene, no text or labels, no other props. Every spike tip visible and sharp; gameplay readable at small scale.

## crate

Asset: `assets/runners595/crate.webp` · 8,628 bytes · SHA256 `c94830ff483042c53b74582eeeb686e57773d0f307bd759e6a5adb8ddbfdb70f`

Create one ORIGINAL fantasy 2D side-scrolling game sprite: a single square breakable wooden supply crate, isolated on a fully transparent background. Front-facing orthographic elevation, not isometric. Dense, beautifully hand-painted dark honey oak planks, aged bronze corner bands, large diagonally crossed timber braces, tiny worn bronze rivets, clear soft golden highlight from upper left, rich deep teal-brown shadows. Chunky readable silhouette at only 38 pixels. Square 1:1 box fills most of the frame with a small transparent margin. Broad wood grain and intentional brush texture rather than photorealistic noise. Gentle worn edges, no spikes, no lock, no contents, no text, no letters, no symbols, no floor, no scenery, no cast shadow outside the asset. Style matching high quality illustrated fantasy platformer foreground, warm stone and obsidian environments.
