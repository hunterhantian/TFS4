import {escape} from './ui.mjs';

// Render only the formatting tags used by the source papers; all other input stays text.
export function sourceText(value,query=''){
 const input=String(value??'').replace(/\\([_])/g,'$1').replace(/^\s*#{1,6}\s*/gm,'').replace(/\*\*/g,'');
 const tokens=input.split(/(<\/?(?:u|sup|sub|mark)>)/gi),fold=s=>s.normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase('fr');
 const needle=fold(String(query??'').trim());let flat='';for(const token of tokens)if(!/^<\/?(?:u|sup|sub|mark)>$/i.test(token))flat+=fold(token);
 const start=needle?flat.indexOf(needle):-1,end=start<0?-1:start+needle.length;let pos=0;
 return tokens.map(token=>{if(/^<\/?(?:u|sup|sub|mark)>$/i.test(token))return token.toLowerCase();let out='',active=false;for(const char of token){const size=fold(char).length,hit=start>=0&&size>0&&pos<end&&pos+size>start;if(hit&&!active){out+='<mark>';active=true;}else if(!hit&&active){out+='</mark>';active=false;}out+=escape(char);pos+=size;}if(active)out+='</mark>';return out;}).join('');
}
