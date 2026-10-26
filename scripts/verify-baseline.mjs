import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';

const [sourceFile, targetDirectory] = process.argv.slice(2);
if (!sourceFile || !targetDirectory) throw Error('Usage: node scripts/verify-baseline.mjs <existing.sqlite> <new-private-directory>');
const source = path.resolve(sourceFile), directory = path.resolve(targetDirectory);
if (fs.existsSync(directory)) throw Error('Evidence directory already exists; refusing to overwrite');
if (directory.split(path.sep).some(part => ['web','dist'].includes(part.toLowerCase()))) throw Error('Evidence must stay outside public directories');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
function inventory(db) {
  return db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(({name}) => {
    const rows = db.prepare(`SELECT * FROM "${name.replaceAll('"','""')}"`).all().map(row => JSON.stringify(row)).sort();
    return {table:name, rows:rows.length, sha256:hash(JSON.stringify(rows))};
  });
}
function validate(db) {
  assert.equal(db.pragma('integrity_check',{simple:true}),'ok');
  assert.deepEqual(db.pragma('foreign_key_check'),[]);
  const reports=db.prepare('SELECT attempt_id,owner_id,payload FROM reports').all();
  for(const row of reports){
    const report=JSON.parse(row.payload);
    assert.equal(report.items.length,100);
    assert.equal(new Set(report.items.map(item=>item.question.id)).size,100);
    assert.equal(report.stats.correct,report.items.filter(item=>item.result==='correct').length);
    assert.equal(report.stats.answered,report.items.filter(item=>item.choice!=null).length);
    if(row.attempt_id){
      const attempt=db.prepare('SELECT owner_id,status FROM attempts WHERE id=?').get(row.attempt_id);
      assert.equal(attempt.owner_id,row.owner_id);assert.equal(attempt.status,'submitted');
    }
  }
}
fs.mkdirSync(directory,{recursive:true,mode:0o700});
const db=new Database(source,{readonly:true,fileMustExist:true});
try {
  validate(db); const original=inventory(db);
  const backup=path.join(directory,'baseline.sqlite');await db.backup(backup);
  const saved=new Database(backup,{readonly:true,fileMustExist:true});
  try {
    validate(saved);assert.deepEqual(inventory(saved),original,'Source changed during verification; take a fresh snapshot');
    const restoredFile=path.join(directory,'restore-check.sqlite');await saved.backup(restoredFile);
    const restored=new Database(restoredFile,{readonly:true,fileMustExist:true});
    try{validate(restored);assert.deepEqual(inventory(restored),original);}finally{restored.close();}
  } finally{saved.close();}
  assert.deepEqual(inventory(db),original,'Source changed during verification; take a fresh snapshot');
  const evidence={checkedAt:new Date().toISOString(),sourceOpenedReadOnly:true,integrity:'ok',foreignKeys:'ok',reportConsistency:'ok',allTablesUnchanged:true,backupRestoredIdentically:true,backupSha256:hash(fs.readFileSync(backup)),tables:original};
  fs.writeFileSync(path.join(directory,'verification.json'),JSON.stringify(evidence,null,2),{mode:0o600});
  console.log(JSON.stringify({directory,...evidence},null,2));
}finally{db.close();}
