# Build525 画像素材

画像生成で新規作成・再構成。既存の釣り背景と既存４魚種はBuild524の素材を継続使用。新規素材はWebPへリサイズ・形式変換し、元PNGは変更していません。

- river.webp / rare.webp / oddities.webp: 1152×1152、３×３の透明アトラス各９点。
- lord.webp: 960×640、透明な巨大大鯰。
- cover.webp: 960×640、釣りの一覧・ロビー共用。
- アトラスの透明な余白に沿う表示範囲はCatches525.jsのartFrame525で定義。CanvasとCSSで共用。

## 最終プロンプト

### river

Edit this transparent sprite atlas. Preserve the exact nine creature designs, colors and realistic fantasy illustration style. Critical technical fix: sprites overlap adjacent tile crop bounds currently. Rearrange onto a mathematically regular 3-column 3-row square sheet, transparent alpha background. Row1 trout, eel, catfish. Row2 bass, pufferfish, betta. Row3 sturgeon, anglerfish, piranha. Each sprite centered at its own cell center: x=256,768,1280 and y=256,768,1280 on 1536x1536 canvas. Each sprite MUST occupy only center 65 percent of its 512x512 cell: maximum 330px width and maximum 330px height. Shrink all sprites so there is AT LEAST 90px completely transparent padding between every sprite and every cell boundary, including whiskers, fins, rods, floating glows. All nine complete objects visibly separate, no overlap, no cropping. Large clean empty gutters in both directions; this is important. No border, no divider lines, no text, no scenery, no shadows outside sprite. Keep all each item's parts as one sprite. Output actual transparent PNG.

### rare

Edit this transparent sprite atlas. Preserve the exact nine creature designs, colors and realistic fantasy illustration style. Critical technical fix: sprites overlap adjacent tile crop bounds currently. Rearrange onto a mathematically regular 3-column 3-row square sheet, transparent alpha background. Row1 golden arowana, transparent glass fish, icy salmon. Row2 flying fish, seahorse, jellyfish. Row3 axolotl, crab, oarfish. Each sprite centered at its own cell center: x=256,768,1280 and y=256,768,1280 on 1536x1536 canvas. Each sprite MUST occupy only center 65 percent of its 512x512 cell: maximum 330px width and maximum 330px height. Shrink all sprites so there is AT LEAST 90px completely transparent padding between every sprite and every cell boundary, including whiskers, fins, rods, floating glows. All nine complete objects visibly separate, no overlap, no cropping. Large clean empty gutters in both directions; this is important. No border, no divider lines, no text, no scenery, no shadows outside sprite. Keep all each item's parts as one sprite. Output actual transparent PNG.

### oddities

Edit this transparent sprite atlas. Preserve the exact nine creature designs, colors and realistic fantasy illustration style. Critical technical fix: sprites overlap adjacent tile crop bounds currently. Rearrange onto a mathematically regular 3-column 3-row square sheet, transparent alpha background. Row1 old boot, fishing lure, red crayfish. Row2 turtle, hermit crab, mimic treasure chest. Row3 key eel, crowned king crab, closed treasure chest. Each sprite centered at its own cell center: x=256,768,1280 and y=256,768,1280 on 1536x1536 canvas. Each sprite MUST occupy only center 65 percent of its 512x512 cell: maximum 330px width and maximum 330px height. Shrink all sprites so there is AT LEAST 90px completely transparent padding between every sprite and every cell boundary, including whiskers, fins, rods, floating glows. All nine complete objects visibly separate, no overlap, no cropping. Large clean empty gutters in both directions; this is important. No border, no divider lines, no text, no scenery, no shadows outside sprite. Keep all each item's parts as one sprite. Output actual transparent PNG.

### lord

Use case: stylized-concept. Asset type: one isolated transparent PNG sprite 1536x1024 for the TRUE LEGENDARY LORD OF A FANTASY LAKE. Depict a colossal thousand-year-old giant CATFISH, extremely massive broad flat head and deep heavy body, enormous cavernous mouth, thick long curling whiskers, small ancient amber eyes, scarred mottled dark olive skin, its thick back crusted with moss, weathered rock-like plates, fallen branches and tiny old gold relic fragments. This should feel like an entire ancient pond has been living on its back. Not a pretty koi, not an ornamental goldfish, not a dragon, no crown, no humanoid features. Whole fish in left-facing three-quarter side view, giant head on left, thick body curves toward a powerful tail on right. Dynamic heavy rising pose suitable for a dramatic catch, complete tail and whiskers fit within the image with comfortable margins. Magnificent and formidable yet appropriate for a charming fantasy fishing game. Premium painterly RPG monster asset with crisp tactile detail and strong readable silhouette; warm highlights against jade shadows. TRUE TRANSPARENT alpha zero background outside the animal, no water, no splash, no scenery, no glow cloud, no lettering, no interface, no watermark.

### cover

Edit image 1's fantasy fishing game cover. Keep its bright emerald lake, ornate gold fantasy piers, four charming little fishing adventurers (blue slime, wolf knight, goblin and skeleton) and composition. Replace the giant elegant gold dragon-koi with the ancient monstrous CATFISH in image 2, matching its huge broad flat scarred head, cavernous catfish mouth, tiny amber eyes, long drooping whiskers, moss-covered enormous dark olive body and old rusty chains. It should feel like a 1000-year-old lord of the lake, vastly bigger than the four characters, erupting from water with spectacular white spray; imposing yet fun, not horror, no blood. Ensure clearly visible silhouette and face, well-lit warm sun. Very high quality cinematic fantasy game key art. Preserve the four separate little anglers and their poses. Landscape 1536x1024. No text, no lettering, no borders. Output opaque cover.

