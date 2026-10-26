import fs from 'node:fs';
import path from 'node:path';
import {openDatabase,seedBaseline,projectRoot} from '../server/db.mjs';
import {createUser,hashPassword} from '../server/security.mjs';
const [action,username]=process.argv.slice(2);const file=process.env.DB_FILE||path.join(projectRoot,'.local/stage1/app.sqlite');const db=openDatabase(file);
try{
 if(action==='seed')console.log('Seeded confirmed original baseline:',seedBaseline(db));
 else if(action==='create-admin'){if(!process.env.RSZ_ADMIN_PASSWORD)throw Error('Set RSZ_ADMIN_PASSWORD for this command, then clear it');const user=await createUser(db,username,process.env.RSZ_ADMIN_PASSWORD,'admin');console.log('Created admin:',user.username);}
 else if(action==='reset-password'){if(!process.env.RSZ_ADMIN_PASSWORD)throw Error('Set RSZ_ADMIN_PASSWORD for this command, then clear it');if(process.env.RSZ_ADMIN_PASSWORD.length<10)throw Error('Password must have at least 10 characters');const user=db.prepare('SELECT id FROM users WHERE username=?').get(username);if(!user)throw Error('User not found');const hash=await hashPassword(process.env.RSZ_ADMIN_PASSWORD);db.transaction(()=>{db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(hash,user.id);db.prepare('DELETE FROM sessions WHERE user_id=?').run(user.id);})();console.log('Password reset; sessions revoked:',username);}
 else if(action==='backup'){const target=process.argv[3];if(!target)throw Error('Pass a backup file outside web/dist');for(const folder of ['web','dist'])if(path.resolve(target).toLowerCase().startsWith(path.join(projectRoot,folder).toLowerCase()+path.sep))throw Error('Backup must be outside public directories');fs.mkdirSync(path.dirname(path.resolve(target)),{recursive:true});await db.backup(target);console.log('Consistent backup created:',target);}
 else throw Error('Use: seed | create-admin <username> | reset-password <username> | backup <file>');
}finally{db.close();}
