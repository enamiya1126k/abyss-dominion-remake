# Build527 専用素材

組込み画像生成によって、この更新専用の２点を新規作成した。既存画像の改変ではない。

- `assets/sumo527/abyss.webp`：奈落に浮かぶ翡翠色・古金色の古代神殿。中央に土俵を後から描画できる空間を確保した縦長背景。900px幅、WebP品質86。
- `assets/sumo527/arena.webp`：真上から見た円形石床。深緑色の石板、金属の彫刻、同心円状の継ぎ目、中央の紋章。1024×1024、WebP品質88。

主な生成指示：premium dark fantasy game environment; emerald and antique gold; finely weathered stone; central void with mist, distant floating ruins and pillars; no characters, text, UI or central platform. Floor: perfect orthographic overhead circle, concentric stone slabs, restrained gold sun engraving, no perspective or side walls.

背景と床のみをビットマップ化し、崩壊範囲・予告・破片・吸引・突進方向・成長表現はコードで描画する。魔獣は既存の選択キャラ表示を継続する。
