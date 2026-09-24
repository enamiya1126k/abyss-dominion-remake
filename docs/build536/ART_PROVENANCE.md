# Build536 画像素材

4点とも組み込み画像生成スキルで新規生成した。原画像の構図・透明度を保持してWebPに変換し、ゲーム内に組み込んだ。家具の6コマは描画時にアトラスとして参照する。

## room.webp

方式: built-in image_gen

```text
Use case: stylized-concept. Asset type: production 2D game background, portrait 1024x1536. Create an exquisitely detailed dark fantasy demon castle treasure-library room seen from a high, nearly top-down orthographic camera, with the whole rectangular floor visible, no vanishing point. Emerald green, warm antique gold, blue moonlight and amber candlelight. Narrow perimeter walls with gothic arch windows, bookshelves and small sconces only at the far edges. Main 82% of the canvas is unobstructed walkable dark green stone tile floor with subtle brass inlays and a worn elaborate circular magical medallion at its center. A pair of rectangular threadbare emerald carpets toward upper-left and lower-right. Clear floor grid perspective essentially uniform for moving 2D game pieces. Rich painted 3D mobile fantasy game art, tactile stone and metal, inviting mysterious atmosphere, readable at phone size, no humans, no creatures, NO furniture anywhere in central floor, no table, no chest, no pots. No text, no UI, no labels, no borders. Floor must remain light enough to read little furniture sprites. Portrait room fills entire image.
```

## props.webp

方式: built-in image_gen

```text
Use case: stylized-concept. Asset type: production game sprite atlas for a top-down fantasy hide-and-seek mobile game. Landscape 1536x1024 TRANSPARENT RGBA background. EXACTLY 6 separate full objects arranged in an even 3 column by 2 row grid of square 512x512 cells. Each object centered in its own square cell, each approximately 340 px tall, with at least 70px empty padding to every cell boundary. Row 1 left: closed antique dark wooden treasure chest with brass corners. Row 1 center: elegant emerald green round ceramic urn, large wide body, gold decoration. Row 1 right: antique dark wood chair with emerald upholstered seat. Row 2 left: stout wooden barrel with iron hoops. Row 2 center: antique golden three-candle candelabrum. Row 2 right: short stone gargoyle statue on small square plinth. All seen from same high 60-degree overhead bird's eye three-quarter view, north faces up, front toward bottom, uniform orthographic scale. Painterly premium dark fantasy game assets, detailed wood grain, ceramic shine, gold patina, warm top-left rim lighting. Clear silhouettes at small mobile size. NO faces, NO eyes, NO ghosts, NO text, no labels, NO grid lines, NO ground, no scenery, no cast shadow outside objects, no opaque background. True transparent alpha background everywhere between the 6 objects. Do not let any object cross its cell.
```

## hunter.webp

方式: built-in image_gen

```text
Use case: stylized-concept. Production fantasy 2D game character sprite, square 1024x1024, true transparent RGBA background. A single intimidating but charming chibi demon king hunter seen from high 60 degree overhead three-quarter game camera, body faces toward bottom of picture. Short stout blackened steel armor with magnificent antique golden trim, small spiked royal crown, two curved horns, glowing amber eyes visible inside helmet, flowing deep crimson cape, one hand carrying an ornate emerald lantern, other hand a short broad royal sceptre. Entire body, feet and crown visible; center the full figure with 18% empty padding on every side. Premium painterly 3D dark fantasy, strong readable silhouette, rich metal detail, warm light from lantern. No ground, no floor, no scenery, NO circular base, no text, no watermark, completely transparent background.
```

## cover.webp

方式: built-in image_gen

```text
Use case: stylized-concept. Asset type: premium fantasy mobile game cover and lobby hero, landscape 1536x1024. Scene: enchanting dark emerald gothic castle library at midnight, candles, tall arched windows, old gold filigree. A charming but imposing miniature demon king in black gold armor, crown and crimson cloak, carrying glowing green lantern, searches suspiciously on right half of image. On left foreground an ornate closed treasure chest quietly tiptoes on tiny shadow feet, a green gold ceramic urn looks innocently still near a dark wooden chair. A tiny spectral glow peeking behind the chair hints at magical disguises. Funny tense hide-and-seek atmosphere, polished painterly cinematic 3D fantasy game key art, extraordinary tactile materials, gold particles in moonbeams, dynamic but uncluttered composition. Important subjects fully in upper 75% of canvas; bottom 25% gently darkens and remains low detail for UI title overlay which will be added in code. Wide shot. No text, no typography, no watermark, no UI. Not horror gore, charming sneaky magical excitement.
```

