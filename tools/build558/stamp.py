from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[2];base=root.parent/'baseline557';version='3.1.237-build558'
changed={'./src/cart/Renderer543.js','./src/cart/Rug557.js','./src/cart/Projection558.js','./src/core/config.js','./src/worldRaid/WorldRaidOfflineCache430.js'}
p=root/'index.html';s=p.read_text();m=re.search(r'<script type="importmap">(.*?)</script>',s,re.S);d=json.loads(m.group(1));mapping=d['imports']
for k,v in list(mapping.items()):
 if v.split('?')[0] in changed:mapping[k]=v.split('?')[0]+'?v='+version
for name in changed:mapping[name]=name+'?v='+version;mapping[name+'?v='+version]=name+'?v='+version
s=s[:m.start(1)]+'\n'+json.dumps(d,ensure_ascii=False,indent=2)+'\n'+s[m.end(1):]
s=s.replace('world-raid-offline557-sw.js','world-raid-offline558-sw.js').replace('const ASSET_VERSION = "3.1.236"','const ASSET_VERSION = "3.1.237"').replace('const ASSET_BUILD = "build557"','const ASSET_BUILD = "build558"');p.write_text(s)
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.236"','APP_VERSION="3.1.237"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('offline557','offline558'))
(root/'world-raid-offline558-sw.js').write_text((root/'world-raid-offline557-sw.js').read_text().replace('build557','build558'))
assets=json.loads((root/'world-raid-offline557-assets.json').read_text());assets=[s.split('?')[0]+'?v='+version if s.split('?')[0] in changed else s for s in assets]
for name in sorted(changed):
 if not any(v.split('?')[0]==name for v in assets):assets.append(name+'?v='+version)
(root/'world-raid-offline558-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2)+'\n')
