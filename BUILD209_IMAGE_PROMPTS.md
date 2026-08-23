# build209 画像生成元・最終プロンプト記録

## 採用素材

- ユーザー提供元：`FE055BBD-9014-4F26-97B2-697D81AACF2C.jpeg`
- 内容：正面寄り見下ろしの黒鉄／銀／金／深淵宝箱、各閉・開の計8点
- 配置先：`assets/online/coop/chests/`
- 出力：全8枚 `128×112`、RGBA PNG、同一キャンバス・同一床接地点

## 最終プロンプト

```text
Use case: background-extraction
Asset type: production transparent pixel-art chest sprite sheet for ABYSS DOMINION
Input images: Image 1 is the exact edit target and must remain the sole design reference.
Primary request: Remove only the pale gray-and-white checkerboard background and replace it with genuine alpha transparency.
Composition/framing: Preserve the exact 4-column by 2-row layout, chest designs, front-facing top-down perspective, open/closed states, proportions, colors, lighting, pixel edges, locks, gems and metal ornamentation. Do not redraw, restyle, rotate, tilt, add shadows, add labels, add scenery or invent missing pixels.
Background: fully transparent RGBA outside the eight chest sprites.
Output quality: crisp pixel-art edges, no checkerboard residue, no white halo, no opaque matte, consistent padding around every sprite, suitable for deterministic cropping into eight individual game assets.
Hard constraints: exactly eight chests; top row closed; bottom row matching open states; columns left-to-right black-iron, silver-blue, gold-purple, abyss-purple; no extra objects; no text; no UI; no border.
```

## 採用工程

画像編集生成を2回試行しましたが、元絵の形状や宝石配置を変えてしまう箇所があり、ゲーム用の閉・開対応素材としては不採用にしました。

- 不採用生成物：`generated_images/exec-706e5dd1-0daf-4e86-b883-815d8313dfae.png`
- 不採用生成物：`generated_images/exec-1960e1ec-0164-4de7-9292-b3c2270bd57d.png`

最終採用品はユーザー提供画像だけを元に、背景色除去、8領域の切り出し、透明余白調整、同一キャンバスへの配置、ニアレストネイバー縮小を決定的処理で行いました。生成による描き直しは混ぜていません。

## 最終ファイル

- `black-iron-closed.png`
- `black-iron-open.png`
- `silver-closed.png`
- `silver-open.png`
- `gold-closed.png`
- `gold-open.png`
- `abyss-closed.png`
- `abyss-open.png`
