from pathlib import Path
import hashlib,json,sys,zipfile

root=Path(__file__).resolve().parents[2]
files=[
    'index.html', 'src/core/config.js', 'src/luck/View511.js',
    'src/worldRaid/WorldRaidOfflineCache430.js', 'src/Styles/build579-luck-art.css',
    'assets/luck579/items-571.webp', 'assets/luck579/items-575.webp',
    'world-raid-offline579-assets.json', 'world-raid-offline579-sw.js', 'README_BUILD579.md'
]
report=json.loads((root/'docs/build579/browser.json').read_text())
assert len(report['cases'])==32 and not report['errors'] and not report['failed']
manifest={
    'build':579, 'version':'3.1.258', 'type':'delta-patch', 'baseBuilds':[578],
    'baseCommit':'ed9d93d9478127771b720192df24023c65944b48', 'serverRestart':False,
    'tests':{'browserCases':32,'staleCacheReproduced':True,'nativeIPhone':False},
    'files':[{'path':p,'size':(root/p).stat().st_size,'sha256':hashlib.sha256((root/p).read_bytes()).hexdigest()} for p in files]
}
(root/'BUILD579_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
out=Path(sys.argv[1]);out.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in files+['BUILD579_MANIFEST.json']:z.write(root/p,p)
with zipfile.ZipFile(out) as z:
    assert z.testzip() is None
    assert all(hashlib.sha256(z.read(f['path'])).hexdigest()==f['sha256'] for f in manifest['files'])
    assert not any(p.startswith('online-server/') for p in z.namelist())
print(json.dumps({'path':str(out),'files':len(files)+1,'bytes':out.stat().st_size}))
