// Authored classifications for the three reviewed MD papers, not a keyword classifier.
// Each assignment is a question -> one primary node; no question-pair annotation is generated.
export const subject='fr-objective';
export const nodes=[];
const branch=(key,name,parent=null)=>{nodes.push({id:'obj-'+key,parentId:parent?'obj-'+parent:null,name,definition:name+'的分类目录；本层汇总不表示所有子题考查同一规则',leaf:false});};
const leaf=(key,name,parent,definition)=>{nodes.push({id:'obj-'+key,parentId:'obj-'+parent,name,definition,leaf:true});};
for(const [k,n] of [['grammar','语法'],['vocabulary','词汇'],['reading','阅读'],['listening','听力']])branch(k,n);
for(const [k,n,p] of [
 ['pronouns','代词','grammar'],['possessives','主有代词','pronouns'],['relatives','关系与疑问代词','pronouns'],['personal','人称与不定代词','pronouns'],
 ['verbs','动词','grammar'],['tenses','时态与叙事','verbs'],['nonfinite','非谓语与分词','verbs'],['moods','语式与假设','verbs'],
 ['syntax','句法与连接','grammar'],['relations','逻辑关系','syntax'],['clauses','从句与强调','syntax'],['forms','限定与词形','grammar'],['agreements','性数与词形配合','forms'],['quantity','数量与冠词','forms'],
 ['construction','介词与固定结构','grammar'],['verbprep','动词支配','construction'],['fixed','固定介词与表达','construction'],
 ['meaning','语境词义','vocabulary'],['units','词汇与表达单位','meaning'],['collocation','词汇搭配','vocabulary'],['phrases','语境搭配与选词','collocation'],
 ['r-details','细节理解','reading'],['r-infer','篇章与推理','reading'],['l-task','题干所示听力任务（待核音频）','listening']])branch(k,n,p);
