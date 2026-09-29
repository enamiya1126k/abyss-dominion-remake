# Build565 image assets

Generated with the built-in image generation tool. WebP files are deployment encodings of the generated assets; alpha is preserved. Exact court geometry and all labels are drawn by the game.

## court

Final path: `assets/hockey565/court.webp`

```text
Use case: stylized-concept
Asset type: production game texture, ABYSS DOMINION 2v2 air hockey table playing surface.
Primary request: create a premium portrait texture for a true overhead air-hockey table. A perfectly flat rectangular slab of deep forest-green, polished enamel over brushed metal, extremely fine regular air perforations, subtle hand-engraved antique gold filigree confined to the four extreme corners. Luxurious tactile arcade equipment with dark fantasy craftsmanship, restrained gold, emerald lacquer, tiny physically plausible wear, soft broad specular reflections. Most of the central playing surface is quiet and dark for bright moving pucks and character strikers.
Composition: portrait 1024x1536, strict orthographic top-down, playing surface extends to every image edge. Lighting even enough for readability. Fine holes remain subdued at phone size.
Constraints: ONLY the flat tabletop texture. No outer rails, no borders, no goals, no pockets, no center circle, no dividing line, no characters, no puck, no striker, no propeller, no text, no letters, no numbers, no logos, no watermark, no perspective. Code will draw exact court markings and recessed goal boundaries over this image. Full opaque background.
```

## striker

Final path: `assets/hockey565/striker.webp`

```text
Use case: stylized-concept
Asset type: production 2D game sprite, a premium air hockey striker base for ABYSS DOMINION.
Primary request: one circular fantasy air-hockey striker seen strictly from directly above, with the material quality of handcrafted tournament arcade equipment. Thick dark gunmetal outer impact band, precision machined brushed champagne-gold bevel, restrained engraved scrolling leaves, eight small polished brass fasteners, beautiful layered 3D beveled depth. The central 56 percent diameter is an EMPTY smooth very dark forest-green circular enamel medallion for a character image to be composited by the game. This looks like a heavy polished metal air hockey mallet viewed from above, but without a raised handle so the portrait insert remains open.
Composition: single perfectly round centered object, orthographic top-down, square image; outer circle covers about 86 percent of canvas; even 7 percent transparent padding. All edges clearly defined, subtle tight contact shadow only.
Palette: bronze-gold, dark steel, emerald-black; neutral rim so the game can add team-color illumination.
Constraints: genuinely transparent background, no scene, no ground, no backdrop color, no checkerboard baked into art, no character, no text, no letters, no UI, no diamonds, no blue/red team color, no elliptical perspective. One object only.
```

## puck

Final path: `assets/hockey565/puck.webp`

```text
Use case: stylized-concept
Asset type: production top-down air-hockey puck sprite.
Primary request: a single real disk-shaped air hockey puck rendered with premium dark-fantasy arcade materials. The puck is a thin, solid, perfectly circular black carbon and dark bronze disk with a narrow polished champagne-gold metal bevel and an understated ivory-gold concentric luminous ring. The broad flat center has subtle radial machined rings and a tiny tasteful gold sunburst engraving, no jewels. Give the rim strong clean highlights so the disk reads instantly over a green table. This is a physical hockey puck, not a gemstone, coin, medallion, or ball.
Composition: true orthographic view from directly above, absolutely circular silhouette, square image, single centered object taking 82 percent of the image. Subtle thickness visible as a tight even black rim. Neutral studio lighting, controlled restrained bright ring. No detached glow outside the object.
Constraints: genuinely transparent background; no ground, no scenery, no cast shadow beyond tiny contact shadow, no text, no words, no numbers, no watermark. One puck only, no handle, no perspective, no diamonds or crystals.
```

## goal

Final path: `assets/hockey565/goal.webp`

```text
Use case: stylized-concept
Asset type: production ornament sprite for a recessed air-hockey goal inside the table's end rail.
Primary request: one elegant wide horizontal rectangular recessed goal cartridge viewed strictly straight down, for a dark forest-green and antique gold fantasy air hockey table. A deep black horizontal puck receiving slot inset into the hardware, completely flush, flanked by smoothly beveled antique-brass left and right end caps. Along the rear edge is a thin beautifully engraved metallic lintel with tiny jewel-free rivets and dark steel vents. The OPEN FRONT edge at the BOTTOM of the image is a straight uninterrupted horizontal line leading into the slot. There is no lip, crossbar, or net sticking into the playfield. The goal recedes upward into the end rail. Tactile machined bronze, gold leaf ornament restricted to the hardware, shadowed black receiver, clean high contrast geometry.
Composition: wide horizontal asset 3:1 aspect ratio, top-down orthographic, one cartridge centered and taking 94 percent width and 72 percent height, transparent padding around it. No surrounding table. Production sprite intended to be mapped into a narrow table rail and mirrored for the opposite goal.
Constraints: transparent background, no perspective, no football net, no cage, no protruding posts below the front edge, no words, no numbers, no letters, no logos, no background scene. Opening stays empty black.
```
