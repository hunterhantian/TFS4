import json,hashlib,re
from pathlib import Path
from pypdf import PdfReader
root=Path.cwd(); base=Path('D:/老蒋'); out=[]
paths=[base/'audio/2025法语专四听力原声音频.mp3']+list((base/'stage1 基准测试').glob('*'))+list((base/'stage2 2005-2025年专四真题/2025法语专四真题及解析').glob('*'))+[Path('E:/Users/Administrator/Downloads/2025法语专四_完整数字化母文档_听力卷面答案库.md')]
for p in paths:
 if not p.is_file() or '答题卡' in p.name: continue
 item={'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'provenance':'user-provided; official provenance unconfirmed'}
 if p.suffix=='.pdf':item['pages']=len(PdfReader(p).pages)
 out.append(item)
(root/'data/source-manifest.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
p=base/'stage1 基准测试/2025专四真题答案.pdf'; text=PdfReader(p).pages[0].extract_text(); keys={}
for a,b,letters in re.findall(r'(\d+)-(\d+)\s+([A-D]{5})',text):
 assert int(b)-int(a)==4
 for n,c in enumerate(letters,int(a)): keys[n]=c
assert len(keys)==100
candidate=json.loads((root/'data/2025-candidate.json').read_text(encoding='utf8'))
diffs=[{'questionNo':q['originalNo'],'working':q['answer']['value'],'providedPdf':keys[q['originalNo']],'status':'review_required'} for q in candidate['questions'] if keys[q['originalNo']]!=q['answer']['value']]
(root/'data/answer-audit.json').write_text(json.dumps({'sourceSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'sourcePage':1,'officialProvenance':'unconfirmed','compared':100,'differences':diffs,'preservedReviewFlags':[55,62,100]},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(diffs)

