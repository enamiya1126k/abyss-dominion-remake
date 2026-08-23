# build208 画像生成記録

本buildの新規ビットマップ素材は、ChatGPT Workの組み込み画像生成を使用しました。生成後、ゲーム用の透過PNGへ分割・縮小し、RGBAと透明余白を検査しています。

## 生成物の作業パス

- 黄金の財宝獣：`/workspace/scratch/9e43a491738c/generated_images/exec-d8f094a6-49fa-40ad-b1d6-1a10061032f3.png`
- 黄金の財宝獣・透過修正：`/workspace/scratch/9e43a491738c/generated_images/exec-11b9618a-5010-4da9-ac91-12c6881e02a2.png`
- 異界商人：`/workspace/scratch/9e43a491738c/generated_images/exec-a2df60aa-6763-4e8d-a4ff-0517614bfb14.png`
- 共闘宝箱・初稿：`/workspace/scratch/9e43a491738c/generated_images/exec-aecd3427-c7ec-454c-90ad-c16ae0c82867.png`
- 共闘宝箱・角度修正版：`/workspace/scratch/9e43a491738c/generated_images/exec-dafbfd60-5494-4ae9-845f-17dd010d6159.png`
- 鍵／封印扉／転送門：`/workspace/scratch/9e43a491738c/generated_images/exec-f129d365-ee18-458c-8d55-66f403f090e7.png`
- 鍵片・床背景除去版：`/workspace/scratch/9e43a491738c/generated_images/exec-f20bf077-473a-4add-839c-27910dfcb9e8.png`

## 最終プロンプト

### 黄金の財宝獣

```text
Use case: stylized-concept
Asset type: production game sprite sheet for ABYSS DOMINION
Input images: Image 1 is the subject identity reference for the golden treasure beast; Image 2 is the strict pixel-art sprite scale, rendering, silhouette, and animation-layout reference.
Primary request: Redraw the golden horned treasure beast as an authentic compact pixel-art monster sprite sheet that visually matches Image 2 and the game's existing dungeon sprites. The authored source creature must face RIGHT in every living frame.
Subject: quadruped lion-dragon treasure beast, heavy curved horns, compact muscular body, restrained gold armor, a few purple gems, readable at small game scale. Reduce ornament clutter so the silhouette remains clear.
Composition/framing: exactly 8 equal cells arranged as a clean 4-column by 2-row sheet. Top row left to right: idle1, idle2, idle3, walk1. Bottom row left to right: walk2, attack, damage, down. Same character identity, scale, ground contact, and pivot in every cell. Full body visible with generous transparent padding; no cell overlap.
Style/medium: crisp hand-authored 16/32-bit fantasy JRPG pixel art, hard pixel clusters, limited palette, no smooth painterly rendering.
Motion details: subtle breathing across idle frames; distinct front/rear leg steps for walk frames; forward claw-and-horn lunge for attack; recoiling pose for damage; fully collapsed defeated pose for down.
Color palette: dark antique gold, warm amber, blackened metal, small violet accents; controlled glow only, no large flames.
Constraints: genuinely transparent background; no white background; no checkerboard; no text; no labels; no grid lines; no UI; no shadow outside each cell; no extra characters; all living frames face RIGHT; nothing clipped; consistent anatomy and accessories across all eight frames.
Avoid: high-resolution painted illustration, 3D rendering, anti-aliased edges, left-facing poses, perspective changes, duplicate poses, stray fragments, cropped horns or paws.
```

### 黄金の財宝獣・透過修正

```text
Use case: background-extraction
Asset type: production transparent game sprite sheet
Input images: Image 1 is the exact edit target.
Primary request: Remove only the gray-and-white checkerboard background and replace it with genuine alpha transparency.
Constraints: Preserve all eight golden beast sprites pixel-for-pixel in identity, pose order, scale, position, colors, sharp pixel edges, and 4-column by 2-row layout. Do not redraw, recolor, resize, move, crop, smooth, or add anything. Preserve every horn, paw, gem, armor plate, and damage particle. Background must be truly transparent RGBA, not a checkerboard pattern and not white. No text, no grid, no shadow outside the sprites.
```

### 異界商人

```text
Use case: stylized-concept
Asset type: production pixel-art NPC sprite sheet for ABYSS DOMINION dungeon exploration
Input images: Image 1 is the merchant identity and outfit reference only; ignore and remove the stray golden creature fragment at its far left. Image 2 is the strict pixel-art scale, edge treatment, compact silhouette, and sprite rendering reference.
Primary request: Redraw the mysterious otherworld merchant as a compact dungeon NPC sprite that matches the game's existing monster/player sprites and never looks like a high-resolution illustration pasted onto the map.
Subject: hooded catlike traveler in a dark violet cloak with restrained antique-gold trim, small backpack, one warm lantern, and a compact open relic case. No other creature or object.
Composition/framing: exactly 4 equal cells in one horizontal row, ordered idle1, idle2, idle3, talk/offer. Same identity, size, ground contact, and pivot in all four. Full body visible with generous transparent padding and no overlap.
Style/medium: crisp hand-authored 16/32-bit fantasy JRPG pixel art, hard pixel clusters, limited palette, no smooth painterly rendering.
Motion details: three subtle breathing/lantern-sway idle poses; final pose gently presents the relic case toward the player. Face and torso angle slightly down-right so the NPC reads naturally on a top-down dungeon floor.
Color palette: blackened violet, muted gold, small amber lantern, tiny cyan/purple potion accents.
Constraints: genuinely transparent background; no checkerboard baked into image; no text; no labels; no grid; no UI; no extra characters; no golden beast fragments; no external shadow; no clipping; consistent anatomy, clothing, lantern, and pack.
Avoid: full-resolution concept art, 3D render, anti-aliased painterly edges, giant proportions, floating pose, perspective changes, duplicate exact frames.
```

