"""Register selected sources and render every page at 300 DPI before Best OCR."""
from pathlib import Path
from pypdf import PdfReader
import json,hashlib,subprocess,datetime
root=Path(__file__).resolve().parent.parent;base=Path('D:/老蒋');run=root/'.local/stage2/production/2023-2024-v2';run.mkdir(parents=True,exist_ok=True)
pop=Path('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe')
sources=[('paper-2023',2023,'paper',base/'stage2 2005-2025年专四真题/2023年法语专四真题/2023年法语专四真题.pdf'),('paper-2024',2024,'paper',base/'stage2 2005-2025年专四真题/2024年法语专四真题/2024年法语专业四级真题.pdf')]
assert all(role in {'paper','answers','explanations'} for _,_,role,_ in sources), 'Out-of-scope document'
records=[]
for id,year,kind,file in sources:
 folder=run/id;folder.mkdir(parents=True,exist_ok=True);reader=PdfReader(file);count=len(reader.pages);raw=[p.extract_text() or '' for p in reader.pages];(folder/'original-text-layer.json').write_text(json.dumps(raw,ensure_ascii=False,indent=2),encoding='utf8')
 # A new explicit run always renders all pages, even if the source already has text.
 subprocess.run([str(pop),'-r','300','-png',str(file),str(folder/'page')],check=True,capture_output=True)
 pages=sorted(folder.glob('page-*.png'));assert len(pages)==count
 records.append({'id':id,'year':year,'kind':kind,'path':str(file),'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'originalPages':count,'originalPagesWithText':sum(bool(t.strip()) for t in raw),'forceRasterized':True,'dpi':300,'pageImages':[{'page':i+1,'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for i,p in enumerate(pages)],'output':str(folder/'best-ocr.pdf')});print(f'{id}: rendered {count} pages, originally {sum(bool(t.strip()) for t in raw)} with text',flush=True)
manifest={'manifestVersion':1,'id':'2023-2024-v2','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sources':records,'excludedDuplicates':[{'name':'111.pdf','reason':'Mixed 2024 pages1-25 and 2023 pages26-45; original single-year sources selected instead'},{'name':'2023年法语专四真题无水印版(1).pdf','reason':'Alternative scan retained for visual cross-check; not a second paper to import'}],'status':'rasterized','scope':{'included':['paper','answers','explanations'],'excluded':['transcript','translation','audio']},'supersedesRun':'2023-2024-v1 (out-of-scope transcript side outputs excluded from all imports)'}
(run/'raster-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
