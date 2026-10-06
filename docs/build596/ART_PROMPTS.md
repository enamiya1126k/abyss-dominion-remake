# Build596 生成素材とプロンプト

生成方法：組み込み画像生成ツール。透過PNGで新規制作し、配信用に縮小・WebP化。画像の手描き代替や外部素材の流用はしていない。

## ice

配信先：`assets/runners596/ice.webp`

サイズ：121858 bytes / SHA-256 `375becc68f6d2493f1d38663d7b7fa32ea5850bb789cd22b46aa3d612f1ec101`

プロンプト：

Use case: stylized-concept. Asset type: production side-scrolling platformer terrain strip. Create one premium hand-painted icy cavern platform terrain asset, three times as wide as tall, on a genuinely transparent background. STRICT orthographic side elevation; an almost straight perfectly horizontal WALKABLE surface along the entire top, thin silver-blue frost crust, rich layered translucent turquoise glacial stone and dark indigo mineral strata underneath, subtle violet veins, a few small icicles immediately beneath the lip. No huge ice spikes, no glitter, no isolated floating chunks, no perspective tabletop. The full center 85% is a continuous solid rectangular cliff face extending down to a level bottom; only tiny bevels on the outer two end corners. Side edges nearly vertical, no taper, no narrowing base. Front-facing horizontal layers and painted stone facets, sophisticated deep colors, crisp readable silhouette. Asset intended to be sliced into fixed top lip + repeatable cliff body in a 2D game; keep the top rim completely continuous, smooth and level; no tall decorations. Transparent background; no sky, environment, characters, text, UI, floor shadow or pedestal. Frame the object very tightly, leaving only a small transparent margin. Original fantasy RPG art, detailed but readable at small size.

## steam

配信先：`assets/runners596/steam.webp`

サイズ：27234 bytes / SHA-256 `4b71dc79a19d1201588576eafa55f7e1d3fafbda63048e89144f4970ede9e011`

プロンプト：

Use case: stylized-concept. Asset type: transparent game hazard sprite for a polished hand-painted fantasy side-scrolling platformer. Create a single coherent upward jet of hot STEAM on a truly transparent background, front side elevation. One low dark volcanic-stone vent at the very bottom with a thin copper mineral rim, a small luminous amber crack, and a natural billowing plume of translucent pale blue-white vapor rising from its center. Dense narrow jet at the base opens into elegant curled cloud wisps which disperse softly at the top. Sophisticated flowing painterly vapor, readable bright inner stream, varied curls, subtle cool cyan edges and warm core reflection. Compact almost square silhouette, plume fills upper 90 percent of image, vent spans about 65 percent of width and rests on a perfectly horizontal baseline. Do not draw parallel capsules, straight white bars, snow icicles, fire, cartoon outlines, terrain, background, sky, characters, labels, words, floor shadows or UI. Keep all object boundaries well inside the image. Match high quality richly painted fantasy platformer scenery, reduce tiny noisy detail.

ゲートはBuild595で生成した `assets/runners595/gate.webp` を再利用し、門の内側の渦・光粒・到達時の光輪をCanvasで動かす。蒸気は新規生成画像から小さな描画用素材を読み込み時に作り、上昇・拡大・消散を表現する。蒸気・ゲートの描画用素材は読み込み時に一度だけ合成し、描画ループで再利用する。
