from pathlib import Path
import hashlib,json,subprocess,sys,zipfile
root=Path(__file__).resolve().parents[2]
files={x['path'] for x in json.loads((root/'BUILD571_MANIFEST.json').read_text())['files']}
files.update(subprocess.check_output(['git','diff','--name-only','cee60a9'],cwd=root,text=True).splitlines())
for folder in ['tools/build572','assets/luck572','docs/build572']:
 files.update(str(p.relative_to(root)) for p in (root/folder).iterdir() if p.is_file() and p.suffix!='.png')
files.update(['README_BUILD572.md','tests/build572-scenery.test.mjs','docs/build512/generated-assets.json','BUILD571_MANIFEST.json','world-raid-offline571-assets.json','world-raid-offline571-sw.js','world-raid-offline572-assets.json','world-raid-offline572-sw.js'])
files.discard('BUILD572_MANIFEST.json')
for p in files:
 assert not p.startswith('online-server/data/') and (root/p).is_file(),p
 if p.endswith(('.js','.mjs')):subprocess.run(['node','--check',str(root/p)],check=True,capture_output=True)
assert '# pass 23\n' in (root/'docs/build572/tests.tap').read_text()
browser=json.loads((root/'docs/build572/browser.json').read_text());assert len(browser['cases'])==6 and not browser['errors'] and not browser['failed']
manifest={'build':572,'version':'3.1.251','type':'cumulative-patch','baseBuilds':list(range(563,572)),'serverRestart':'Only when updating from Build570 or earlier; unchanged from Build571','tests':{'node':23,'browserCases':6,'nativeIPhone':False},'files':[{'path':p,'size':(root/p).stat().st_size,'sha256':hashlib.sha256((root/p).read_bytes()).hexdigest()} for p in sorted(files)]}
(root/'BUILD572_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
out=Path(sys.argv[1])
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(files|{'BUILD572_MANIFEST.json'}):z.write(root/p,p)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for f in manifest['files']:assert hashlib.sha256(z.read(f['path'])).hexdigest()==f['sha256']
print(json.dumps({'path':str(out),'files':len(files)+1,'bytes':out.stat().st_size}))
