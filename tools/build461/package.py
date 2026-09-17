from pathlib import Path
import json, zipfile, hashlib

root = Path(__file__).resolve().parents[2]
previous = root.parent / 'deliverables/ABYSS_Build460_integrated.zip'
out = root.parent / 'deliverables/ABYSS_Build461_integrated.zip'
out.parent.mkdir(exist_ok=True)
previous_hash = hashlib.sha256(previous.read_bytes()).hexdigest()
assert previous_hash == '0149ca7d82f96c10391bd89fa7e5ebdb8fa5c3dcdae65d65326f403da5258f22'
with zipfile.ZipFile(previous) as z:
    assert z.testzip() is None
    old = {i.filename: z.read(i) for i in z.infolist() if not i.is_dir()}
changed_runtime = json.loads((root / 'docs/build461/changed-runtime.json').read_text())
new = {
    'README_Build461.md', 'world-raid-offline461-sw.js',
    'world-raid-offline461-assets.json', 'src/Styles/build461-race-tracking.css',
    'tests/build461-race-follow.test.mjs', *changed_runtime,
}
new.update(p.relative_to(root).as_posix() for p in (root / 'assets/race461').glob('*.webp'))
for folder in ['docs/build461', 'tools/build461']:
    new.update(p.relative_to(root).as_posix() for p in (root / folder).rglob('*')
               if p.is_file() and p.suffix not in ['.png', '.pyc', '.webm', '.mp4']
               and '__pycache__' not in p.parts and 'video-raw' not in p.parts
               and p.name not in ['edit-ui.py', 'implement-core.py', 'implement-ui.py', 'tests-first.txt', 'tests-new.txt', 'tests-baseline.txt', 'package-result.txt'])
new.discard('docs/build461/patch-manifest.json')
entries = set(old) | new
assert not any('/node_modules/' in p or p.startswith(('online-server/data/', '.git/')) for p in entries)
unchanged=['src/race/RaceSimulation456.js','src/race/RaceStrategy455.js','src/race/RaceRules451.js','src/race/RaceTickets456.js','src/race/RaceWallet451.js','src/race/RaceCourse459.js','src/race/RaceTraits453.js','online-server/server.js','online-server/src/RaceCoordinator451.js']
for p in unchanged: assert (root/p).read_bytes()==old[p],p
for p, b in old.items():
    if '/runtime430/' in p or '/runtime443/' in p:
        assert (root / p).read_bytes() == b, p
files = {p: (root / p).read_bytes() for p in sorted(entries)}
updated = [p for p, b in files.items() if p not in old or b != old[p]]
assert {p for p in updated if p in old} <= {'index.html', *changed_runtime}
manifest = {
    'build': 461, 'version': '3.1.140', 'baseline_build': 424,
    'kind': 'cumulative-overwrite', 'save_schema': 84,
    'data_files_included': False, 'removed': [],
    'previous_archive_sha256': previous_hash,
    'source_base_commit': '53b7e195e0138f72f8b131ec3b185d2c736d438d',
    'updated_in_461': updated,
    'files': [{'path': p, 'bytes': len(b), 'sha256': hashlib.sha256(b).hexdigest()}
              for p, b in files.items()],
}
p = root / 'docs/build461/patch-manifest.json'
p.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
files[p.relative_to(root).as_posix()] = p.read_bytes()
temporary = out.with_suffix('.zip.tmp')
with zipfile.ZipFile(temporary, 'w', zipfile.ZIP_DEFLATED, compresslevel=8) as z:
    for p, b in sorted(files.items()):
        z.writestr(p, b)
temporary.replace(out)
with zipfile.ZipFile(out) as z:
    assert z.testzip() is None
    assert len(z.namelist()) == len(set(z.namelist()))
    assert set(old) <= set(z.namelist())
    for p, b in files.items():
        assert z.read(p) == b
print(json.dumps({
    'archive': str(out), 'files': len(files), 'new_or_updated': len(updated),
    'bytes': out.stat().st_size, 'sha256': hashlib.sha256(out.read_bytes()).hexdigest(),
    'preserved_460_files': len(old), 'frozen_runtime_preserved': True,
}))
