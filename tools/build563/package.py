"""Build the cumulative Build563 patch; run after the recorded QA checks.

An adjacent baseline562 checkout is optional and enables extra source comparisons.
The Build562 manifest is needed to collect the preceding cumulative runtime fix.
"""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import zipfile

root = Path(__file__).resolve().parents[2]
base = root.parent / 'baseline562'
out = root.parent / 'output/ABYSS_DOMINION_Build563_patch.zip'
version = '3.1.242-build563'
runtime = set('''
index.html
src/core/config.js
src/worldRaid/WorldRaidOfflineCache430.js
world-raid-offline563-sw.js
world-raid-offline563-assets.json
online-server/src/BombCoordinator542.js
online-server/src/HideCoordinator536.js
online-server/src/PartyCoordinator462.js
online-server/src/RaceCoordinator451.js
online-server/src/Realtime563.js
online-server/src/RicochetCoordinator550.js
online-server/src/TetraCoordinator539.js
src/Styles/build563-arcade.css
src/bomb/Relay563.js
src/bomb/Rules542.js
src/bomb/View542.js
src/hide/Guidance563.js
src/hide/Relics541.js
src/hide/Renderer536.js
src/hide/Rules536.js
src/hide/View536.js
src/party/Arcade563.js
src/party/PartyGames462.js
src/party/PartyView462.js
src/race/RaceClient451.js
src/ricochet550/Board563.js
src/ricochet550/Goals563.js
src/ricochet550/Rules550.js
src/ricochet550/View550.js
src/tetra/Renderer539.js
src/tetra/Rules539.js
src/tetra/View539.js
'''.split())

previous = json.loads((root / 'BUILD562_MANIFEST.json').read_text())
carried = {f['path'] for f in previous['files']
           if f['path'].startswith(('src/', 'online-server/src/'))}
files = runtime | carried | {'README_BUILD563.md', 'BUILD562_MANIFEST.json'}
files.update(str(p.relative_to(root)) for p in (root / 'docs/build563').iterdir() if p.is_file())
files.update(str(p.relative_to(root)) for p in (root / 'tests').glob('build56[123]-*.test.mjs'))
files.update(str(p.relative_to(root)) for p in (root / 'tools/build563').glob('*.mjs'))
files.update({'tools/build563/package.py', 'tools/build562/fixture.mjs', 'tools/build560/audio-fixture.mjs'})

for name in files:
    assert (root / name).is_file(), name
    assert not any(part in {'data', 'node_modules', '.git', '__pycache__'} for part in Path(name).parts), name
    if name.endswith(('.js', '.mjs')):
        subprocess.run(['node', '--check', str(root / name)], check=True, capture_output=True)
    if name.endswith(('.js', '.mjs', '.md', '.json')):
        assert '/workspace/scratch/' not in (root / name).read_text(), name

if base.is_dir():
    for folder in ('src', 'online-server/src'):
        for path in (root / folder).rglob('*'):
            if not path.is_file():
                continue
            name = str(path.relative_to(root))
            if not (base / name).exists() or path.read_bytes() != (base / name).read_bytes():
                assert name in runtime, name

html = (root / 'index.html').read_text()
mapping = json.loads(re.search(r'<script type="importmap">(.*?)</script>', html, re.S)[1])['imports']
modules = {name for name in runtime if name.startswith('src/') and name.endswith('.js')}
assets = json.loads((root / 'world-raid-offline563-assets.json').read_text())
for name in modules:
    canonical = './' + name
    target = canonical + '?v=' + version
    assert mapping[canonical] == target, name
    for key, value in mapping.items():
        if key.split('?')[0] == canonical:
            assert value == target, key
    assert target in assets, name
assert './src/Styles/build563-arcade.css?v=' + version in assets
assert html.count('./src/Styles/build563-arcade.css?v=' + version) == 1
assert 'register("./world-raid-offline563-sw.js"' in html
assert 'endsWith("/world-raid-offline563-sw.js")' in html
assert 'const ASSET_VERSION = "3.1.242"' in html
assert 'const ASSET_BUILD = "build563"' in html
assert 'APP_VERSION="3.1.242"' in (root / 'src/core/config.js').read_text()
assert 'offline563' in (root / 'src/worldRaid/WorldRaidOfflineCache430.js').read_text()

if base.is_dir():
    oldhtml = (base / 'index.html').read_text()
    oldmap = json.loads(re.search(r'<script type="importmap">(.*?)</script>', oldhtml, re.S)[1])['imports']
    assert set(oldmap).issubset(mapping)
    for key, value in oldmap.items():
        if value.split('?')[0] not in {'./' + name for name in modules}:
            assert mapping[key] == value, key
    assert (root / 'world-raid-offline563-sw.js').read_text() == (base / 'world-raid-offline562-sw.js').read_text().replace('build562', 'build563')
    oldcss = re.findall(r'<link[^>]+rel="stylesheet"[^>]*>', oldhtml)
    newcss = re.findall(r'<link[^>]+rel="stylesheet"[^>]*>', html)
    assert len(newcss) == len(oldcss) + 1
    assert all(link in newcss for link in oldcss)

report = json.loads((root / 'docs/build563/browser.json').read_text())
assert not report['errors'] and not report['failed']
assert len(report['sizes']) == 12
tap = (root / 'docs/build563/tests.tap').read_text()
assert '# tests 142\n' in tap and '# pass 142\n' in tap and '# fail 0\n' in tap
preserved = json.loads((root / 'docs/build563/preserved.json').read_text())['unchanged']
assert len(preserved) == 44
for item in preserved:
    content = (root / item['path']).read_bytes()
    assert hashlib.sha256(content).hexdigest() == item['sha256'], item['path']
    if base.is_dir():
        assert content == (base / item['path']).read_bytes()
for item in previous['files']:
    if item['path'] in carried - runtime:
        assert hashlib.sha256((root / item['path']).read_bytes()).hexdigest() == item['sha256']

manifest = {
    'build': 563, 'version': '3.1.242', 'baseBuilds': [560, 561, 562],
    'type': 'patch', 'requiredServerRestart': True,
    'includesBgmFix561': True, 'includesLuckFix562': True,
    'sourceCommit': 'e337da23473b732b9dac667dcb75fb7235e86bba',
    'tests': {'node': 142, 'webSocketClientsPerGame': 4,
              'viewports': [[390, 740], [320, 568], [740, 390]],
              'browser': 'Chromium mobile touch', 'nativeIPhoneTested': False},
    'files': [{'path': name, 'size': (root / name).stat().st_size,
               'sha256': hashlib.sha256((root / name).read_bytes()).hexdigest()}
              for name in sorted(files)]
}
(root / 'BUILD563_MANIFEST.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for name in [*sorted(files), 'BUILD563_MANIFEST.json']:
        archive.write(root / name, name)
with zipfile.ZipFile(out) as archive:
    assert archive.testzip() is None
    for item in manifest['files']:
        assert hashlib.sha256(archive.read(item['path'])).hexdigest() == item['sha256']
print(json.dumps({'file': str(out), 'files': len(files) + 1,
                  'bytes': out.stat().st_size,
                  'sha256': hashlib.sha256(out.read_bytes()).hexdigest()}))
