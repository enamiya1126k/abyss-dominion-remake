# Build524 生成素材

今回の画像生成は組み込みの画像生成を使用。最終素材は以下に配置しています。

|素材|用途|解像度|
|---|---|---|
|assets/fishing524/pond.webp|対戦画面の池・桟橋の背景|768×1152|
|assets/fishing524/cover.webp|ミニゲーム一覧・準備画面の表紙|960×640|
|assets/fishing524/fish-atlas.webp|５種類の魚。３列×２行、右下は空き、透明度を保持|1152×768|

WebPへ縮小・圧縮。背景と表紙は品質84、魚は品質88。水面のきらめき、魚影、浮き、曲がる竿、糸、魚の飛び出し・飛沫はCanvasで動かし、所持キャラは既存MonsterVisualとDOM transformで動かします。画像を毎フレーム加工・生成する構成ではありません。

## 池のプロンプト

生成ID: exec-cdf735dd-ffec-4004-8a5a-68be5ac98a5e

Use case: stylized-concept. Asset type: portrait 1024x1536 background plate for a fantasy mobile fishing minigame, no UI. Beautiful peaceful emerald woodland pond inside an ancient enchanted royal garden, deep green water with subtle turquoise clear shallows, warm sunlight filtering through trees, gold filigree on mossy stone arches and railings, two small distant waterfalls at the upper corners, vines and floating tiny white flowers only near edges. Composition for gameplay: high overhead oblique view looking toward the far shore; the large central 70 percent of the image is OPEN UNOBSTRUCTED CALM POND WATER, no fish or objects in this central area. Along the entire bottom edge is a broad richly textured dark wooden fishing pier with elegant aged gold fittings and four unobstructed standing places. The distant wooded bank and ornate stone arch are only along top 15 percent; reeds and trees frame thin side edges. Premium painterly fantasy game environment, tactile materials, atmospheric depth, luminous romantic afternoon, exceptionally beautiful water. No people, no characters, no fish, no fishing rods, no lettering, no words, no interface, no border, no watermark. Designed as an animated game background onto which actual fish, lines and characters will be composited.

## 表紙のプロンプト

生成ID: exec-525030e6-620f-4c36-876d-72b7d02d3f79

Use case: stylized-concept. Asset type: landscape 1536x1024 premium fantasy minigame cover illustration, no text. Charming dramatic fishing commotion in ABYSS DOMINION: four small fantasy monsters (a blue slime holding a tiny fishing rod, an armored wolf, a green goblin, a little skeleton) fishing from a broad dark wooden pier with aged ornate gold fittings at an enchanted emerald forest pond. Their rods bend dramatically as a magnificent ENORMOUS jade and antique-gold koi-like lake guardian bursts from the water in an arc, bright flowing fins, gentle ancient dignified face, gold antler-like crown fins and iridescent scales. Water droplets and a luminous splash curve around it. The goblin is hilariously sliding forward with feet braced while the wolf leans back with rod bowed; fun excitement rather than horror. Ancient royal garden stone arches with gold filigree in distant forest, late afternoon sunlight and warm magical reflections. Painterly high end game key art, strong clear silhouettes, tactile gold and emerald palette, humorous cozy adventure with thrilling giant catch. Compose the giant fish in the central upper half and the four tiny fishers on lower edge, readable when cropped to 16:10. No words, no lettering, no interface, no watermark, no photorealistic humans.

## 魚のプロンプト

生成ID: exec-c963ee5a-48c4-4a53-a058-dbf5991abf4b

Use case: stylized-concept. Asset type: transparent PNG game sprite sheet 1536x1024, exactly 3 columns by 2 rows of equal 512x512 cells. TRANSPARENT BACKGROUND with actual alpha. No labels or text, no grid lines, no shadows outside fish, no water. Five isolated beautifully painted fantasy fish, side view facing LEFT, centered within their individual cell with a large empty margin around each fish; no fish may cross a cell boundary. Top left cell: a small silver-blue river fish with shimmering scales and pale fins. Top middle cell: a rich emerald green koi with broad jade fins. Top right cell: a plump ruby coral-red bream with shiny scales. Bottom left cell: a rare moon-crowned gold fish with long elegant gold translucent fins. Bottom middle cell: a magnificent legendary emerald-and-antique-gold lake guardian koi, large head, impressive swept-back crown-like golden antler fins and long flowing jade tail, friendly but majestic ancient creature. Bottom right cell: completely empty transparent. Every fish rendered in consistent premium fantasy RPG painterly asset style, detailed tactile scales, golden highlights, clean silhouette, vivid lit form. Each fish body horizontal centered in its own cell and must fit entirely within that cell including long fins. No UI, no watermark, no scenery, no words. Not pixel art. These fish sprites will be individually cropped and animated during fishing catches.

透明部分を再指定した編集生成を採用（exec-60529330-a362-422e-9e68-e471e89ad360）。最終アトラスの背景サンプルはalpha=0、魚内部はalpha>0であることを確認。画像抽出はCanvasのセル描画を使います。

編集プロンプト:

Use case: background-extraction. Edit this fish sprite atlas. Keep all five fish, their exact placement, poses, sizes, colors and detailed artwork unchanged. Remove ALL the misty colored glow, all dark background, all haze and all cast shadows between and around fish. Only the fish themselves and their actual fins should remain. Everything outside the five precise fish silhouettes must be FULLY TRANSPARENT alpha zero. Do not replace it with black, white or checkerboard. Keep original 1536x1024, exact 3-column 2-row equal cell layout and the empty bottom-right cell. These are sprites that must cleanly composite directly over water with no rectangles or colored fog. No new objects, no lettering.
