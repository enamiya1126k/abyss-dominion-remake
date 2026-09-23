# Build526 画像素材

組み込み画像生成で魚影用の真上から見た魚を１枚作成。元PNGは保持し、プロジェクトには384×256の透過WebP（17,252バイト）へ縮小・形式変換して配置しました。

- 使用素材：assets/fishing526/fish-shadow.webp
- 元生成ファイル：exec-6889113f-0886-4300-913f-a15f0442b279.png
- 背景・釣果・サムネイル素材は既存を継続使用。
- 製品Canvasでは奥行きに合わせて投影し、乗算合成で水中の色になじませ、尾を小さく振ります。

## 生成プロンプト

Use case: stylized-concept. Asset type: transparent underwater fish sprite for a realistic fantasy pond game. A SINGLE natural carp seen exactly from ABOVE, horizontal body, head facing LEFT, forked tail facing RIGHT. Beautiful biologically convincing fish outline: broad rounded head tapering into narrow caudal peduncle, subtle paired pectoral and pelvic fins, flowing delicate forked tail, no geometric ellipse or triangular icon. Dark desaturated olive and charcoal back, soft greenish subtle scale detail, only faint highlights as if 20cm below emerald water. Photorealistic painterly style matching a sunlit forest lake. Entire fish and fins within central 80% of canvas, ample empty alpha margin, no cropping. Landscape 1536x1024. SINGLE fish only. Actually transparent background outside fish, no pond, no rectangular haze, no splash, no shadow below, no frame, no text, no icon. The game will project this sprite into perspective and fade it as a submerged silhouette.
