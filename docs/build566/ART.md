# Build566 お宝クレーンの画像素材

組み込みの画像生成で制作。台の装飾、宝箱、ミミック、表紙の４点。台の当たり判定・クレーン・ケーブル・照準・文字・粒子はコードで描画し、画像に判定を依存させない。宝石と金貨はCanvasの図形で描画する。

|配信ファイル|生成モード|生成元ファイル名|
|---|---|---|
|assets/crane566/arena.webp|新規生成／不透明|exec-3720d24b-5825-4515-93cd-418835aadedc.png|
|assets/crane566/chest.webp|新規生成／透過|exec-d5e0c7da-f305-486d-acdf-885664a0960a.png|
|assets/crane566/mimic.webp|新規生成／透過|exec-c8ec27e6-32e5-4cd4-9b93-b80e42b9e555.png|
|assets/crane566/cover.webp|参照画像から構成／不透明|exec-44516040-e865-441a-a237-b82ffbe36691.png|

WebPへの縮小・エンコードのみImageMagickで実施。宝箱とミミックのアルファを維持。arenaは768×1152、chest/mimicは256×256、coverは640×960。宝箱・台・ミミックの原画を表紙の参照画像として使用した。配信画像はこのリポジトリ内で完結し、外部サービスへ実行時アクセスしない。

## arena

```text
Create a polished mobile fantasy arcade GAME BACKGROUND texture, portrait 2:3 composition, strict orthographic top-down view, a luxurious ancient brass treasure-sorting mechanism in the Abyss Dominion world. Deep midnight teal enamel and warm honey brass, large dark teal circular inset turntable occupying central 80% of width, fine concentric engraved circles and tiny subtle arcane radial grooves, a narrow decorative brass rim, aged rivets and machined edge details, jewel-like mint luminous inlays at four compass directions. Around the circle is dark emerald leather and metal flooring with restrained art nouveau scrollwork, pleasant warm cinematic light but FLAT top-down readable surface, premium tactile hand-painted 3D mobile party game aesthetic. Most of the inner circle must be quiet open space so moving game objects remain legible. No characters, no coins, no treasures, no hooks, no chains, no game UI, no labels or letters. Rich crafted finish, fine specular highlights, strong subtle depth around the rim, clean seamless-looking uncluttered playable center. Full bleed image, no white border. The geometry is decorative only, actual mechanics and UI will be rendered in code.
```

## chest

```text
Single isolated game sprite of a magnificent small fantasy treasure chest, three-quarter overhead view from about 65 degrees, open just enough to reveal brilliant golden coins and one emerald, rounded warm mahogany wood, elaborately worked antique brass bands and broad golden lock, chunky charming proportions, premium painterly 3D mobile party game asset, extremely readable silhouette at 48px. Golden highlights, dark green ambient reflection, tiny mint gemstone on lid, rich tactile detail without thin noisy lines. Object centered and fills 80% of square image, generous transparent margin, NO floor, NO background, NO cast shadow beyond tiny tight contact shadow, no text, no other objects. Actual transparent alpha background, one sprite only. Visual style suits an ornate teal and brass magical treasure claw arcade.
```

## mimic

```text
One isolated MIMIC treasure chest monster game sprite on a real transparent background, three-quarter overhead view from about 65 degrees, chunky small mahogany chest with antique brass bands, lid wide open revealing a mischievous mouth with huge ivory cartoon teeth and a pink curling tongue, TWO very visible angry ruby eyes in the lid, small purple claws gripping the bottom. Funny troublemaker rather than scary, premium painterly 3D mobile fantasy party game, same style as a brass and deep teal magical treasure claw arcade, strong readable silhouette at 48px, crimson and violet danger accents make it immediately different from safe gold treasure. Beautiful sculpted wood and metal highlights, gem-like eyes, rich tactile finish, clean shape. Centered object occupying 80 percent of square, generous transparent margin. No scenery, no floor, no text, no multiple views, no white square background. Only this one monster sprite with alpha transparency.
```

## cover

```text
Create a premium mobile fantasy party-game COVER illustration, portrait 2:3. Use the provided images for the exact visual world: dark teal and antique brass treasure turntable, golden wooden treasure chest, red-eyed funny mimic. The game is four opponents using mechanical claw grabbers to steal moving treasure from one another. Dramatic three-quarter overhead composition, a magnificent gold treasure chest stuffed with coins and a green jewel floating prominently in upper-center, three ornate brass grabber claws on colored glowing cables reaching toward it from three different edges (amber from bottom, mint from upper-right, sapphire from upper-left). A cheeky red-eyed toothy mimic from the reference at lower right getting caught by a fourth pink claw; a few small luminous gems and flying coins create action. Show a small cute translucent blue slime operating the amber winch near the bottom-left, a small mischievous green goblin at upper-right, and a tiny friendly skeleton at upper-left, all expressive and competitive. No characters colliding, no arena falls, entirely about stealing treasure with claws. Rich crisp painterly 3D fantasy toy aesthetic, burnished metal, cinematic amber light, deep teal shadows. Strong readable large central treasure/claw silhouette; no tiny clutter. Leave the BOTTOM 25% softly dark teal and relatively quiet for the game's own text overlay. NO words, NO text, NO logo, NO UI cards or score counters. Full bleed, opaque background.
```
