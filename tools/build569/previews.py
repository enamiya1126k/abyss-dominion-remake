"""Convert browser QA screenshots to compact publishable previews."""
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[2]
for name in ['visible','hidden','lobby','result']:
 source=root/'docs/build569'/f'{name}.png'
 if source.exists():
  Image.open(source).save(source.with_suffix('.webp'),quality=87)
