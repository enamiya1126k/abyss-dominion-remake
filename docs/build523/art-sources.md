# Build523 画像素材

assets/sumo523/cover.webp：今回のために画像生成。1536×1024の生成画像から960×640 WebP（品質84）へ最適化。192,708 bytes。パーティー一覧と相撲の準備画面で使用。文字・操作UIは画像に焼き込まずHTML/CSSで表示。

生成ID: exec-f0ca18f5-3516-41aa-ab92-3ae514257976

生成プロンプト:

> Use case: stylized-concept. Asset type: premium fantasy browser game landscape key art, 1536x1024. Title not included, no text or UI. ABYSS DOMINION monster sumo battle: four distinct small fantasy monsters (armored wolf, emerald horned goblin, gold plated rock golem, purple imp) charging into each other on a large circular emerald stone arena floating over a deep misty abyss. The central collision has a powerful white gold shockwave, skidding claws, shards of luminous teal crystals. One monster is being flung outward in a dramatic arcing trail. Outer arena tiles are cracking and tumbling into the chasm, heavy ancient gold metal ornament, deep forest green banners, ornate ruined fantasy colosseum in the background. Gorgeous painterly game key art, cinematic volumetric light, tangible heavy materials, thrilling action, clear silhouettes. Wide composition, central action readable even cropped to 16:10. No lettering, no watermark, no interface, no realistic people. This is game cover art, not a gameplay screenshot.

対戦画面の闘技場・結晶・崩壊・衝撃波はCanvas、キャラは既存の所持キャラ表示とDOM transform、ボタンはCSS/SVGで描画。操作ごとに画像生成したり、大きな画像を毎フレーム加工したりしません。効果音はWebAudio合成です。
