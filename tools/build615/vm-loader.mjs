// Runs production message handlers without loading unrelated browser artwork,
// wallet modules or audio. Callers supply the real simulation/clock dependencies.
import fs from 'node:fs';import vm from 'node:vm';
export async function productionModule(path,dependencies={},globals={}){
 const filename=new URL('../../'+path,import.meta.url),source=fs.readFileSync(filename,'utf8');
 const context=vm.createContext({URL,Date,performance,console,structuredClone,setInterval:()=>({unref(){}}),document:{addEventListener(){}},window:{addEventListener(){}},...globals});
 const module=new vm.SourceTextModule(source,{context,identifier:filename.href,initializeImportMeta(meta){meta.url=filename.href;}});
 await module.link(async spec=>{
  const found=[...source.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g)].filter(m=>m[2]===spec);
  const names=found.length?[...new Set(found.flatMap(m=>m[1].split(',').map(x=>x.trim().split(/\s+as\s+/)[0]).filter(Boolean)))]:['default'];
  const values=dependencies[spec]??{};
  return new vm.SyntheticModule(names,function(){for(const name of names)this.setExport(name,values[name]??function(){return undefined;});},{context});
 });await module.evaluate();return module.namespace;
}