const definitions=[
 ['possessive','主有代词的性数与介词','possessives','按被替代事物的性数选择主有代词，并保留句子支配的介词；所有者性别不决定形式。'],
 ['interrogative','疑问代词lequel的选择','relatives','用lequel系列独立替代被选择的名词，并按所选对象的性数配合，区别限定词quel。'],
 ['relative-cod','关系代词que作直接宾语','relatives','判断关系从句缺少的成分是否为动词直接宾语，据此使用que。'],
 ['relative-de','dont替代de补语','relatives','用dont替代从句动词或名词要求的de补语，不因见到先行词就选择que。'],
 ['relative-preposition','介词后复合关系代词','relatives','保留loin de、le long de等复合介词，以lequel系列衔接先行词；区别可直接用dont的de补语。'],
 ['ce-que','ce que/ce qui引导的名词性从句','relatives','按从句内部缺失的主语或宾语选择ce qui/ce que，而不是按外部句子主语判断。'],
 ['ce-a-quoi','ce à quoi与动词支配介词','relatives','无具体先行词时保留ressembler à的à，以ce à quoi引出内容。'],
 ['relative-person','介词后qui指人','relatives','有指人的先行词且从句保留avec等介词时，使用介词+qui。'],
 ['coi','间接宾语人称代词','personal','téléphoner à等结构指人间接宾语用lui/leur，不能用直接宾语或重读代词代替。'],
 ['clitic-order','直接间接宾语代词顺序','personal','识别指人/指物和直接/间接宾语后，按法语语序排列le/la与lui等弱读代词。'],
 ['clitic-dialogue','对话中代词指代与命令式','personal','在问答转换中同时保留人称、指物及宾语关系，不能只检查代词位置。'],
 ['presentative','voilà前的宾语代词','personal','voilà呈现的人或物可由le/la/les等直接宾语代词代替，并随被呈现对象配合。'],
 ['soi','泛指主语对应soi','personal','on/chacun等泛指主语的重读反身指代使用soi，不机械套用lui或nous。'],
 ['demonstrative','指示代词celui/celle系列','personal','替代已出现的名词时按该名词性数选指示代词，区别形容词性指示限定词。'],
 ['y','y替代à引入的事物补语','personal','y可代替contribuer à等结构中指事物的à补语，不直接等同于指人间接宾语。'],
 ['en-cost','en avoir pour表示花费','personal','en avoir pour une somme表示花费的金额，区别地点代词y和普通直接宾语。'],
 ['en-reference','en的de补语指代','personal','结合被提及的内容识别en所替代的de补语，否定词和宾语结构需共同核查。'],
 ['attribute-le','le替代形容词性表语','personal','le替代前文描述的状态或形容词性表语，不随主语阴阳性配合。'],
 ['tout-pronoun','tout独立作不定代词','personal','tout独立表示一切或全部，可作主语；与限定名词或修饰形容词的tout分开。'],
 ['negative-rien','rien/personne等否定代词','personal','在否定结构中区分人、物及句法位置，关注ne和de引入的补语。'],
 ['indefinite','不定代词与限定词区分','personal','plusieurs等可以独立作代词；quelques作为限定词通常要求名词中心语。'],
 ['quelques-uns','quelques-uns系列的名词替代','personal','独立代替若干对象时用quelques-uns/unes，并按被替代对象的性数配合。'],
 ['nimporte','n’importe qui等任指表达','personal','表达任何人而非没有人或别的人时，按语义选择任指表达。'],
 ['passe-anterieur','过去先完成时的先时关系','tenses','以简单过去时作叙事参照，dès que等从句表达此前已完成的事件。'],
 ['futur-anterieur','先将来时的先时关系','tenses','在未来参照下，从句动作先于另一未来动作完成，区别过去完成及条件式。'],
 ['futur-simple','简单将来时表达未来','tenses','相对于说话时尚未发生的预期事件用简单将来时，依据语境而非单看动词形式。'],
 ['passe-compose','复合过去时叙述完成事件','tenses','叙述过去发生并推进故事的完成事件，区别过去背景状态和此前先时事件。'],
 ['imparfait-state','未完成过去时描述过去状态','tenses','描述过去的年龄、状态或持续情景，不以该动作的起止作为叙事推进点。'],
 ['imparfait-background','未完成过去时描写事件背景','tenses','为过去发生的主要事件提供天气或同时进行的背景动作。'],
 ['imparfait-habit','未完成过去时表达过去习惯','tenses','toujours、chaque été等语境表示过去反复发生的习惯。'],
 ['imparfait-view','未完成过去时表达过去的想法','tenses','在过去叙事中描述当时持续的设想、认识或疑问，而非独立完成事件。'],
 ['plusqueparfait','愈过去时表示过去的过去','tenses','明确某事件在另一个过去参照事件之前已经发生。'],
 ['past-future','条件式现在时表达过去将来','tenses','过去的叙述或转述中，表达相对于当时尚未发生的事件；不是现实条件假设。'],
 ['past-future-anterior','条件式过去时表达过去将来先完成','tenses','在过去将来的参照下标记先完成事件，需结合主句转述时点与从句关系。'],
 ['present-state','直陈式现在时的当前或一般状态','tenses','直接话语中描述当前状态或一般性事实，不因外层过去叙事机械回溯时态。'],
 ['present-progressive','être en train de的当前进行','tenses','在直接引语的当时表达正在进行的活动，注意être的说话时点。'],
 ['futur-proche','aller加不定式表示即将发生','tenses','直接话语中用aller的现在时加不定式表示近期将来或预期结果。'],
 ['since-duration','pendant/depuis的时段与持续','tenses','区分已结束的一段持续时间与从过去延续到参照时点的情况。'],
 ['reported-time','转述中的相对时间表达','tenses','根据转述参照时点选择trois jours plus tard等相对时间，而非直接话语的现在坐标。'],
 ['pronominal-agreement','代词式动词过去分词配合','agreements','判断反身代词的直接或间接宾语功能及是否有其他直接宾语，不一律随主语配合。'],
 ['avoir-agreement','avoir过去分词与前置直接宾语','agreements','avoir复合时态中须判断直接宾语是否前置及其性数；间接宾语或状语不触发该配合。'],
 ['etre-agreement','être复合时态的分词配合','agreements','使用être作为助动词的非反身动词通常使过去分词与主语性数配合。'],
 ['distance-no-agreement','表示距离的courir分词不配合','agreements','courir的距离数量补语在该意义下是状语，不能把que前的距离当作直接宾语强制配合。'],
 ['vieux','元音前的vieil变体','agreements','vieux在阳性单数元音或哑音h前用vieil，区别阴性vieille。'],
 ['compound-plural','复合名词的复数','agreements','按复合名词内部词性关系确定chef-d’œuvre等词的复数，不简单将每一部分加s。'],
 ['colour','颜色形容词不变的条件','agreements','辨别复合颜色及名词转颜色形容词的不变形式，区别普通单一颜色的配合。'],
 ['participle-adjective','过去分词与现在分词的状态/主动区别','nonfinite','区分表示承受后状态的过去分词与主动特征的现在分词或动形容词。'],
 ['adverb-cher','形容词转副词的不变形式','agreements','coûter cher中cher修饰动词，不能因为主语性数而进行形容词配合。'],
 ['subject-agreement','并列主语的人称配合','agreements','含第一人称等并列主语时，动词人称按组合后的主语确定。'],
 ['tout-adverb','副词tout的特殊配合条件','agreements','tout修饰形容词时通常不变；阴性形容词以辅音或有声h开头时配合，heureuse等哑音h前不套用该例外。'],
 ['tel','tel que与所举对象的配合','agreements','tel que举例时结合先行名词的性数选择tel/tels/telles等形式。'],
 ['infinitive-past','过去不定式表示先完成','nonfinite','在不定式结构中表达先于主句参照动作已发生的行为。'],
 ['infinitive-link','介词后不定式','nonfinite','attendre de等结构后保留原形不定式，区分分词与变位动词。'],
 ['perception-infinitive','感知动词后的不定式','nonfinite','entendre等感知结构可接不定式描述所感知的动作。'],
 ['gerund','副动词en加现在分词','nonfinite','用en+现在分词表达与主语关联的方式或同时动作；不可与独立现在分词混淆。'],
 ['present-participle','现在分词修饰名词','nonfinite','现在分词表达被修饰对象主动进行的动作，不具备独立谓语的时态人称。'],
 ['past-participle-detached','分离过去分词表达完成状态','nonfinite','parvenu等过去分词在分离结构中表达主语先完成或到达的状态。'],
 ['past-participle-passive','过去分词表达被动修饰','nonfinite','被修饰对象承受动作时使用过去分词，并与对象性数配合。'],
 ['compound-participle','复合分词表达先时','nonfinite','ayant+过去分词等结构表示相对于主句更早完成的行为。'],
 ['verbal-participle','现在分词与动形容词的区别','nonfinite','有直接宾语等动词性补语时识别现在分词，不作形容词性数配合。'],
 ['imperative','命令式表达要求','moods','结合称呼和指令语境使用命令式，不把不定式直接用作已给人称的请求。'],
 ['past-regret','条件式过去时表达责备或遗憾','moods','对过去本不应发生或未发生的行为表达责备/遗憾。'],
 ['comme-si','comme si后的时态','moods','comme si表达非现实比较时使用相应未完成过去时或愈过去时，区别条件式和虚拟式。'],
 ['subj-emotion','情感评价后虚拟式','moods','être heureux que等情感评价后选择虚拟式，按句中参照关系判断。'],
 ['subj-improbable','低可能性表达后虚拟式','moods','il est peu probable que等低可能性判断后使用虚拟式。'],
 ['subj-request','要求意愿后的虚拟式','moods','demander que等要求结构后的从句使用虚拟式，区别陈述既成事实。'],
 ['hope-indicative','espérer que后的直陈式','moods','肯定希望表达后按未来事件选直陈式未来形式，而非仅见que就用虚拟式。'],
 ['if-counterfactual','过去非现实条件句','moods','si+愈过去时表示与过去事实相反的条件，结果从句使用条件式过去时。'],
 ['au-cas-ou','au cas où后的条件式','moods','表达万一的au cas où引导条件式，区别要求虚拟式的其他连接词。'],
 ['cause-puisque','puisque引出已知原因','relations','把原因作为已知前提解释结论，区别普通新原因或转折。'],
 ['cause-pour','pour加过去不定式表示原因','relations','pour avoir fait等表达因已发生的行为受罚等原因，而非目的。'],
 ['concession-prep','让步介词malgré/en dépit de','relations','让步背景与结果相反时使用malgré/en dépit de等名词性结构。'],
 ['concession-quoi','quoi que表示无论什么','relations','quoi que表示任意事物的让步，不等同于连词quoique。'],
 ['concession-qui','qui que表示无论何人','relations','qui que表示人的任指让步，不能与quoi que或quel que互换。'],
 ['concession-quel','quel que与名词性数配合','relations','quel que+être等引入让步时，quel按后面的名词性数配合。'],
 ['concession-quelque','quelque修饰形容词的让步','relations','quelque+形容词+que表达无论多么，不按名词限定词的规则配合。'],
 ['concession-beau','avoir beau加不定式','relations','avoir beau+不定式表达尽管做了仍无效的让步关系，beau保持固定形式。'],
 ['opposition','en revanche等转折关系','relations','根据前后句相反对照而选转折连接表达，不因出现观点就用因果词。'],
 ['addition','non seulement…mais aussi递进并列','relations','与non seulement配对构成递进并列，不能用其他连接词替代配对结构。'],
 ['degree-pour','trop…pour的程度与结果','relations','trop+形容词+pour表达程度妨碍后续行为，区别预计持续时间。'],
 ['degree-result','tellement等程度与结果','relations','根据qu’结果从句识别程度关联结构，不只用单一程度副词填空。'],
 ['before-que','avant que的先后与虚拟式','clauses','表达在另一行为发生之前，avant que后用虚拟式；可出现赘词ne。'],
 ['purpose-que','pour que表达目的','clauses','以pour que连接完整主谓从句表达目的，并核查虚拟式；不与时间先后从句混同。'],
 ['unless','à moins que表达除非','clauses','用à moins que引出阻止主句实现的例外条件，并辨别虚拟式及赘词ne。'],
 ['sans-que','sans que引出未发生的伴随情况','clauses','完整主谓从句用sans que而不是只接sans，关注虚拟式。'],
 ['des-que','dès que表示一发生就','clauses','表达事件一发生另一事件随即发生，用dès que连接完整从句。'],
 ['cleft','c’est…que强调句','clauses','识别被强调成分前已有介词时，用que连接其余句子，不重复介词。'],
 ['pronoun-intensity','combien引导程度感叹','clauses','combien引导多么程度的内容，区别普通数量短语beaucoup。'],
 ['negative-de','否定句的数量冠词de','quantity','普通否定数量名词前不定或部分冠词变de，需区分系动词和对比等例外。'],
 ['negative-ni','ne…ni…ni的并列否定','quantity','对两个对象作并列否定，辨别冠词省略和ni的成对结构。'],
 ['de-adjective','复数形容词前des变de','quantity','复数名词前形容词前置时，通常des改为de，区别固定整体。'],
 ['bien-des','bien des表示很多','quantity','bien表示数量很多时可接des+复数名词，不能机械套用beaucoup de。'],
 ['peu-unpeu','peu/un peu的量词语义','quantity','peu强调少或不足，un peu表示有少量，结合评价方向判断。'],
 ['quelque-number','quelque加数词表示大约','quantity','quelque作副词修饰数词表示大约时不变，不同于不定限定词quelques。'],
 ['majority-de','la majorité de的数量结构','quantity','表示大多数时使用la majorité de等完整数量名词结构，并检查已有介词des。'],
 ['unit-price','按单位计价的冠词与介词','fixed','区分le kilo等商品单价与être payé à l’heure等报酬句式，不机械替换。'],
 ['duration-pour','en avoir pour表示预计时长','fixed','en avoir pour+时段表示预计需要多久，区别pendant、dans、en。'],
 ['intended-duration','pour表示预定任期或时段','fixed','pour+时段描述任命等行为预定覆盖的期限，区别已发生的实际持续与距今时间。'],
 ['par-temps','par tous les temps固定表达','fixed','表示不论天气如何的par tous les temps，不能随意换时间介词。'],
 ['suite-de','à la suite de表事件后果','fixed','表示事件后的结果或因果衔接，区别让步、施事或目的。'],
 ['en-service','en service固定表达','fixed','mettre/mis en service表示投入使用，保留固定介词en。'],
 ['faute-de','à défaut de表示缺少','fixed','缺少某物而采取替代行为时使用à défaut de等完整表达。'],
 ['du-a','dû à表示归因','fixed','être dû à使用过去分词形容词结构表示由某原因造成，不能直接拼接其他原因介词。'],
 ['par-hasard','par un heureux hasard','fixed','表示偶然巧合时使用par un hasard，而不是直接搬用其他原因介词。'],
 ['couvert-de','couvert de的物质补语','fixed','覆盖的物质用de引入，区分材料、施事与地点等意义。'],
 ['pas-de-chance','ne pas avoir de chance搭配','fixed','根据avoir de la chance的习惯搭配及否定形式选择名词。'],
 ['servir-de','servir de的身份/用途补语','verbprep','servir de+名词表示充当或用作，区别se servir de使用某物。'],
 ['preferer-a','préférer A à B','verbprep','比较偏好结构préférer A à B，介词与冠词按名词配合缩合。'],
 ['tenir-a','tenir à加不定式','verbprep','tenir à+不定式表达坚持或重视，区别tenir de/pour。'],
 ['finir-par','finir par表示终于','verbprep','finir par+不定式表达最终发生的结果，区别finir de结束活动。'],
 ['distinguer-de','distinguer A de B','verbprep','区分两项对象时使用distinguer A de B。'],
 ['obeir-a','obéir à的服从对象','verbprep','obéir用à引入服从的对象。'],
 ['colere-contre','se mettre en colère contre','verbprep','表达对某人生气时使用contre，不照搬其他情感词支配。'],
 ['respect-envers','respect envers的情感对象','verbprep','表达对某人的尊重用envers，不与colère contre合并为同一介词知识点。'],
 ['jaloux-de','être jaloux de','verbprep','形容词jaloux以de引出嫉妒对象。'],
 ['dependant-de','dépendant de的依赖对象','verbprep','dépendant以de引入所依赖的因素。'],
 ['consister-en','consister en的组成内容','verbprep','consister en表达组成内容，区别consister à引入行为。'],
 ['determiner-a','déterminer quelqu’un à faire','verbprep','促使某人做某事用déterminer quelqu’un à+不定式。'],
 ['permettre-de','permettre à quelqu’un de faire','verbprep','允许某人做某事的permettre结构中，人由à引入，动作由de引入。'],
 ['cloze-reference','篇章中的指代回接','personal','根据材料前文对象的性数及指代关系选代词，不仅按离空位最近的名词。'],
 ['passive-infinitive','被动结构中的过去分词','nonfinite','être之后根据被动意义选择过去分词而不是不定式。'],
 ['r-number','数量、比例与范围定位','r-details','从材料中定位数字、比例及其修饰范围；不能只找到同一个数而忽略限定词。'],
 ['r-time','时间、日期与顺序定位','r-details','定位材料中的日期和时间关系，区分首次、再次、开始或结束。'],
 ['r-detail','人物、事件与事实定位','r-details','把问题所问对象与材料明确陈述的事实对应；相同话题不能代替对应证据。'],
 ['r-cause','原因、目的与功能定位','r-details','根据材料中明确的因果、目的或功能句回答，不将常识当作原文依据。'],
 ['r-exclusion','否定问法与信息排除','r-infer','注意不正确、未提及等否定条件，逐项与原文证据比较，不能选择仅仅真实的项。'],
 ['r-inference','跨句推理与隐含结论','r-infer','结合多处材料作受文本约束的推断，避免无依据扩展。'],
 ['r-main','主旨与写作目的','r-infer','根据全篇内容判断主题或写作目的，避免把局部细节当主旨。'],
 ['r-context','语境词义与术语解释','r-infer','根据文章提供的上下文或定义理解词义，而非只取字典中常见含义。'],
 ['l-place','地点与场景识别（题干任务）','l-task','题干问où或场景，当前仅是任务候选；未读取音频，不能确认实际听辨考点。'],
 ['l-cause','原因与目的识别（题干任务）','l-task','题干问pourquoi或目的，未核音频，不能视为听力知识点已复核。'],
 ['l-action','行动、建议与意图识别（题干任务）','l-task','从题干判断所问行动或意图，实际语音/隐含意图需要音频核验。'],
 ['l-detail','事件与事实识别（题干任务）','l-task','从问题看需要定位事实，未取得听力内容，不确认实际辨识难点。'],
 ['l-time','时间与时长识别（题干任务）','l-task','题干问时间或时长，仅候选分类，不从选项推造音频内容。'],
 ['l-number','数量比例识别（题干任务）','l-task','题干涉及比例数字，实际数字辨听未核音频。'],
 ['l-meaning','话语含义理解（题干任务）','l-task','问题要求解释话语含义，实际转述/推断依据有待音频核验。'],
 ['l-role','人物关系识别（题干任务）','l-task','问题询问说话人关系，仅从题干确定任务，未核听力语境。']
];
for(const d of definitions)leaf(...d);
// Lexical units are explicit meaning targets, not a generic "same topic" bucket.
const lexical={
 certainty:['必然与确定表达forcément','在承诺语境理解forcément与sûrement等确定性表达'],sadness:['avoir le cœur gros的忧伤含义','按语境理解avoir le cœur gros为难过，不按心脏体积直译'],encourage:['favoriser的促进含义','在推动行为的语境理解favoriser与encourager'],control:['dominer情绪的克制含义','理解dominer sa colère为控制情绪而非超过某物'],save:['épargner/ménager的节约保留含义','理解节约钱财或保留体力的épargner/ménager语境义'],fat:['gras及其反义表达','辨别饮食中gras的反义，参考存在可疑处时不改原答案'],light:['allumer/éteindre的相反动作','在灯光语境区分点亮与熄灭'],hard:['dur与软硬语境义','在面包语境理解dur的反义，区分形容词搭配'],artificial:['artificiel/naturel的性质对立','区分人造与天然性质'],joy:['喜悦与不满的表达','理解ravi/se réjouir等喜悦表达，并根据问法判断近义或反义'],actual:['effectivement的实际含义','区别实际与表面、可能等语义'],advantage:['prix intéressant的有利含义','在价格语境理解intéressant为有利或划算'],plan:['projeter de的计划含义','理解projeter de为计划/打算做，而非尝试或完成'],dismiss:['licencier的解雇含义','在劳动关系中理解licencier与renvoyer'],modest:['modeste与奢华生活对立','在生活水平语境理解modeste的反义'],opening:['fermeture/ouverture的开闭对立','区分关闭与开放，不把破产或启用仪式一概等同'],warm:['chaud与衣着搭配','在衣物保暖语境判断chaud的反义候选'],shorten:['raccourcir/allonger的长度变化','在文章篇幅语境区分缩短与加长'],increase:['augmenter/baisser的数量变化','在收入语境区分增长与下降'],authorize:['donner son feu vert的许可含义','理解feu vert为允许或授权，不按颜色直译'],engage:['se livrer à活动的投入含义','理解se livrer à为从事或投入某活动'],demonstrate:['faire preuve de的表现含义','理解faire preuve de为表现出某品质'],promise:['s’engager à的承诺含义','区分承诺、愿望、同意与努力的表达'],beyond:['au-delà de的超出含义','在期望语境理解au-delà de为超过'],correct:['juste/inexact的正确性对立','在计算语境区分正确与不准确'],ordinary:['hors du commun的非凡含义','理解hors du commun与banal的对立'],renew:['renouveler/annuler订阅的对立','在订阅语境区分续订与取消'],spend:['jeter l’argent par les fenêtres的挥霍含义','理解挥霍习语并识别节俭的反义表达']
};
for(const [k,[name,def]] of Object.entries(lexical))leaf('lex-'+k,name,'units',def+'；只以明确的词汇意义关联，不按文章主题匹配。');
const collocations={age:['en âge de','达到做某事的年龄使用en âge de'],access:['avoir accès à','能获得某资源使用avoir accès à'],girls:['上下文中的群体类别','结合列举的教育排斥对象选择群体，非一般男女词义猜测'],influence:['exercer une influence sur','按动词和名词搭配选择exercer une influence sur'],discrimination:['lutter contre les discriminations','根据教育和平等语境判断所反对的现象'],beyond:['au-delà de表示超出某范围','根据句间关系理解au-delà de的范围延展'],right:['droit作为权利名词','区别droit权利、droite右边及其他近形词'],count:['compter des membres','在组织成员语境理解compter为包括/拥有若干成员'],govern:['gouverné par的治理含义','结合组织与Congrès判断治理关系'],around:['autour du monde的环绕含义','理解环球比赛的autour du monde；保留来源au tour du拼写问题'],solo:['en solitaire的独自方式','单人环球赛事语境中的en solitaire'],route:['suivre un itinéraire','跟随明确路线使用suivre un itinéraire'],disqualify:['比赛失格的语境词义','违反规则导致disqualifié，不与承认、放弃混同'],cross:['franchir la ligne d’arrivée','越过终点线的动词搭配'],waves:['dans les vagues的环境介词','按航行所处海浪环境判断介词'],ocean:['océan Indien的地理搭配','按专名表达识别l’océan Indien'],cape:['cap Horn的地理搭配','按原文Horne/Home及海角语境识别cap；不据此改写来源'],coast:['longer la côte','沿海岸航行与穿越/经过的搭配区别'],positive:['mais aussi引出的积极体验','结合负面经历后转向积极体验的篇章关系选词'],security:['se sentir en sécurité','犯罪增加的语境对应安全感，而非身体健康'],daily:['utilisation quotidienne','价格过高限制日常使用的语境选词'],cover:['couvrir une zone','描述交通线路覆盖区域的动词搭配'],guarantee:['heure d’arrivée garantie','交通不确定性与到达时间有保证的词义搭配'],increasing:['de plus en plus修饰增长趋势','结合心理观念变化和推广行为判断频率趋势'],indeed:['en effet引出解释例证','后文提供租赁服务的例证以支持前述判断']};
for(const [k,[name,def]] of Object.entries(collocations))leaf('col-'+k,name,'phrases',def+'。');

