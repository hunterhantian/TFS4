"""Read-only source audit and reproducible 2025 candidate preparation; never opens a database."""
import hashlib, io, json, re, subprocess
from pathlib import Path
from pypdf import PdfReader
from PIL import Image, ImageChops

root=Path(__file__).resolve().parent.parent
base=Path('D:/老蒋')
folder=base/'stage2 2005-2025年专四真题/2025法语专四真题及解析'
files={'paper-baseline':base/'stage1 基准测试/2025年法语专四真题.pdf','paper':folder/'2025年法语专四真题.pdf','answers':folder/'2025专四真题答案.pdf','explanations':folder/'2025年法语专四真题解析.pdf','audio':base/'audio/2025法语专四听力原声音频.mp3'}
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
out=root/'tmp/stage2';out.mkdir(parents=True,exist_ok=True)
poppler=Path('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe')
def image(file,page,scale=1200):
    raw=subprocess.run([str(poppler),'-f',str(page),'-l',str(page),'-scale-to',str(scale),'-singlefile','-png',str(file)],capture_output=True,check=True).stdout
    return raw,Image.open(io.BytesIO(raw)).convert('RGB')

comparison=[]
for page in range(1,19):
    a,ia=image(files['paper-baseline'],page);b,ib=image(files['paper'],page)
    equal=ia.size==ib.size and ImageChops.difference(ia,ib).getbbox() is None
    comparison.append({'page':page,'pixelsEqualAtScale1200':equal,'baselineRenderSha256':hashlib.sha256(a).hexdigest(),'stage2RenderSha256':hashlib.sha256(b).hexdigest()})
    if page in [1,4,7,11,15]: (out/f'paper-{page}.png').write_bytes(b)
    print(f'Compared paper page {page}: {equal}',flush=True)

pages=[p.extract_text() or '' for p in PdfReader(files['explanations']).pages]
for page in [1,52,54,99]: (out/f'explanation-{page}.png').write_bytes(image(files['explanations'],page)[0])
full='';offsets=[]
for i,t in enumerate(pages):offsets.append(len(full));full+=t+'\n'
headings={};expected=21
for m in re.finditer(r'(?m)^\s*(\d{2,3})[.．、。]\s*',full):
    n=int(m.group(1))
    if n==expected:headings[n]=m.start();expected+=1
assert expected==101, f'Missing explanation heading {expected}'
segments={}
for n,start in headings.items():
    end=headings.get(n+1,len(full));quote=full[start:end].strip()
    if n==80:quote=quote.split('时态填空')[0].strip()
    first=max(i for i,o in enumerate(offsets) if o<=start)+1
    last=max(i for i,o in enumerate(offsets) if o<start+len(quote))+1
    segments[n]={'documentId':'explanations','location':f'PDF第{first}–{last}页；第{n}题','quote':quote}

old=json.loads((root/'data/2025-candidate.json').read_text(encoding='utf8'))
reference=json.loads((root/'data/2025-reference-answers.json').read_text(encoding='utf8'))
assert digest(files['answers'])==reference['sourceSha256']
parts=[{'id':part,'label':label,'component':component,'order':order} for order,(part,label,component) in enumerate([('II','Part II · 听力','listening'),('III','Part III · 词汇','vocabulary'),('IV','Part IV · 语法','grammar'),('VI','Part VI · 阅读','reading')],1)]
types=[{'id':k,'label':v} for k,v in [('dialogue','听力对话选择'),('interview','听力访谈选择'),('synonym','近义替换'),('antonym','反义替换'),('cloze','词汇完形'),('grammar-choice','语法选择'),('reading','阅读理解')]]
concepts={
 'synonym':('近义词与近义表达',['近义替换']), 'antonym':('反义词与反义表达',['反义替换']),
 'context-lexis':('语境词义选择',['上下文词义']), 'preposition':('介词与固定搭配',['介词搭配']),
 'conditional':('条件式与假设句',['假设表达']), 'cause':('原因状语从句',['原因连词']),
 'neutral-pronoun':('中性代词le',['中性代词']), 'relative':('关系代词',['关系从句']),
 'concession':('让步状语从句',['让步连词']), 'tout':('tout的词类与配合',['tout用法']),
 'subjunctive':('虚拟式的使用',['虚拟式']), 'time-preposition':('时间介词与期限表达',['时间介词']),
 'possessive':('物主代词',['物主代词配合']), 'indefinite':('不定与泛指代词',['泛指代词']),
 'indirect-question':('间接疑问句',['间接问句']), 'comparison':('比较与程度表达',['比较级与最高级']),
 'infinitive':('不定式结构',['不定式搭配']), 'participle':('分词与分词配合',['分词结构']),
 'future-perfect':('先将来时',['将来完成时']), 'tense':('时态选择与一致',['时态配合']),
 'color':('颜色形容词的配合',['颜色形容词']), 'object-pronoun':('宾语代词与代词顺序',['代词顺序']),
 'reported-time':('间接引语的时间表达',['间接引语时间转换']), 'tel-quel':('tel quel的配合',['原样表达']),
 'time-clause':('时间状语从句',['时间连词']), 'reading-detail':('阅读细节定位与核对',['阅读细节题']),
 'reading-inference':('阅读推断与语义理解',['阅读推断题'])}
