"use strict";
// Publication staging only: byte-exact runtime copies, never player storage.
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),assert=require("node:assert/strict");
const root=fs.realpathSync(path.resolve(__dirname,"../..")),prototype=path.join(root,"prototype"),site=path.join(root,"sites/azmara-private-preview"),dist=path.join(site,"dist");
const manifest=JSON.parse(fs.readFileSync(path.join(site,".openai/hosting.json"),"utf8"));
assert.equal(manifest.project_id,"appgprj_6ac7643d3f588191ba2157dfe1972c3d");assert.equal(manifest.static.directory,"dist");
const files=new Set(fs.readdirSync(prototype).filter(n=>/\.(html|css|js)$/.test(n)));
function walk(dir,prefix=""){for(const e of fs.readdirSync(dir,{withFileTypes:true})){assert(!e.isSymbolicLink(),"No links in publication");const p=prefix+e.name;if(e.isDirectory())walk(path.join(dir,e.name),p+"/");else{assert(e.isFile());files.add(p);}}}
// Retain the previously audited runtime asset selection, not all historical art.
walk(path.join(dist,"assets"),"assets/");
for(const profile of ["desktop","compact"])for(const material of ["timber","adobe","sandstone"])files.add(`assets/town-wall-${profile}-${material}-v19.png`);
const hash=f=>crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex"),receipt={draft:true,projectId:manifest.project_id,files:{},excluded:["project documents","tests","tools","debug screenshots","mobile assets","player data"],knownLimits:["phone Fit overlap/framing","extra painted towers","gate target alignment","Step 5 not complete"]};
for(const name of [...files].sort()){
  assert(/^(assets\/.*\.(png|svg)|[^/]+\.(html|css|js))$/.test(name),"Unexpected runtime file: "+name);
  const from=path.join(prototype,name),to=path.join(dist,name);assert(fs.lstatSync(from).isFile()&&!fs.lstatSync(from).isSymbolicLink());
  if(/\.(html|css|js|svg)$/.test(name)){const text=fs.readFileSync(from,"utf8");assert(!/stOAa[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]+|github_pat_[A-Za-z0-9_]+|sk-proj-[A-Za-z0-9_-]+|PRIVATE — API KEYS/i.test(text),"Sensitive source pattern: "+name);}
  fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);assert.equal(hash(from),hash(to));receipt.files[name]=hash(to);
}
for(const match of fs.readFileSync(path.join(dist,"index.html"),"utf8").matchAll(/(?:src|href)="([^"?#]+)(?:\?[^"#]*)?"/g)){
  const value=match[1];if(/^(?:https?:|#|data:)/.test(value))continue;assert(fs.existsSync(path.join(dist,value)),"Missing entry dependency: "+value);
}
const actual=[];function list(dir,prefix=""){for(const e of fs.readdirSync(dir,{withFileTypes:true})){assert(!e.isSymbolicLink());const p=prefix+e.name;e.isDirectory()?list(path.join(dir,e.name),p+"/"):actual.push(p);}}list(dist);assert.deepEqual(actual.sort(),[...files].sort());
fs.writeFileSync(path.join(root,"evidence/2026-10-11-wall-build/publication-source-receipt.json"),JSON.stringify(receipt,null,2)+"\n");
console.log(JSON.stringify({passed:true,runtimeFiles:files.size,byteExact:true,manifestUnchanged:true,excluded:receipt.excluded,knownLimits:receipt.knownLimits}));
