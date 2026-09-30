from pathlib import Path
import hashlib,json,subprocess,sys,zipfile
root=Path(__file__).resolve().parents[2]
files={x['path'] for x in json.loads((root/'BUILD577_MANIFEST.json').read_text())['files']}
files.update(subprocess.check_output(['git','diff','--name-only','e4a5f08'],cwd=root,text=True).splitlines())
for folder in ['tools/build578','docs/build578']:
 files.update(str(p.relative_to(root)) for p in (root/folder).iterdir() if p.is_file() and p.suffix!='.png')
files.update(['README_BUILD578.md','BUILD577_MANIFEST.json','world-raid-offline578-assets.json','world-raid-offline578-sw.js'])
files.discard('BUILD578_MANIFEST.json')
for p in files:
 assert not p.startswith('online-server/data/') and (root/p).is_file(),p
 if p.endswith(('.js','.mjs')):subprocess.run(['node','--check',str(root/p)],check=True,capture_output=True)
browser=json.loads((root/'docs/build578/browser.json').read_text());assert len(browser['cases'])==4 and not browser['errors'] and not browser['failed']
manifest={'build':578,'version':'3.1.257','type':'cumulative-patch','baseBuilds':list(range(563,578)),'serverRestart':False,'serverRestartFromBefore575':True,'tests':{'browserCases':4,'nativeIPhone':False},'files':[{'path':p,'size':(root/p).stat().st_size,'sha256':hashlib.sha256((root/p).read_bytes()).hexdigest()} for p in sorted(files)]}
(root/'BUILD578_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
out=Path(sys.argv[1])
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(files|{'BUILD578_MANIFEST.json'}):z.write(root/p,p)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for f in manifest['files']:assert hashlib.sha256(z.read(f['path'])).hexdigest()==f['sha256']
print(json.dumps({'path':str(out),'files':len(files)+1,'bytes':out.stat().st_size}))