grammar=['conditional','cause','neutral-pronoun','relative','concession','tout','tout','preposition','subjunctive','relative','preposition','time-preposition','possessive','subjunctive','indefinite','indefinite','indirect-question','comparison','comparison','infinitive','participle','future-perfect','tense','tense','conditional','subjunctive','comparison','preposition','subjunctive','color','relative','object-pronoun','object-pronoun','conditional','time-clause','comparison','reported-time','tel-quel','subjunctive','indefinite']
assert len(grammar)==40
materials=[{'id':m['id'],'kind':'cloze' if m['id'].startswith('cloze') else 'reading','text':m['text'],'questionIds':[q['id'] for q in old['questions'] if q['materialId']==m['id']]} for m in old['materials']]
materials.insert(0,{'id':'listening-2025','kind':'listening','text':'2025年完整听力录音，含听写与指令；尚未整理分题时间戳。','audioUrl':'/media/2025-listening.mp3','questionIds':[q['id'] for q in old['questions'][:20]]})
questions=[];answer_conflicts=[]
for q in old['questions']:
    n=q['originalNo'];assert q['answer']['value']==reference['answers'][str(n)]
    typ=q['type'] if n<=20 or n>=81 else 'synonym' if n<=25 else 'antonym' if n<=30 else 'cloze' if n<=40 else 'grammar-choice'
    concept=None if n<=20 else typ if n<=30 else 'preposition' if n==35 else 'tense' if n==36 else 'context-lexis' if n<=40 else grammar[n-41] if n<=80 else 'reading-detail'
    classification=None if concept is None else {'primaryId':concept,'auxiliaryIds':[],'basis':f'根据随附解析原文提出「{concepts[concept][0]}」候选；需逐题人工核对，尤其区分主要解题依据和辅助语法。','producer':'Codex外部AI候选整理-2026-10-27，未人工审核'}
    explanation=segments.get(n)
    claimed=re.findall(r'(?:正确答案[是为：:\s]*|答案选\s*)([A-D])(?:[.．、\s（(]|$)',explanation['quote']) if explanation else []
    conflicts=sorted({v for v in claimed if v!=q['answer']['value']})
    if conflicts:answer_conflicts.append({'questionNo':n,'reference':q['answer']['value'],'explanationClaims':conflicts,'resolution':'保留指定参考答案；解析措辞人工复核，候选不自动发布'})
    questions.append({'id':q['id'],'version':q['version'],'originalNo':n,'partId':q['formalPart'],'typeId':typ,'materialId':'listening-2025' if n<=20 else q['materialId'],'text':q['text'],'options':q['options'],'answer':{'value':q['answer']['value'],'evidence':{'documentId':'answers','location':'PDF第1页；第'+str(n)+'题','quote':str(n)+'. '+q['answer']['value']}},'explanation':explanation,'classification':classification})
data={'schemaVersion':2,'dataset':'candidate','source':{'id':'tfs4-2025','version':1,'year':2025,'title':'2025法语专四 · 题库候选审核','revisionNote':'从Stage1冻结基线整理100题，附2025解析21–100题原文及AI候选分类；来源待核实，听力无解析；61=A、62=B不变。'},'documents':[{'id':k,'name':p.name,'sha256':digest(p),'kind':k,'provenance':'user_confirmed_reference' if k=='answers' else 'unconfirmed'} for k,p in files.items() if k!='paper-baseline'],'parts':parts,'types':types,'materials':materials,'knowledgePoints':[{'id':k,'name':v[0],'aliases':v[1]} for k,v in concepts.items()],'questions':questions}
(root/'data/2025-stage2-candidate.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
audit={'date':'2026-10-27','files':[{'name':p.name,'role':k,'bytes':p.stat().st_size,'sha256':digest(p)} for k,p in files.items()],'paperComparison':comparison,'paperComparisonScope':'18页逐页Poppler渲染，最长边1200像素，RGB像素比较；不宣称PDF字节或高分辨率完全相同','questions':100,'answersMatchReference':100,'reference61':'A','reference62':'B','explanations':80,'missingExplanationQuestionNos':list(range(1,21)),'candidateClassifications':80,'reviewedClassifications':0,'explanationAnswerConflicts':answer_conflicts,'officialExplanationProvenance':'unconfirmed; not inferred from filename','groupSizes':{m['id']:len(m['questionIds']) for m in materials}}
(root/'data/2025-stage2-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'questions':100,'explanations':80,'conflicts':answer_conflicts,'paperPagesEqual':sum(r['pixelsEqualAtScale1200'] for r in comparison)},ensure_ascii=False),flush=True)