export const assignments={};
const assign=(year,start,keys)=>{const list=keys.trim().split(/\s+/);for(const [i,key] of list.entries())assignments[`${year}:${start+i}`]={key};};
// Listening: question-task candidates only; never claimed as audio-reviewed classifications.
assign(2012,1,'l-place l-action l-cause l-meaning l-action l-cause l-action l-cause l-detail l-detail l-detail l-number l-number l-detail l-detail l-detail l-cause l-detail l-detail l-detail');
assign(2013,1,'l-place l-time l-action l-cause l-cause l-action l-place l-meaning l-detail l-action l-detail l-time l-time l-detail l-detail l-detail l-cause l-cause l-action l-number');
assign(2023,1,'l-place l-action l-meaning l-detail l-cause l-detail l-detail l-role l-action l-action l-role l-time l-cause l-detail l-time l-action l-cause l-detail l-cause l-cause');
assign(2012,21,'lex-certainty lex-sadness lex-encourage lex-control lex-save lex-fat lex-light lex-hard lex-artificial lex-joy');
assign(2013,21,'lex-actual lex-advantage lex-plan lex-save lex-dismiss lex-modest lex-opening lex-warm lex-shorten lex-increase');
assign(2023,21,'lex-authorize lex-engage lex-demonstrate lex-promise lex-beyond lex-correct lex-ordinary lex-renew lex-spend lex-joy');
assign(2012,31,'col-age col-access col-girls col-influence col-discrimination col-beyond col-right passive-infinitive col-count col-govern');
assign(2013,31,'col-around col-solo col-route col-disqualify col-cross col-waves col-ocean col-cape col-coast col-positive');
assign(2023,31,'cloze-reference col-security dependant-de col-daily col-cover col-guarantee col-increasing col-indeed permettre-de majority-de');
assign(2012,41,`interrogative pronominal-agreement servir-de concession-quoi possessive preferer-a passe-anterieur vieux tout-pronoun duration-pour
cause-puisque futur-anterieur tenir-a presentative clitic-order en-service finir-par coi soi distinguer-de
comme-si unit-price adverb-cher compound-plural colour participle-adjective avoir-agreement before-que infinitive-past subj-emotion
subject-agreement before-que imparfait-habit hope-indicative gerund degree-pour relative-de faute-de du-a unless`);
assign(2013,41,`relative-cod obeir-a cause-pour concession-prep interrogative pronoun-intensity par-temps suite-de negative-rien colere-contre
possessive indefini relative-de en-cost negative-de soi respect-envers en-reference quelques-uns unit-price
possessive degree-pour peu-unpeu opposition addition comme-si unless demonstrative since-duration relative-preposition
jaloux-de before-que relative-person clitic-order concession-quel des-que au-cas-ou sans-que concession-qui concession-quelque`);
// Keep the explicit spelling of the catalogue key rather than guessing a label from text.
assignments['2013:52'].key='indefinite';
assignments['2012:68'].key='purpose-que';
assign(2023,41,`unit-price de-adjective colour bien-des negative-ni since-duration possessive y duration-pour consister-en
relative-preposition before-que relative-de verbal-participle par-hasard pronominal-agreement distance-no-agreement negative-rien ce-que tel
determiner-a ce-a-quoi tout-adverb subj-improbable comme-si concession-prep concession-qui pas-de-chance concession-beau quelque-number
cleft couvert-de nimporte attribute-le clitic-dialogue degree-result unless past-future if-counterfactual reported-time`);
assignments['2023:49'].key='intended-duration';
assign(2012,81,'r-detail r-number r-number r-inference r-inference r-inference r-time r-detail r-time r-inference r-detail r-number r-detail r-detail r-exclusion r-context r-detail r-exclusion r-exclusion r-exclusion');
assign(2013,81,'r-main r-context r-cause r-detail r-time r-main r-time r-number r-cause r-time r-detail r-detail r-number r-inference r-exclusion r-detail r-detail r-detail r-context r-exclusion');
assign(2023,81,'r-main r-detail r-detail r-exclusion r-detail r-number r-exclusion r-number r-cause r-inference r-main r-inference r-detail r-detail r-detail r-context r-detail r-detail r-detail r-context');
assignments['2012:95'].key='r-detail';
assignments['2013:95'].key='r-detail';
assignments['2023:90'].key='r-detail';
export const verbAssignments={
 2012:'imperative futur-simple passe-compose imparfait-state compound-participle imparfait-state passe-compose plusqueparfait imparfait-state imparfait-background perception-infinitive passe-compose passe-compose plusqueparfait past-participle-detached present-participle imparfait-background past-participle-passive imparfait-background past-regret'.split(' '),
 2013:'avoir-agreement imparfait-state present-state imparfait-habit present-state futur-simple futur-simple imparfait-view past-future imparfait-background imparfait-background passe-compose imparfait-view gerund infinitive-link passe-compose imparfait-state imparfait-state imparfait-view imparfait-state'.split(' '),
 2023:'passe-compose pronominal-agreement etre-agreement passe-compose imparfait-state infinitive-past present-progressive futur-proche present-state present-state passe-compose past-future past-future-anterior passe-compose present-state passe-compose gerund passe-compose subj-request imperative'.split(' ')
};
export const holds={
 '2012:44':'原文disc疑似识别错误，来源阻断。','2012:48':'选项B/C重复，来源阻断。','2012:67':'选项同时改变时态和分词配合，单一主考点需进一步复核，暂不正式匹配。','2012:68':'缺少明确空位，连接词主考点暂留候选。','2012:86':'人物国籍并未在MD直接说明，需要外部常识的可能性尚未排除，仅保留阅读任务候选。',
 '2013:31':'原文au tour du疑似拼写错误，暂留候选。','2013:46':'题面没有明确空位。','2013:55':'题面没有明确空位。','2013:58':'选项nc疑似识别错误，保留候选。','2013:75':'题面没有明确空位。','2013:90':'问题问展会结束后，但材料活动时点与参考存在疑点；仅记录时间任务候选。',
 '2023:43':'rose和bleu ciel可能同时合理，保留颜色规则候选，不把参考当唯一答案证明。','2023:76':'疲劳与步行的语义衔接存在疑问，程度结果结构暂留候选。','2023:v9':'转述时态与当前判断的边界有歧义，参考现在时不能直接证明唯一主规则。','2023:v10':'与第9空相连的间接引语可作当前性质陈述或时态回溯，参考donne不足以确定唯一时态规则，暂留候选。','2023:v16':'参考给fais而上下文为过去叙事，时态参考待核，不采纳为确定归类。'
};
for(let n=81;n<=85;n++)holds['2013:'+n]='共享材料有独立省略号，来源完整性阻断。';
export const specificNotes={
 '2012:45':'affaires是被替代的阴性复数事物，m’occuper保留de支配；不是按所有者性别配合。',
 '2013:51':'clés为被替代的阴性复数事物，perdu后的空位为宾语；与主有代词节点相符。',
 '2013:61':'appareil photo为阳性单数，被替代事物决定主有代词的性数。',
 '2023:47':'poissons为阳性复数，空位替代对方所属的对象，需保留主有代词性数。',
 '2012:42':'les mains是后置直接宾语，se在se laver les mains中不触发随主语的分词配合。',
 '2023:56':'se sont…de leur erreur要求识别s’apercevoir de及其分词配合，不将réaliser直接套入反身结构。',
 '2023:63':'heureuse以哑音h开头，tout副词保持不变；不能只看形容词阴性就套用配合例外。',
 '2012:75':'en+现在分词表示学习游泳的方式，不是独立谓语或普通不定式。',
 '2013:v14':'attendre表示等待期间同时进行的动作，参考en attendant对应副动词。',
 '2023:v17':'courir描述下降楼梯的方式，参考en courant对应副动词。',
 '2023:v19':'demander à Maman qu’elle…表达要求，从句使用虚拟式；不只按过去叙事机械变位。'
};