### 共闘宝箱・角度修正版

```text
Use case: style-transfer
Asset type: corrected production pixel-art chest sprite sheet
Input images: Image 1 is the exact eight-chest sheet to correct. Image 2 is the mandatory camera angle, depth, ground contact, compact scale, and pixel-art reference—especially its red closed and open chest.
Primary request: Keep Image 1's four rarity designs and exact 4-column by 2-row order, but redraw every chest from the same three-quarter top-down dungeon perspective as Image 2. The top surface and RIGHT side surface must both be clearly visible. The chest must sit on the ground like Image 2, not face the camera as a flat square.
Composition/framing: columns remain black iron, silver/blue, antique gold/violet, abyss black-violet. Top row closed, bottom row matching open. Same body, footprint, scale, viewpoint, and pivot in every cell.
Style/medium: authentic crisp 16/32-bit JRPG pixel art matching Image 2, compact proportions, hard pixel clusters, limited palette.
Constraints: change the camera perspective and proportions only as needed; preserve the four rarity identities and open/closed pairing. Genuinely transparent background; no checkerboard baked in; no text, labels, grid, UI, extra props, large glow, clipping, creatures, or front-facing view.
Avoid: flat frontal treasure boxes, tall square silhouette, smooth high-resolution illustration, 3D render, oversized crystals, perspective drift between cells.
```

### 鍵／封印扉／転送門

```text
Use case: stylized-concept
Asset type: production pixel-art co-op dungeon prop sheet for ABYSS DOMINION
Input images: Image 1 is the mandatory in-game top-down pixel-art scale, hard edge treatment, stone material, and ground-contact reference. Image 2 supplies only the cyan/violet key and sealed vault identity. Image 3 supplies only the violet dimensional-portal identity; simplify it drastically to fit Image 1.
Primary request: Create six compact dungeon props that look natively authored for Image 1, not high-resolution fantasy illustrations.
Composition/framing: exactly 6 equal cells arranged 3 columns by 2 rows. Top row left to right: cyan half-key fragment, violet half-key fragment, the two halves fused into one compact cyan-violet key. Bottom row left to right: sealed black-stone vault doorway with chains and a small violet center seal; dormant wall-alcove portal with dark stone arch and unlit violet floor rune; active version of the exact same wall-alcove portal with restrained violet energy and lit floor rune. Same viewpoint, scale family, and transparent padding; no overlap.
Style/medium: crisp authentic 16/32-bit top-down fantasy JRPG pixel art matching Image 1, hard pixel clusters, limited palette, readable at 64–128 px.
Perspective/placement: key fragments lie flat or slightly tilted on the dungeon floor. The vault and portal arches face downward toward the player and visibly connect to a back wall/floor threshold; their base must sit on the floor rather than float.
Color palette: charcoal stone, aged gold, controlled cyan and violet highlights. Portal glow is contained inside the arch and rune.
Constraints: genuinely transparent background; no checkerboard baked in; no text, labels, grid, UI, creatures, stairs inside the portal, floating islands, external scenery, clipping, or large aura. Exact same portal silhouette in dormant and active cells.
Avoid: high-resolution painted concept art, 3D render, smooth anti-aliasing, giant gemstones, ornate clutter, full-screen vortex, front-facing isolated icon with no floor contact.
```

### 鍵片・背景除去修正版

```text
Use case: background-extraction and pixel-asset correction
Asset type: transparent production pixel-art key prop sheet
Input image: the exact six-cell co-op dungeon prop sheet. Use ONLY the three key designs from its top row as identity references.
Primary request: Redraw/correct the cyan half-key, violet half-key, and fused cyan-violet key as isolated compact floor props with no stone floor tiles or background behind them.
Composition: exactly 3 equal cells in one horizontal row, left to right cyan half-key, violet half-key, fused key. Keep the same key shapes, blackened gold metal, restrained cyan/violet gems, slight floor-lying tilt, scale, and visual identity. Add only a tiny attached contact shadow directly beneath each key so it reads as lying on the current game floor.
Style: authentic crisp 16/32-bit top-down fantasy JRPG pixel art, hard pixel clusters, limited palette, readable at 64–96 px.
Constraints: genuine alpha transparency surrounding each key; no checkerboard baked into the image; no stone floor square; no wall; no door; no portal; no text; no labels; no grid lines; no UI; no extra props; nothing clipped; generous transparent padding; consistent pivot.
Avoid: high-resolution painterly art, smooth 3D rendering, giant gemstones, floating icon presentation, white background, tile backdrop.
```
