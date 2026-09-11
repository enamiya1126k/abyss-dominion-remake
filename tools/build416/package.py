from pathlib import Path
import hashlib, json, re, zipfile, difflib, csv

root=Path(__file__).resolve().parents[2]
base=root.parent/'repo414'
docs=root/'docs/build416'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
runtime=set()
for name in ['ABYSS_Build412_operations_fix_patch.zip','ABYSS_Build413_character_circle_display_patch.zip','ABYSS_Build415_balance_patch.zip']:
    with zipfile.ZipFile(root.parent/'output'/name) as z:
        runtime.update(p for p in z.namelist() if p=='index.html' or p.startswith(('src/','assets/')))
runtime.update(json.loads((docs/'changed-runtime.json').read_text()))
runtime=sorted(runtime)
assert all((root/p).is_file() for p in runtime)
# Every changed existing script must be represented in the cumulative patch.
for p in (root/'src').rglob('*.js'):
    rel=p.relative_to(root).as_posix();old=base/rel
    if not old.exists() or sha(p)!=sha(old):assert rel in runtime, rel
server=[p.relative_to(root).as_posix() for p in (root/'online-server').rglob('*.js')]
assert all((base/p).is_file() and sha(root/p)==sha(base/p) for p in server)
assert 'SAVE_SCHEMA_VERSION=84' in (root/'src/core/config.js').read_text()
assert 'APP_VERSION="3.1.95"' in (root/'src/core/config.js').read_text()
assert len(list(csv.DictReader((root/'docs/build415/編成スキル.csv').open(encoding='utf-8-sig'))))==9696
assert 'tests 224' in (docs/'all-regression.txt').read_text() and 'fail 0' in (docs/'all-regression.txt').read_text()
assert 'tests 224' in (docs/'staged-regression.txt').read_text() and 'fail 0' in (docs/'staged-regression.txt').read_text()
resolution=json.loads((docs/'combat-replay-resolution.json').read_text());assert resolution['unresolved']==0 and resolution['comparisons']==2424
replay=json.loads((docs/'combat-replay-summary.json').read_text());assert replay['matches']==2424 and not replay['differences']
assert all(sha(root/p)==value for p,value in replay['sourceHashes'].items())
online=[json.loads(l) for l in (docs/'online-smoke.jsonl').read_text().splitlines()];assert sum(r['seeds'] for r in online)==270 and all(r['wins']==r['seeds'] for r in online)
manifest=[{'path':p,'before411_sha256':sha(base/p) if (base/p).is_file() else None,'after416_sha256':sha(root/p),'bytes':(root/p).stat().st_size} for p in runtime]
(docs/'runtime-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
(docs/'cumulative-runtime.json').write_text(json.dumps(runtime,indent=2))
(docs/'server-integrity.json').write_text(json.dumps({'baseline_commit':'89540f22fcad9fa9ae952ed71b59fb1c6ca7078c','unchanged_files':len(server),'files':{p:sha(root/p) for p in server}},indent=2))
diff=''
for p in json.loads((docs/'changed-runtime.json').read_text()):
    old=root.parent/'work415'/p
    diff+=''.join(difflib.unified_diff(old.read_text().splitlines(keepends=True),(root/p).read_text().splitlines(keepends=True),fromfile='build415/'+p,tofile='build416/'+p))
(docs/'runtime416.diff').write_text(diff)

files=set(runtime)
files.update(p.relative_to(root).as_posix() for p in (root/'tests').rglob('*.mjs'))
tool_names=['native-harness.mjs','native-source-map.json','source-identity.json','map-source.mjs','encounters.mjs','teams.mjs','replay-integration.mjs','replay-cases.mjs','online-smoke.mjs','render-budget.mjs','package.py']
files.update('tools/build416/'+n for n in tool_names)
doc_names=['README.md','verification-summary.json','攻略編成.csv','編成比較一覧.csv','合格編成100シード.jsonl','target-index.json','species-names.json','protected-baseline.json','runtime-manifest.json','runtime.diff','編成スキル.csv','changed-runtime.json','all-regression.txt','staged-regression.txt','online-verification.jsonl','coop-verification.jsonl','acceptance-pair-single.jsonl','replay-campaign-final.jsonl','検証結果.md']
files.update('docs/build415/'+n for n in doc_names)
files.update(p.relative_to(root).as_posix() for p in (root/'docs/build415').glob('acceptance-[0-7]-source.json'))
doc416=['README.md','検証結果.md','runtime-manifest.json','cumulative-runtime.json','server-integrity.json','runtime416.diff','changed-runtime.json','all-regression.txt','staged-regression.txt','integration-baseline415.txt','combat-replay-summary.json','combat-replay-initial-summary.json','combat-replay-resolution.json','combat-replay.jsonl','online-smoke.jsonl','render-budget.json','styles-provenance.json','validation-summary.json','cache-integrity.json']
files.update('docs/build416/'+n for n in doc416 if (docs/n).exists())
output=root.parent/'output/ABYSS_Build416_integrated_patch.zip'
with zipfile.ZipFile(str(output)+'.tmp','w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in sorted(files):z.write(root/p,p)
    z.writestr('README_Build416.md',(docs/'README.md').read_text())
Path(str(output)+'.tmp').replace(output)
with zipfile.ZipFile(output) as z:
    assert z.testzip() is None
    for row in manifest:assert hashlib.sha256(z.read(row['path'])).hexdigest()==row['after416_sha256']
print(json.dumps({'path':str(output),'bytes':output.stat().st_size,'runtime_files':len(runtime),'entries':len(files)+1,'sha256':sha(output)},ensure_ascii=False))
