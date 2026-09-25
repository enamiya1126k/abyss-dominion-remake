from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[2];base=root.parent/'baseline558';version='3.1.238-build559'
changed={'./'+str(f.relative_to(root)) for f in (root/'src').rglob('*.js') if not (base/f.relative_to(root)).exists() or f.read_bytes()!=(base/f.relative_to(root)).read_bytes()}
changed.update({'./src/core/config.js','./src/worldRaid/WorldRaidOfflineCache430.js'})
p=root/'index.html';s=p.read_text();m=re.search(r'<script type="importmap">(.*?)</script>',s,re.S);d=json.loads(m.group(1));mapping=d['imports']
for k,v in list(mapping.items()):
 if v.split('?')[0] in changed:mapping[k]=v.split('?')[0]+'?v='+version
for name in changed:mapping[name]=name+'?v='+version;mapping[name+'?v='+version]=name+'?v='+version
s=s[:m.start(1)]+'\n'+json.dumps(d,ensure_ascii=False,indent=2)+'\n'+s[m.end(1):]
if 'build559-hide.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="./src/Styles/build559-hide.css?v='+version+'">\n</head>')
s=s.replace('world-raid-offline558-sw.js','world-raid-offline559-sw.js').replace('const ASSET_VERSION = "3.1.237"','const ASSET_VERSION = "3.1.238"').replace('const ASSET_BUILD = "build558"','const ASSET_BUILD = "build559"');p.write_text(s)
p=root/'src/core/config.js';p.write_text(p.read_text().replace('APP_VERSION="3.1.237"','APP_VERSION="3.1.238"'))
p=root/'src/worldRaid/WorldRaidOfflineCache430.js';p.write_text(p.read_text().replace('offline558','offline559'))
(root/'world-raid-offline559-sw.js').write_text((root/'world-raid-offline558-sw.js').read_text().replace('build558','build559'))
assets=json.loads((root/'world-raid-offline558-assets.json').read_text());assets=[s.split('?')[0]+'?v='+version if s.split('?')[0] in changed else s for s in assets]
for name in sorted(changed|{'./src/Styles/build559-hide.css'}):
 if not any(v.split('?')[0]==name for v in assets):assets.append(name+'?v='+version)
(root/'world-raid-offline559-assets.json').write_text(json.dumps(assets,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'version':version,'modules':len(changed)}))
