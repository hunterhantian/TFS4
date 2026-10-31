# r2 逐组语义去重台账

共66组，净减少79个叶身份；不是新增父节点或隐藏零题叶造成的减少。

## 1. si真实条件用现在时

- 类型：same_rule
- 旧叶：k-si-condition, k-si-present
- 新叶：kp-si-real-present
- 共同规则：si引出现在或面向将来的真实条件，从句使用现在时，不用简单将来或条件式冒充真实条件形式。
- 边界：不合并si未完成过去时的假设和si间接疑问。
- 支持题：2007-V12, 2014-Q035, 2015-Q065
- 近邻反例：2014-Q062, 2018-Q055, 2024-Q067

**2007-V12** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:489–489

```text
Si par hasard, Pierre (revenir) \_\_\_\_\_\_\_ plus tôt que prévu, je (essayer) \_\_\_\_\_\_\_ de vous joindre, mais rien ne (être) \_\_\_\_\_\_\_ moins sûr, considérez cette possibilité comme très hypothétique.
```
归类依据：si de condition future suivi du présent

**2014-Q035** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2014-paper/2014年法语专四真题（无水印版）.md:247–247

```text
35. A. Si B. À moins que C. Parce que D. À condition que
```
归类依据：si vous ne voulez pas être en retard 引真实条件。

**2015-Q065** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2015-paper/2015年法语专四真题（无水印版）.md:384–388

```text
65. L'année prochaine si tu ______ ainsi, tu rateras certainement ta carrière.
A. agis
B. agiras
C. agirais
D. auras agi
```
归类依据：si 引导真实条件，后用现在时 agis。

反例 **2014-Q062**：si + 未完成过去时 avait，主句条件式现在，表示假设。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2014-paper/2014年法语专四真题（无水印版）.md:369。

反例 **2018-Q055**：si + 未完成过去时，主句条件式，表达假设赢得彩票。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2018-paper/2018年法语专四真题（无水印版）.md:296。

反例 **2024-Q067**：与明天假设相反或不确定条件：si + 未完成过去时，主句条件式。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2024-paper/2024年法语专业四级真题.md:559。

## 2. 当前回顾与过去先时的参照选择

- 类型：conditional_duplicate
- 旧叶：k-jamais-comprendre-past, u-sol-2022-v07
- 新叶：kp-past-retrospective-perspective
- 共同规则：n’ai jamais compris从叙述现在回顾，n’avais jamais compris把理解定位为过去参照前；选择取决于叙述参照。
- 边界：这是相同的两参照竞争候选；不吸收所有复合过去时和愈过去时题。
- 支持题：2022-V07
- 近邻反例：2006-V16, 2006-V17, 2008-V15, 2009-V09

**2022-V07** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2022-paper/2022年法语专四真题（无水印）.md:470–470

```text
Au milieu de l'après-midi, nous nous sommes rendus au supermarché. Je(J') *(remarquer)* <u>(5)</u> depuis longtemps que lorsque maman avait le cafard(感到沮丧), nous*(aller)* <u>(6)</u> faire des courses. Je*(ne jamais comprendre)* <u>(7)</u> comment un paquet de céréales ou des légumes frais *(pouvoir)* <u>(8)</u> faire du bien au moral...Je la (l')*(regarder)* <u>(9)</u> s'affairer(忙碌)dans les rayonnages, me demandant si elle se souvenait que je(j')*(être)* <u>(10)</u> à côté d'elle. Le caddie(购物推车)plein et le porte-monnaie vide, nous*(retrer)* <u>(11)</u> à la maison. Maman *(passer)* <u>(12)</u> un temps infini à *(ranger)* <u>(13)</u> les provisions.
```
归类依据：从叙述现在回顾从未理解，用n’ai jamais compris；若把认识限在当时过去参照，也可n’avais jamais compris，两者时间视角不同。

反例 **2006-V16**：appel de la veille antérieur à la réponse；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:407。

反例 **2006-V17**：经理先收到Landru电话再作答，电话先于avait répondu，愈过去最明确；源télephoner缺重音按téléphoner。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:407。

反例 **2008-V15**：participe passé après avait；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:485。

反例 **2009-V09**：action antérieure à la réponse, le est déjà écrit；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2009-paper/2009年法语专四真题及答案 校对 + 仿考试卷排版.md:549。

## 3. 运动动词及物用法选avoir

- 类型：same_rule
- 旧叶：k-descendre-transitif, k-sortir-transitif
- 新叶：kp-transitive-motion-avoir
- 共同规则：descendre、sortir等运动动词有直接宾语时，复合时态选avoir；与同一动词不及物移动义用être的情形区分。
- 边界：不将所有运动动词或所有复合时态都归入本叶；须有及物/不及物转换证据。
- 支持题：2022-V16, 2022-V18
- 近邻反例：2008-V07, 2022-V11, 2022-V17

**2022-V16** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2022-paper/2022年法语专四真题（无水印）.md:472–472

```text
Ce jour-là, maman *(faire)* <u>(14)</u> un gâteau. Elle*(mettre)* <u>(15)</u> deux couverts sur la table de la cuisine, *(descendre)* <u>(16)</u> la chaise de mon père à la cave et elle *(remonter)* <u>(17)</u> s'asseoir en face de moi. Elle *(sortir)* <u>(18)</u> du tiroir le paquet de bougis usées que j'avais soufflées à mon anniversaire, en a planté une au milieu du gâteau et l'a allumée.
```
归类依据：descendre la chaise 有直接宾语，复合过去时用 avoir；空前并无助动词。

**2022-V18** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2022-paper/2022年法语专四真题（无水印）.md:472–472

```text
Ce jour-là, maman *(faire)* <u>(14)</u> un gâteau. Elle*(mettre)* <u>(15)</u> deux couverts sur la table de la cuisine, *(descendre)* <u>(16)</u> la chaise de mon père à la cave et elle *(remonter)* <u>(17)</u> s'asseoir en face de moi. Elle *(sortir)* <u>(18)</u> du tiroir le paquet de bougis usées que j'avais soufflées à mon anniversaire, en a planté une au milieu du gâteau et l'a allumée.
```
归类依据：sortir le paquet 有直接宾语，复合过去时用 avoir。

反例 **2008-V07**：événement ponctuel achevé；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:483。

反例 **2022-V11**：购物后回家推进过去叙事，rentrer用être。原retrer为转写异常，按rentrer解释；rentrés为未限定性别的默认复数，若叙述者也是女性可rentrées。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2022-paper/2022年法语专四真题（无水印）.md:470。

反例 **2022-V17**：妈妈自己上楼坐下，不及物 remonter 用 être，阴性单数。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2022-paper/2022年法语专四真题（无水印）.md:472。

## 4. inventer/imaginer：虚构人物生活

- 类型：synonymous_sense
- 旧叶：k-inventer-vie, k-imaginer-vie
- 新叶：kp-fictional-life-invention
- 共同规则：作者借照片创作小说人物生活时，inventer une vie与imaginer leur vie均表达虚构、设想人物生活。
- 边界：不合并一般认为、认识人物或真实查找人物资料。
- 支持题：2025-Q034, 2025-Q037
- 近邻反例：2025-Q040

**2025-Q034** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2025-paper/2025年法语专四真题.md:235–235

```text
34. A. cacher B. inventer C. partager D. réserver
```
归类依据：不认识照片中人而为其写小说，leur inventer une vie最合创作链；B。

**2025-Q037** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2025-paper/2025年法语专四真题.md:238–238

```text
37. A. transformer B. perdre C. imaginer D. vivre
```
归类依据：凝视照片并想象生活与此前inventer呼应，C imaginer；不是作者真实经历他人人生。

反例 **2025-Q040**：D recherches呼应partie à leur recherche并使失联者重聚，A chansons虽参与后续共同活动，文本未将其设为重聚主因；D仍为最佳，泛设可能不宜阻断。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2025-paper/2025年法语专四真题.md:241。

## 5. hâte/précipitation：匆忙

- 类型：synonymous_sense
- 旧叶：k-precipitation-hate, k-en-toute-hate
- 新叶：kp-haste-précipitation
- 共同规则：en toute hâte、avec précipitation、précipitamment表达匆忙行事；sans hâte为相反方式。
- 边界：匆忙方式不同于sur-le-champ的立即时点。
- 支持题：2024-Q024, 2025-Q027
- 近邻反例：2015-Q030

**2024-Q024** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2024-paper/2024年法语专业四级真题.md:235–239

```text
24. Mon copain est venu <mark><u>[en toute hâte]</u></mark> pour m'informer de cette bonne nouvelle.
A. sérieusement
B. précipitamment
C. paisiblement
D. impoliment
```
归类依据：en toute hâte 表匆忙，对应 précipitamment。

**2025-Q027** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2025-paper/2025年法语专四真题.md:203–204

```text
27. Il agit toujours <u>avec précipitation</u>.
    A. sans hâte    B. ardemment    C. sans souci    D. brusquement
```
归类依据：本组问反义；avec précipitation匆忙与A sans hâte不急相反，其它选项不沿速度/仓促轴对立。

反例 **2015-Q030**：sur le champ signifie tout de suite ; plus tard s'y oppose.；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2015-paper/2015年法语专四真题（无水印版）.md:224。

## 6. à引出所具有的特征

- 类型：same_rule
- 旧叶：k-a-trait-physique, k-au-trait
- 新叶：kp-physical-trait-a
- 共同规则：un homme aux cheveux roux、un oiseau au plumage gris、une maison aux murs gris等用à＋限定名词短语标示所具有的身体、外观或组成特征，并按冠词缩合。
- 边界：不合并avoir les yeux的身体部位定冠词规则，也不等同地点à。
- 支持题：2006-Q079, 2021-06-Q031, 2025-Q048
- 近邻反例：2021-05-Q058

**2006-Q079** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:375–379

```text
79. C'est par hasard que j'ai découvert cette maison _______ murs gris.
A. avec
B. aux
C. en
D. sans
```
归类依据：une maison aux murs gris possède ces murs

**2021-06-Q031** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2021-06-paper/2021年6月法语专四真题（无水印版）.md:252–252

```text
31. A. du B. au C. avec D. en
```
归类依据：un oiseau au plumage gris：à + le 表具有某种羽毛。

**2025-Q048** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2025-paper/2025年法语专四真题.md:271–275

```text
48. Son fils est un beau jeune homme ________ cheveux roux.
A. avec
B. de
C. à
D. aux
```
归类依据：身体特征用à+les cheveux缩合aux，D；其它形式缺所需冠词或结构。

反例 **2021-05-Q058**：avoir les yeux rouges 用定冠词描述身体部位。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2021-05-paper/2021年5月法语专四真题（无水印版）.md:388。

## 7. qui/quiconque自由关系从句

- 类型：same_rule
- 旧叶：k-qui-quiconque, k-a-qui-quiconque
- 新叶：kp-free-human-relative
- 共同规则：qui/quiconque无具体名词先行词，可构成指人的名词性关系从句；主句介词可支配整个从句，关系词仍在内部承担主语等功能。
- 边界：区分有先行词介词＋qui，以及直接/间接疑问qui；不能凭外层à误判内部句法。
- 支持题：2006-Q080, 2017-Q059, 2022-Q076, 2024-Q058, 2025-Q055
- 近邻反例：2007-Q054, 2011-Q051, 2013-Q073, 2021-05-Q077

**2006-Q080** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:381–385

```text
80. _______ travaille avec persévérance réussira à l'examen.
A. Chacun
B. Quiconque
C. Tout le monde
D. ce qui
```
归类依据：quiconque travaille forme une proposition sujet

**2017-Q059** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2017-paper/2017年法语专四真题（无水印版）.md:367–371

```text
59. Un article mal écrit pourrait mettre en colère ________ d'ordinaire sait rester maître de lui et si attentif aux autres.
A. celui qui
B. ce qui
C. ce
D. qui
```
归类依据：celui qui d’ordinaire…与qui d’ordinaire…都能名词化指平日自制的人，A常规，D书面任指。ce/ce qui指事物不符master de lui及人际注意。

**2022-Q076** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2022-paper/2022年法语专四真题（无水印）.md:429–433

```text
76. Ce beau paysage enchante______le voit.
A. qui
B. n'importe qui
C. quiconque
D. chacun
```
归类依据：qui le voit和quiconque le voit均可整体作enchante的宾语，内部qui/quiconque作voit主语。B/D缺连接从句的关系成分，A/C不是任意换语境才成立。

**2024-Q058** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2024-paper/2024年法语专业四级真题.md:500–504

```text
58. **【____】** veut me faire plaisir n'a qu'à m'offrir des fleurs.
A. Celui
B. Personne
C. Ce qui
D. Quiconque
```
归类依据：quiconque 作主语，后接关系从句性质的 veut me faire plaisir。

**2025-Q055** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2025-paper/2025年法语专四真题.md:313–317

```text
55. Je parlerai ________ en fera la demande.
A. à qui
B. à n'importe qui
C. à quiconque
D. auquel
```
归类依据：一个规则同时生成A/C：主句介词支配自由关系从句，关系代词在内部作主语。

反例 **2007-Q054**：compter sur des personnes se reprend par sur qui；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:307。

反例 **2011-Q051**：avec qui 指与其分享办公室的人。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2011-paper/2011年法语专四真题（无水印版）.md:311。

反例 **2013-Q073**：avec qui 指与我同住的两个人。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2013-paper/2013年法语专四真题（无水印版）.md:473。

反例 **2021-05-Q077**：pour qui la vie ne compte pas 表对那些人而言生命不重要。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2021-05-paper/2021年5月法语专四真题（无水印版）.md:513。

## 8. de pointe/avancé/pointu：技术先进

- 类型：synonymous_sense
- 旧叶：k-pointe-depasse, k-avance-depasse, k-avance-pointu
- 新叶：kp-technical-advancement
- 共同规则：技术发展水平语境中de pointe、avancé、pointu表达先进或尖端，dépassé为过时。
- 边界：不推广到pointu的尖形义、学习者avancé的程度义；反义与近义指令仍保留原条件。
- 支持题：2022-Q030, 2024-Q029
- 近邻反例：2010-Q085

**2022-Q030** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2022-paper/2022年法语专四真题（无水印）.md:226–227

```text
30. Cette opération a pu réussir grâce à des techniques chirurgicales <u>de pointe</u>.
A. modernes B. avancées C. nouvelles D. dépassées
```
归类依据：techniques de pointe sont avancées, tandis que dépassées sont obsolètes.

**2024-Q029** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2024-paper/2024年法语专业四级真题.md:270–274

```text
29. Les technologies <mark>[avancées]</mark> aidant, on a mis au point des véhicules sans pilote.
A. sensibles
B. pointues
C. économes
D. dépassées
```
归类依据：Le seul énoncé de consigne visible demande le synonyme : B pointues. Si une consigne d’antonymie manque avant 26–30, D dépassées est l’opposé ; les deux branches restent ouvertes.

反例 **2010-Q085**：主要面向已经有良好法语水平的学生，故avancés；并未要求专业为语言学或教育学。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:528。

## 9. d’autant比较级＋que原因

- 类型：same_rule
- 旧叶：k-dautant-moins-que, k-dautant-plus-que
- 新叶：kp-dautant-comparative-cause
- 共同规则：d’autant plus/moins…que把程度的增减与后述原因联系；比较方向按语境选plus或moins。
- 边界：不是普通数量相等autant…que，也不把所有原因从句并入。
- 支持题：2021-05-Q072, 2022-Q059, 2023-Q076
- 近邻反例：2009-Q045, 2010-Q058, 2014-Q072, 2025-Q067

**2021-05-Q072** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2021-05-paper/2021年5月法语专四真题（无水印版）.md:483–487

```text
72. Elle a _______ envie d'aller à cette soirée qu'elle sait qu'elle n'y connaît personne.
A. d'autant plus
B. d'autant moins
C. d'autant mieux
D. autant d'
```
归类依据：d'autant moins envie ... qu'elle sait... 表因无人认识而更不想去。

**2022-Q059** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2022-paper/2022年法语专四真题（无水印）.md:349–353

```text
59. Elle est____ gentille avec son père qu'il ne s'intéresse à elle que très rarement.
A. d'autant moins
B. d'autant plus
C. davantage
D. aussi
```
归类依据：d'autant moins ... que 表更少友善，原因是父亲很少关心她。

**2023-Q076** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2023-paper/2023年法语专四真题.md:575–579

```text
76. Ce soir, elle est ________ fatiguée qu'elle est rentrée du bureau à pied.
A. tellement
B. très
C. trop
D. d'autant plus
```
归类依据：步行从办公室回家解释为什么更累：d’autant plus fatiguée qu’elle est rentrée à pied。A tellement…que把步行变成疲劳导致的结果，本题无该因果依据；不能只因形式可造句就列为并列最佳。

反例 **2009-Q045**：autant de noms que exprime l’égalité quantitative；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2009-paper/2009年法语专四真题及答案 校对 + 仿考试卷排版.md:313。

反例 **2010-Q058**：autant d'argent que 表金额相等，否定表示没那么多。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:328。

反例 **2014-Q072**：autant d'employés que 比较员工数量。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2014-paper/2014年法语专四真题（无水印版）.md:429。

反例 **2025-Q067**：名词数量相等autant de sport que，B；aussi修饰形容词/副词而非此de名词结构。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2025-paper/2025年法语专四真题.md:387。

## 10. quotidien：每日、日常

- 类型：synonymous_sense
- 旧叶：obj-col-daily, k-habitudes-quotidiennes
- 新叶：kp-quotidien-daily
- 共同规则：quotidien/quotidienne修饰使用或习惯时表达每日、日常的频率属性。
- 边界：不把价格、习惯的具体主题当作本词的新义；不同于偶发或季节性。
- 支持题：2023-Q034, 2024-Q035
- 近邻反例：2015-Q031

**2023-Q034** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2023-paper/2023年法语专四真题.md:303–307

```text
<td>34.</td>
<td>A. commerciale</td>
<td>B. occasionnelle</td>
<td>C. quotidienne</td>
<td>D. particulière</td>
```
归类依据：trop chers pour une utilisation quotidienne : le prix empêche un usage journalier. 

**2024-Q035** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2024-paper/2024年法语专业四级真题.md:331–335

```text
35.
A. quotidiennes
B. langagières
C. culturelles
D. bizarres
```
归类依据：quotidiennes 修饰 habitudes，意为改变日常习惯。

反例 **2015-Q031**：Paris-Plage est une opération estivale, répétée ensuite dans le texte.；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2015-paper/2015年法语专四真题（无水印版）.md:239。

## 11. lutter contre：对抗对象

- 类型：same_rule
- 旧叶：obj-col-discrimination, k-lutter-contre-gaspillage
- 新叶：kp-lutter-contre
- 共同规则：lutter contre＋名词标示努力对抗、消除的现象，可用于歧视或浪费等不同对象。
- 边界：不吸收其他动词恰好也带contre的支配，例如colère contre。
- 支持题：2012-Q035, 2018-Q080
- 近邻反例：2013-Q050

**2012-Q035** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2012-paper/2012年法语专四真题（无水印版）.md:237–237

```text
35. A. immigrations B. pollutions C. séparations D. discriminations
```
归类依据：lutter contre les discriminations 表反对歧视。

**2018-Q080** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2018-paper/2018年法语专四真题（无水印版）.md:455–459

```text
80. Leur idée, c'est de lutter, à tout prix, _______ gaspillage au quotidien.
A. vers le
B. au
C. contre le
D. Du
```
归类依据：lutter contre le gaspillage 是对抗浪费。

反例 **2013-Q050**：se mettre en colère contre 表对工人生气。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2013-paper/2013年法语专四真题（无水印版）.md:333。

## 12. chacun/chacune：逐个分指

- 类型：same_rule
- 旧叶：k-chacune-des-deux, k-chacun-distributif, k-2007-q053
- 新叶：kp-chacun-distributive
- 共同规则：chacun(e)独立或带de补语逐一指集合成员；按所指对象性别选chacun/chacune，个体按单数处理。
- 边界：不等同tous全体指代，也不同于une d’entre elles仅选出其中一个。
- 支持题：2005-Q061, 2007-Q053, 2010-Q063, 2014-Q045, 2015-Q071, 2022-Q074, 2024-Q037
- 近邻反例：2011-Q037

**2005-Q061** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:313–314

```text
61. Après ______ de ses excursions, il rentrait chez lui épuisé.
A. chaque B. quelques C. chacun D. chacune
```
归类依据：chacune reprend les excursions après de

**2007-Q053** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:301–305

```text
53. Il a payé ces tableaux vingt francs \_\_\_\_\_\_.
A. quelques
B. chacun
C. aucun
D. chacune
```
归类依据：chacun reprend tableaux au masculin

**2010-Q063** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:351–355

```text
63. J'ai payé ces oranges 1 euro _______.
A. chacun
B. chacune
C. à chacun
D. à chacune
```
归类依据：chacune 指每个阴性 orange，单价一欧元。

**2014-Q045** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2014-paper/2014年法语专四真题（无水印版）.md:270–271

```text
45. <u>________</u> des deux parties pourra mettre fin au contrat sous certaines conditions.
A. Aucun B. Aucune C. Chacun D. Chacune
```
归类依据：chacune des deux parties 指双方中的每一方，阴性单数。

**2015-Q071** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2015-paper/2015年法语专四真题（无水印版）.md:420–424

```text
71. Madame Levet a trois petits-enfants : Lisa, Vanessa et Magali. Elle donne des bijoux à ______ pour Noël.
A. tous
B. chacune
C. aucune
D. personne
```
归类依据：chacune 指三个孙女中每一位，阴性。

**2022-Q074** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2022-paper/2022年法语专四真题（无水印）.md:417–421

```text
74. <u>d'entre elles</u> s'en alla. Personne n'en connaissait la raison.
A. Personne
B. Chacune
C. Aucune
D. Certaines
```
归类依据：chacune d'entre elles 是阴性单数，动词 s'en alla 为单数。

**2024-Q037** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2024-paper/2024年法语专业四级真题.md:343–347

```text
37.
A. aucun
B. chacun
C. quelqu'un
D. Quelques-uns
```
归类依据：permettre à chacun de 配合 ses consommations，指每个人。

反例 **2011-Q037**：两种均可引出其中一项迷信；定冠词不构成强制条件。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2011-paper/2011年法语专四真题（无水印版）.md:264。

## 13. depuis：从起点延续到参照时刻

- 类型：same_rule
- 旧叶：k-depuis-lors, k-depuis-que, k-2005-q037
- 新叶：kp-depuis-origin-continuation
- 共同规则：depuis＋起点、depuis lors、depuis que＋从句标示状态从既定起点延续到参照时刻。
- 边界：不合并en完成耗时、dans以后定位或il y a过去日期；pendant/depuis竞争的复合候选另留。
- 支持题：2005-Q037, 2010-Q051, 2015-Q039, 2024-Q055, 2025-Q075
- 近邻反例：2008-Q044, 2014-Q076, 2024-Q070, 2025-Q052

**2005-Q037** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:203–203

```text
37. A. depuis B. dès C. pour D. pendant
```
归类依据：depuis janvier indique une situation commencée dans le passé

**2010-Q051** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:307–308

```text
51. ______ prend des cours de piano, il a fait de réels progrès.
A. A partir de B. Depuis qu'il C. S'il D. Quand il
```
归类依据：depuis qu'il prend des cours 表从上课以来的进步。

**2015-Q039** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2015-paper/2015年法语专四真题（无水印版）.md:247–247

```text
39. A. lors B. ceci C. cela D. alors
```
归类依据：depuis lors 表从那时起一直。

**2024-Q055** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2024-paper/2024年法语专业四级真题.md:477–481

```text
55. **【___】** que mon mari est mort, j'ai de moins en moins envie de sortir.
A. Depuis
B. Bien
C. De peur
D. Pendant
```
归类依据：depuis que 引出丈夫去世这一持续状态起点。

**2025-Q075** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2025-paper/2025年法语专四真题.md:437–441

```text
75. Mon amie Cécile a beaucoup changé __________ elle est mère de famille.
A. après
B. depuis qu'
C. dès qu'
D. une fois qu'
```
归类依据：a beaucoup changé与现为母亲的持续区间用depuis qu'，B；après不能直接接该限定句。

反例 **2008-Q044**：en cinq minutes mesure la durée nécessaire；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:243。

反例 **2014-Q076**：en moins d'une heure 表一小时内完成所需时间。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2014-paper/2014年法语专四真题（无水印版）.md:458。

反例 **2024-Q070**：en quatre-vingts jours 表完成环球旅行所需时间。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2024-paper/2024年法语专业四级真题.md:581。

反例 **2025-Q052**：A en cinq ans表达修复完成所需时长，最适本句承诺目标；B dans可表达五年后这个延后时点，但不是同一含义。两版解析武断排en，不能覆盖首轮正确推理。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2025-paper/2025年法语专四真题.md:295。

## 14. exceptionnel/hors du commun：非凡

- 类型：synonymous_sense
- 旧叶：k-2008-q027, obj-lex-ordinary
- 新叶：kp-exceptional-ordinary
- 共同规则：exceptionnel与hors du commun表达超出寻常，banal为普通、平常的对立。
- 边界：不泛指所有大规模或技术先进，也不等同原始、新颖。
- 支持题：2008-Q027, 2023-Q027
- 近邻反例：2022-Q030

**2008-Q027** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:188–189

```text
27. C'est un livre <u>banal</u>, tu n'as pas besoin de le lire.
A. obligatoire B. exceptionnel C. indifférent D. moyen
```
归类依据：exceptionnel s’oppose à banal

**2023-Q027** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2023-paper/2023年法语专四真题.md:238–242

```text
27. On lui a préparé un cadeau <u>hors du commun</u> pour son mariage.
A. bon marché
B. de qualité
C. sur mesure
D. banal
```
归类依据：hors du commun signifie exceptionnel ; banal est l'opposé. 

反例 **2022-Q030**：techniques de pointe sont avancées, tandis que dépassées sont obsolètes.；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2022-paper/2022年法语专四真题（无水印）.md:226。

## 15. surveiller：仔细监视

- 类型：synonymous_sense
- 旧叶：k-2008-q033, k-2009-q021
- 新叶：kp-surveiller-attentively
- 共同规则：surveiller、surveiller de très près在活动或出入语境表示认真观察、密切监视。
- 边界：不把定位嫌疑人repérer或一般评判juger混作监视。
- 支持题：2008-Q033, 2009-Q021
- 近邻反例：2007-Q024

**2008-Q033** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:217–217

```text
33. A. loin B. attentif C. sérieux D. près
```
归类依据：surveiller de très près signifie observer attentivement

**2009-Q021** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2009-paper/2009年法语专四真题及答案 校对 + 仿考试卷排版.md:155–159

```text
21. Les policiers sont cachés dans une voiture devant la maison du suspect. Ils <u>surveillent</u> ses sorties.
A. observent
B. attendent
C. arrêtent
D. aperçoivent
```
归类依据：surveiller signifie observer attentivement les sorties

反例 **2007-Q024**：repérer un suspect signifie le remarquer et localiser；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:172。

## 16. 普通形容词的性数配合

- 类型：same_rule
- 旧叶：k-2008-q063, k-seul-accord, k-chatain-accord, k-premier-accord
- 新叶：kp-ordinary-adjective-agreement
- 共同规则：普通形容词作定语或表语时按被说明对象的性数配合，如heureuse、seules、châtains、premières。
- 边界：不涵盖颜色不变条件、副词tout、动形容词/现在分词拼写；前置限定词等题面条件仍保留为辅助证据。
- 支持题：2008-Q063, 2016-Q066, 2019-Q031, 2022-Q073
- 近邻反例：2010-Q044, 2012-Q065, 2015-Q042, 2019-Q042

**2008-Q063** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:361–365

```text
63. La mère ne sait pas comment rendre sa fille \_\_\_\_\_\_\_\_\_\_.
    A. heureux
    B. heureuse
    C. heureusement
    D. bonheur
```
归类依据：heureuse s’accorde avec fille

**2016-Q066** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2016-paper/2016年法语专四真题（无水印版）.md:406–410

```text
66. Une pluie de messages a placé très vite ce hashtag dans _______ positions des tendances Twitter en France.
A. deux premiers
B. deux premières
C. les deux premiers
D. les deux premières
```
归类依据：les deux premières positions 阴性复数配合。

**2019-Q031** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2019-paper/2019年法语专四真题（无水印版）.md:247–247

```text
31. A. châtain B. châtains C. châtaine D. châtaines
```
归类依据：châtain 普通颜色形容词修饰阳性复数 yeux，用 châtains。

**2022-Q073** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2022-paper/2022年法语专四真题（无水印）.md:411–415

```text
73. Pendant le confinement, les habitants du quartier se mobilisent pour aider les personnes âgées qui vivent_____.
A. seul
B. seule
C. seuls
D. seules
```
归类依据：seules 与阴性复数 personnes âgées 配合。

反例 **2010-Q044**：复合颜色 bleu clair 不随阴性 robe 配合。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:281。

反例 **2012-Q065**：复合颜色 bleu ciel 不随 assiettes 配合。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2012-paper/2012年法语专四真题（无水印版）.md:372。

反例 **2015-Q042**：marron 名词来源颜色形容词不变。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2015-paper/2015年法语专四真题（无水印版）.md:257。

反例 **2019-Q042**：marron 作名词来源颜色形容词不变。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2019-paper/2019年法语专四真题（无水印版）.md:270。

## 17. adorable/insupportable：讨喜与难忍

- 类型：synonymous_sense
- 旧叶：k-2006-q026, k-adorable
- 新叶：kp-adorable-insupportable
- 共同规则：评价儿童等人物时adorable的可爱讨喜与insupportable的令人难以忍受构成整体评价对立。
- 边界：不把méchant的道德恶意完全等同insupportable。
- 支持题：2006-Q026
- 近邻反例：2007-Q026

**2006-Q026** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:176–177

```text
26. Cet enfant est <u>adorable</u> !
A. laid B. méchant C. insupportable D. stupide
```
归类依据：可爱讨喜与令人无法忍受最直接相反；méchant只指坏或恶，缩窄为道德行为，需额外语境。

反例 **2007-Q026**：coupable s’oppose à innocent；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:188。

## 18. économiser/réaliser des économies：节约资源

- 类型：synonymous_sense
- 旧叶：k-realiser-economies, k-2006-q030
- 新叶：kp-resource-economy
- 共同规则：économiser、réaliser des économies用于减少钱财、能源、水等资源耗用；与gaspiller浪费相对。
- 边界：不推广到ménager sa santé爱惜健康，也不把所有réaliser都解释为节约。
- 支持题：2006-Q030, 2014-Q038, 2019-Q028, 2024-Q032
- 近邻反例：2011-Q027

**2006-Q030** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:192–193

```text
30. En un mois, il a <u>gaspillé</u> une grosse somme d'argent.
A. économisé B. gardé C. laissé D. perdu
```
归类依据：économiser s’oppose à gaspiller

**2014-Q038** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2014-paper/2014年法语专四真题（无水印版）.md:250–250

```text
38. A. développer B. réaliser C. (d')utiliser D. souhaiter
```
归类依据：réaliser des économies d'énergie 是节能搭配。

**2019-Q028** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2019-paper/2019年法语专四真题（无水印版）.md:224–225

```text
28. Savez-vous que la production de viande de mouton gaspille beaucoup d'eau ?
A. produit B. demande C. réserve D. économise
```
归类依据：四个选项均为动词，实际对立gaspille浪费与économise节约；缺下划线影响原题展示但不妨碍由反义结构识别D，不擅改源字节。

**2024-Q032** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2024-paper/2024年法语专业四级真题.md:308–312

```text
32.
A. donner
B. opposer
C. réaliser
D. supprimer
```
归类依据：réaliser des économies 表实现节约，是常用搭配。

反例 **2011-Q027**：爱惜健康的反向是摧毁健康détruit；dépense/gaspille虽可反对节省财物，此处与santé搭配不佳。[学院词典](https://www.dictionnaire-academie.fr/article/A9M1672)将本搭配释为保护健康；补查解析390行也明确区分此搭配。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2011-paper/2011年法语专四真题（无水印版）.md:220。

## 19. premier/dernier à＋不定式

- 类型：same_rule
- 旧叶：k-2006-q043, k-premier-a
- 新叶：kp-ordinal-infinitive
- 共同规则：le premier/le dernier à faire以à＋不定式说明某行为发生的首位或末位次序。
- 边界：不同于premier后关系从句的虚拟式，也不是基数词与序数词的排列。
- 支持题：2006-Q043, 2011-Q043
- 近邻反例：2014-Q050

**2006-Q043** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:232–233

```text
43. Élève paresseux, Paul est toujours le dernier \_\_\_\_\_\_\_ remettre ses devoirs écrits.
A. à B. pour C. sans D. afin de
```
归类依据：le dernier à suivi d’un infinitif indique l’ordre

**2011-Q043** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2011-paper/2011年法语专四真题（无水印版）.md:279–280

```text
43. Elle est la première <u>_______</u> arriver au but.
A. par B. pour C. en D. à
```
归类依据：le premier à arriver 表第一个到达。

反例 **2014-Q050**：première foire 后关系从句表示首个完成事件，虚拟式过去时 ait été ouverte。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2014-paper/2014年法语专四真题（无水印版）.md:292。

## 20. rien d’autre que：只限于

- 类型：same_rule
- 旧叶：k-2006-q048, k-rien-dautre-que
- 新叶：kp-rien-autre-que
- 共同规则：rien d’autre que＋补语表示除该项以外没有其他项，可接名词或保留补语已有介词。
- 边界：不将ne faire que、不定冠词否定de等不同构式因含否定而并入。
- 支持题：2006-Q048, 2018-Q074
- 近邻反例：2008-Q070

**2006-Q048** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:252–253

```text
48. Il ne pense à ______ d'autre qu'à ses propres intérêts.
A. rien B. aucun C. personne D. nul
```
归类依据：rien d’autre qu’à ses intérêts indique les seules préoccupations

**2018-Q074** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2018-paper/2018年法语专四真题（无水印版）.md:419–423

```text
74. La petite crème dessert a un très bon goût, mais il n'y a rien _______ du sucre là-dedans.
A. autre
B. d'autre
C. autre que
D. d'autre que
```
归类依据：rien d'autre que du sucre 表除了糖没有别的。

反例 **2008-Q070**：孩子只玩耍，从不阅读，用ne font que jouer；两分句之间缺标点应补分号或句号。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:407。

## 21. 弱读宾语代词的组合顺序

- 类型：same_rule
- 旧叶：obj-clitic-order, k-2006-q062
- 新叶：kp-weak-clitic-order
- 共同规则：依据句式选择弱读代词组合顺序：一般句式和否定命令式中置于所支配动词前（如me le、le lui、lui en），肯定命令式置于动词后并相应使用le-moi等组合。
- 边界：moi在en前缩合为m’的特定形态另列；不能只检查位置而忽略所指人称和性数。
- 支持题：2006-Q056, 2006-Q062, 2007-Q045, 2008-Q061, 2011-Q045, 2012-Q055, 2013-Q074, 2014-Q069, 2016-Q065, 2021-06-Q059, 2024-Q060
- 近邻反例：2015-Q051, 2025-Q073

**2006-Q056** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:276–278

```text
56. Monsieur, quand devons-nous vous envoyer cette revue ?
- Envoyez ______ tout de suite.
A. moi-la B. m'en C. la-moi D. m'y
```
归类依据：impératif affirmatif la-moi

**2006-Q062** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:299–300

```text
62. Se trouvant sans argent, elle demande à son père de ______ envoyer.
A. le lui B. lui en C. lui l' D. en lui
```
归类依据：lui en ordonne les pronoms avant l’infinitif

**2007-Q045** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:253–257

```text
45. Si vous avez une imprimante, prêtez \_\_\_\_\_\_ ce soir.
A. moi-la
B. me-la
C. la-moi
D. m'en une
```
归类依据：l’impératif affirmatif ordonne la avant moi

**2008-Q061** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:349–353

```text
61. Si tu as une machine à écrire, prête-\_\_\_\_\_\_ ce soir, je dois taper un article.
    A. moi-la
    B. la-moi
    C. m'en une
    D. me-la
```
归类依据：à l’impératif affirmatif le COD précède moi : prête-la-moi

**2011-Q045** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2011-paper/2011年法语专四真题（无水印版）.md:285–286

```text
45. Où sont les bouteilles ? Donne _______.
A. -les-moi B. -moi-les C. les moi D. moi les
```
归类依据：肯定命令式 donne-les-moi 直接宾语在间接宾语之前。

**2012-Q055** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2012-paper/2012年法语专四真题（无水印版）.md:310–314

```text
55. Cette question, tu peux _______ poser tout à l'heure ? Il n'a pas encore fini son repas.
A. la lui
B. le lui
C. lui y
D. me la
```
归类依据：question阴性用la；Il尚未吃完指等待向他提问，用lui，直接宾语在前。

**2013-Q074** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2013-paper/2013年法语专四真题（无水印版）.md:484–488

```text
74. Le journal est sur le bureau, peux-tu \_\_\_\_\_\_\_\_ passer ?
A. le moi
B. me le
C. le me
D. moi le
```
归类依据：me le passer：间接宾语 me 在直接宾语 le 前。

**2014-Q069** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2014-paper/2014年法语专四真题（无水印版）.md:411–415

```text
69. Mon petit, tes yeux sont fragiles, ne ________ pas comme ça.
A. te les frotte
B. les te frotte
C. te les frottes
D. les te frottes
```
归类依据：否定命令式中反身 te 和直接宾语 les 位于动词前：ne te les frotte pas。

**2016-Q065** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2016-paper/2016年法语专四真题（无水印版）.md:400–404

```text
65. Olivier a laissé un message à sa femme à la réception. Peux-tu aller le chercher et _______ apporter ?
A. le lui
B. lui le (l')
C. la lui
D. lui la (l')
```
归类依据：apporter le message à sa femme：不定式前 le lui 顺序。

**2021-06-Q059** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2021-06-paper/2021年6月法语专四真题（无水印版）.md:359–364

```text
59. – Il faut dire à Élise que tu partiras.
– D'accord, je vais _______ prévenir.
A. le lui
B. lui en
C. l'en
D. la lui
```
归类依据：prévenir quelqu'un de quelque chose：la 指 Élise，en 指离开消息，命令前代词 l'en。

**2024-Q060** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2024-paper/2024年法语专业四级真题.md:512–516

```text
60. Si tu as envie de me quitter, **【____】** dans la pluie, pour que tu ne voies pas mes larmes.
A. dis-le-toi
B. dis-toi-le
C. dis-le-moi
D. dis-moi-le
```
归类依据：告诉我用 dire quelque chose à moi，肯定命令式 le-moi 顺序。

反例 **2015-Q051**：肯定命令式 parle-m'en：moi在en前省音，parle不加s。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2015-paper/2015年法语专四真题（无水印版）.md:295。

反例 **2025-Q073**：肯定命令式moi在en前省音为m'，Donne-m'en un autre，B；书面规范排Donne-moi-en，D词形及顺序错误。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2025-paper/2025年法语专四真题.md:423。

## 22. interroger quelqu’un sur：询问主题

- 类型：same_rule
- 旧叶：k-2006-q074, k-interrogate-sur
- 新叶：kp-interroger-sur
- 共同规则：interroger的受询者为直接宾语，询问的主题由sur引出。
- 边界：不是penser de的意见对象，也不依据重复选项字母裁唯一位置。
- 支持题：2006-Q074
- 近邻反例：2008-Q041

**2006-Q074** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:345–349

```text
74. Le commissaire, d'un air méfiant, l'interrogea _______ son état civil.
A. sur
B. au niveau de
C. en
D. sur
```
归类依据：问某人的身份情况，用sur；源A、D均为sur，必须同时标位置，无法以字母唯一选项。

反例 **2008-Q041**：penser de demande la préposition de；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:230。

## 23. tous/toutes：全体强调指代

- 类型：same_rule
- 旧叶：k-2006-q078, k-tous-attribut, k-toutes-pronoun
- 新叶：kp-tout-distributive-all
- 共同规则：tous/toutes回指或强调前述复数集合的全体，形式随所指集合性数选择。
- 边界：区别修饰形容词程度的副词tout，以及限定名词的tous les。
- 支持题：2006-Q078, 2010-Q043, 2019-Q063
- 近邻反例：2007-Q055, 2008-Q064, 2014-Q044, 2015-Q049

**2006-Q078** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:369–373

```text
78. Les mères de familles se plaignent presque _______ de l'absence de frontière entre la maison et le bureau.
A. tout
B. chacune
C. tous
D. toutes
```
归类依据：toutes reprend les mères au féminin pluriel

**2010-Q043** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:278–279

```text
43. Les élèves portent des uniformes \_\_\_\_\_ bleus.
A. tout B. tous C. toutes D. chacun
```
归类依据：tous bleus 指制服全部是蓝色，tous与复数uniformes配合。

**2019-Q063** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2019-paper/2019年法语专四真题（无水印版）.md:371–372

```text
63. Elles étaient ________ par ce qu'il avait dit.
A. toutes étonnées B. tout étonné C. toute étonnées D. tout étonnées
```
归类依据：D tout étonnées表示全然惊讶，阴性元音起首副词不变；A toutes étonnées表示她们全都惊讶。两读法在原句都自然，B/C配合不合。

反例 **2007-Q055**：toutes étonnées表示她们全都惊讶；tout étonnées表示非常惊讶，副词在元音前不变。两义均自然。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:313。

反例 **2008-Q064**：Anne阴性且pâle辅音开头，写toute pâle；源pale缺重音须按pâle读。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:367。

反例 **2014-Q044**：tout 修饰 étonnée，阴性元音开头时不配合。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2014-paper/2014年法语专四真题（无水印版）.md:267。

反例 **2015-Q049**：tout 修饰形容词 noirs，作副词不变。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2015-paper/2015年法语专四真题（无水印版）.md:283。

## 24. éteindre/s’éteindre：灯光熄灭

- 类型：synonymous_sense
- 旧叶：obj-lex-light, k-2007-q035, k-2009-q031
- 新叶：kp-extinguish-light
- 共同规则：éteindre使灯光熄灭，s’éteindre表示灯光消失；语境可为灯具断电或天亮时星光在视野中消失。
- 边界：星光不可见不证明恒星物理熄灭；illuminer是照亮，另列。
- 支持题：2007-Q035, 2009-Q031, 2012-Q027
- 近邻反例：2007-Q037

**2007-Q035** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:226–226

```text
35. A. s'assombrir B. s'éteindre C. se coucher D. apparaître
```
归类依据：les étoiles s’éteignent visuellement au lever du jour

**2009-Q031** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2009-paper/2009年法语专四真题及答案 校对 + 仿考试卷排版.md:246–250

```text
<td>31.</td>
<td>fermées</td>
<td>éteintes</td>
<td>cassées</td>
<td>détruites</td>
```
归类依据：les lumières s’éteignent quand le courant manque

**2012-Q027** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2012-paper/2012年法语专四真题（无水印版）.md:207–208

```text
27. Nous avons <u>allumé</u> la lampe en appuyant sur ce bouton.
    A. atteint B. éteint C. déteint D. teint
```
归类依据：allumer une lampe s'oppose à l'éteindre.

反例 **2007-Q037**：太阳照亮针叶林及居民用illuminait；brillait不能直接接la taïga，réchauffait强调升温而本段强调光。逗号并列谓语可成立。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:228。

## 25. illuminer：照亮对象

- 类型：same_rule
- 旧叶：k-2007-q037, k-illuminate
- 新叶：kp-illuminer-light
- 共同规则：illuminer表示使对象被光照亮，受照对象为直接宾语。
- 边界：briller不直接带该受照对象，réchauffer强调升温。
- 支持题：2007-Q037
- 近邻反例：2007-Q031

**2007-Q037** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:228–228

```text
37. A. brillait B. réchauffait C. enchantait D. illuminait
```
归类依据：太阳照亮针叶林及居民用illuminait；brillait不能直接接la taïga，réchauffait强调升温而本段强调光。逗号并列谓语可成立。

反例 **2007-Q031**：froid devint plus vif是寒意更刺骨的常见搭配，优于一般fort或violent；不把可能的描述性用语当同等首选。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:222。

## 26. ne…plus＋否定不定成分

- 类型：same_rule
- 旧叶：k-2007-q051, k-negative-plus-aucun
- 新叶：kp-plus-negative-indefinite
- 共同规则：plus与personne/aucun(e)等共同表达不再有任何人或对象；规范否定不再额外加pas。
- 边界：区别普通ne…pas、任指肯定与nulle part的地点零范围。
- 支持题：2006-V20, 2007-Q051
- 近邻反例：2005-Q054, 2009-Q028, 2015-Q048

**2006-V20** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:409–409

```text
Depuis, nous (ne plus avoir) ________ aucune nouvelle de cette dame.
```
归类依据：Depuis表示从那以后持续至今，用现在时；完整nous n’avons plus aucune nouvelle，plus与aucune可共同表示再也没有任何消息，不加pas，不重复外部aucune。

**2007-Q051** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:289–293

```text
51. \_\_\_\_\_\_ n'utilise le passe simple ni le subjonctif imparfait dans la langue parlée.
A. Personne plus
B. Plus personne
C. Aucun plus
D. Plus aucun
```
归类依据：plus personne exprime une négation temporelle

反例 **2005-Q054**：源on pouvait voir没有ne，Partout直接成立。标准书面语若Nulle part需on ne pouvait voir；不能无条件把缺ne的否定句当同等规范答案。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:282。

反例 **2009-Q028**：词汇反义选择partout；整句含ne，替换后否定范围也会改变，不能机械视为整句逻辑反转。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2009-paper/2009年法语专四真题及答案 校对 + 仿考试卷排版.md:203。

反例 **2015-Q048**：ne vouloir aller nulle part 表哪里也不想去。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2015-paper/2015年法语专四真题（无水印版）.md:276。

## 27. considérer X comme/tenir X pour

- 类型：synonymous_sense
- 旧叶：k-2007-q065, k-considerer-comme
- 新叶：kp-considerer-comme
- 共同规则：considérer X comme Y、tenir X pour Y表示把X视为Y；补语描述被判断对象的身份或性质。
- 边界：不等于faire de X Y实际使之改变，也不同于tenir à的珍视。
- 支持题：2007-Q065, 2019-Q032
- 近邻反例：2021-06-Q068

**2007-Q065** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:377–381

```text
65. Le traducteur est souvent considéré\_\_\_\_\_\_\_\_ un passeur de langues et de cultures.
A. en tant que
B. pour
C. comme
D. en
```
归类依据：considérer comme signifie tenir pour

**2019-Q032** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2019-paper/2019年法语专四真题（无水印版）.md:248–248

```text
32. A. prennent B. tiennent C. comparent D. considèrent
```
归类依据：considérer quelqu'un comme 表认为某人是。

反例 **2021-06-Q068**：faire de cette commune un village 表把城镇变成村庄。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2021-06-paper/2021年6月法语专四真题（无水印版）.md:417。

## 28. trop…pour（que）：程度阻碍结果

- 类型：same_rule
- 旧叶：obj-degree-pour, k-2007-q072
- 新叶：kp-trop-pour-result
- 共同规则：trop＋形容词/数量＋pour（que）表达程度过高以至后项难以实现；同主语用不定式，不同主语可用pour que＋虚拟式。
- 边界：不是普通积极目的pour que，也不合并assez de…pour的足够量。
- 支持题：2007-Q072, 2008-Q046, 2011-Q063, 2011-Q065, 2012-Q076, 2013-Q062, 2014-Q056, 2019-Q076, 2021-06-Q044, 2024-Q059, 2025-Q059
- 近邻反例：2010-Q069

**2007-Q072** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:423–427

```text
72. Les orphelins sont trop nombreux ________ l'on puisse les loger tous ici.
A. jusqu'à ce que
B. sans que
C. de sorte que
D. pour que
```
归类依据：trop nombreux pour que introduit une conséquence impossible

**2008-Q046** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:255–259

```text
46. Il est trop petit ________ faire un voyage seul en avion.
A. À
B. de sorte à
C. de
D. pour
```
归类依据：trop petit pour suivi d’un infinitif indique une impossibilité

**2011-Q063** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2011-paper/2011年法语专四真题（无水印版）.md:389–393

```text
63. Il est <u>fatigué pour finir ce travail</u> \_\_\_\_\_\_.
A. assez
B. beaucoup
C. tellement
D. trop
```
归类依据：正确句Il est trop fatigué pour finir ce travail；源空位错置句末，若严格原位填词四项均不成句，按意图修复选D。

**2011-Q065** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2011-paper/2011年法语专四真题（无水印版）.md:401–405

```text
65. Il l'aime trop <u>\_\_\_\_\_\_</u> <u>elle y aille risquer sa vie</u>.
A. parce qu'
B. pour qu'
C. même si
D. si bien qu'
```
归类依据：trop ... pour qu'elle y aille 表爱得太深不能让她冒险。

**2012-Q076** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2012-paper/2012年法语专四真题（无水印版）.md:440–441

```text
76. Il est trop petit ______ on le laisse voyager tout seul.
A. de sorte qu' B. pour qu' C. si bien qu' D. de sorte à
```
归类依据：trop petit pour que 表太小而不能独自旅行。

**2013-Q062** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2013-paper/2013年法语专四真题（无水印版）.md:407–411

```text
62. Il ne peut pas nous rejoindre à la soirée, il est _______ occupé pour venir.
A. vraiment
B. en effet
C. trop
D. tant
```
归类依据：trop occupé pour venir 表太忙而不能来。

**2014-Q056** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2014-paper/2014年法语专四真题（无水印版）.md:328–332

```text
56. Le patron est _______ occupé pour que nous allions le voir.
A. si
B. tellement
C. tant
D. trop
```
归类依据：trop occupé pour que 表太忙而不能去见他。

**2019-Q076** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2019-paper/2019年法语专四真题（无水印版）.md:420–424

```text
76. Il est encore ______ faible pour reprendre le travail.
A. si
B. tant
C. tellement
D. trop
```
归类依据：trop faible pour reprendre 表太虚弱而无法工作。

**2021-06-Q044** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2021-06-paper/2021年6月法语专四真题（无水印版）.md:276–277

```text
44. Ma fille est ________ petite ________ qu'on puisse l'emmener au théâtre.
A. assez, / B. tellement, / C. si, au point D. trop, pour
```
归类依据：trop petite pour que 表太小以致不能带去剧院。

**2024-Q059** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2024-paper/2024年法语专业四级真题.md:506–510

```text
59. Il m'a demandé un service. A vrai dire, ce n'est pas facile, mais je lui dois trop pour **【____】** .
A. lui obéir
B. l'obéir
C. ne pas lui obéir
D. ne pas l'obéir
```
归类依据：trop pour ne pas lui obéir 指欠他太多以至于无法不服从；obéir à 人用 lui。

**2025-Q059** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2025-paper/2025年法语专四真题.md:337–341

```text
59. Ces expériences sont encore ________ peu nombreuses ________ on puisse tirer des conclusions.
A. assez, pour qu'
B. si, qu'
C. tellement, qu'
D. trop, pour qu'
```
归类依据：样本太少不能下结论，用trop peu nombreuses pour qu'on puisse，D；si/tellement que在此不匹配虚拟式结果句。

反例 **2010-Q069**：assez de temps pour t'aider 表足够的时间。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:387。

## 29. 将来先完成与到达界点读法

- 类型：conditional_duplicate
- 旧叶：k-2007-q064, u-sol-582db8119d21
- 新叶：kp-future-anterior-vs-boundary
- 共同规则：dès que语境中，先将来时突出先完成，简单将来时可把到达当时间界点；不机械见dès que便强制复合时态。
- 边界：这是既有双读法比较候选，不把所有简单将来时与先将来时合为一个叶。
- 支持题：2007-Q064
- 近邻反例：2007-Q064, 2007-V08, 2007-V13, 2007-V18

**2007-Q064** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:371–375

```text
64. Tu me téléphoneras des que tu \_\_\_\_\_\_\_\_ à Paris.
A. arrives
B. seras arrivé
C. arriveras
D. es arrivé
```
归类依据：seras arrivé突出先到巴黎再打电话；arriveras以到达作为时间界点也可，dès que不强制复合时态。源des须读dès。

反例 **2007-Q064**：seras arrivé突出先到巴黎再打电话；arriveras以到达作为时间界点也可，dès que不强制复合时态。源des须读dès。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:371。

反例 **2007-V08**：fort probable que appelle ici l’indicatif futur；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:485。

反例 **2007-V13**：futur de la conséquence；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:489。

反例 **2007-V18**：来年假期将落在同一时段，用tomberont；原已含la，缺的是介词à，应à la même période，不是再补一个冠词。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:491。

## 30. rien qu’en：仅凭某行为

- 类型：same_rule
- 旧叶：k-2007-q076, k-rien-quen
- 新叶：kp-rien-quen
- 共同规则：rien qu’en＋现在分词表示仅凭、只靠实施该行为便产生结果。
- 边界：区别普通副动词的同时/方式关系与ne…que的一般限制。
- 支持题：2007-Q076, 2019-Q075
- 近邻反例：2005-V05, 2007-Q070, 2009-V20, 2012-Q075

**2007-Q076** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:447–451

```text
76. Rien ________ respirant l'air du matin, cet aveugle peut nous prévoir le temps.
A. quant
B. quand
C. qu'en
D. en
```
归类依据：rien qu’en signifie seulement en

**2019-Q075** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2019-paper/2019年法语专四真题（无水印版）.md:414–418

```text
75. Rien ______ voyant un œuf, je pouvais dire de quel oiseau il était.
A. quant
B. quand
C. qu'en
D. en
```
归类依据：rien qu'en voyant 表仅凭看见，rien qu'en + 现在分词。

反例 **2005-V05**：Ce soir, en arrivant dans ce pays表示今晚到此地时进旅馆；该副动词和主句同一主语。[Nathan所载雨果原文](https://horizons-pluriels.nathan.fr/horizonspluriels2019-2de/assets/chapitre-10-parcours-initiatiques-textes-dys-1/preview)第18页也使用此形式。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:433。

反例 **2007-Q070**：en lisant est un gérondif de moyen；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:411。

反例 **2009-V20**：gérondif de manière simultanée；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2009-paper/2009年法语专四真题及答案 校对 + 仿考试卷排版.md:549。

反例 **2012-Q075**：c'est en nageant que 表通过游泳而学会。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2012-paper/2012年法语专四真题（无水印版）.md:432。

## 31. 国家名地点介词en/au/aux

- 类型：same_rule
- 旧叶：k-2009-q044, k-pays-en-au
- 新叶：kp-country-location-prepositions
- 共同规则：以国家名词的性数及语音形式选择地点介词en、au、aux，如en Espagne、au Mexique、aux États-Unis。
- 边界：不泛化到省名冠词、山脉dans或chez人的场所。
- 支持题：2009-Q044, 2010-Q068
- 近邻反例：2011-Q066

**2009-Q044** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2009-paper/2009年法语专四真题及答案 校对 + 仿考试卷排版.md:307–311

```text
44. Je fais souvent des voyages dans le monde, mais je n'ai jamais été \_\_\_ États-Unis.
A. en
B. à l'
C. au
D. aux
```
归类依据：aux précède un pays au pluriel États-Unis

**2010-Q068** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:381–385

```text
68. Ils ont beaucoup voyagé, ils sont allés ________ Espagne et ________ Mexique.
A. au, en
B. à, à
C. en, au
D. en, en
```
归类依据：en Espagne 与 au Mexique 为国名地点介词。

反例 **2011-Q066**：四项只有Le Shanxi具有预期阳性单数冠词；但Xi’an与所写省名不匹配，按西安题意应核正为Le Shaanxi。D只解决冠词，不能使全部事实自动正确。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2011-paper/2011年法语专四真题（无水印版）.md:407。

## 32. malgré/en dépit de：名词性让步

- 类型：same_rule
- 旧叶：k-2009-q046, obj-concession-prep
- 新叶：kp-malgre-concession
- 共同规则：malgré/en dépit de＋名词短语标示虽有该障碍，主句仍然成立。
- 边界：完整让步从句的bien que/quoique及其语气要求另列。
- 支持题：2005-Q078, 2005-Q080, 2009-Q046, 2010-Q037, 2013-Q044, 2018-Q067, 2021-05-Q048, 2023-Q066
- 近邻反例：2005-Q074, 2010-Q061, 2015-Q063, 2017-Q053

**2005-Q078** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:409–413

```text
78. _______ les critiques, son livre a été réédité cette année.
A. Lorsque
B. Bien que
C. Alors que
D. Malgré
```
归类依据：malgré suivi d’un groupe nominal exprime la concession

**2005-Q080** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:421–425

```text
80. _______ la guerre, nous avions assez de nourriture pour tous.
A. En dépit de
B. À cause de
C. Au lieu de
D. Bien que
```
归类依据：en dépit de la guerre indique une concession

**2009-Q046** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2009-paper/2009年法语专四真题及答案 校对 + 仿考试卷排版.md:319–323

```text
46. \_\_\_\_\_\_\_\_\_\_ son accent anglais, les étudiants de l'École polytechnique ont bien compris son discours.
A. Grâce à
B. À partir de
C. Même
D. Malgré
```
归类依据：malgré introduit l’obstacle que constitue l’accent

**2010-Q037** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:263–263

```text
37. A. à cause de B. grâce à C. malgré D. pour
```
归类依据：malgré le gros pourboire 表尽管给小费仍不友善。

**2013-Q044** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2013-paper/2013年法语专四真题（无水印版）.md:305–306

```text
44. Il fait du jogging tous les matins _ son âge.
A. en raison de B. à cause de C. en dépit de D. par suite de
```
归类依据：en dépit de son âge 表尽管年纪大。

**2018-Q067** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2018-paper/2018年法语专四真题（无水印版）.md:373–377

```text
67. Plusieurs bateaux de pêche sont sortis en mer \_\_\_\_\_\_\_\_ la tempête.
A. malgré
B. bien
C. même
D. au lieu de
```
归类依据：malgré la tempête 引让步，尽管风暴船出海。

**2021-05-Q048** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2021-05-paper/2021年5月法语专四真题（无水印版）.md:323–327

```text
48. On sort ? Les plages sont ouvertes \_\_\_\_\_\_\_\_\_\_ un orage qui approche.
A. grâce à
B. à cause d'
C. en raison d'
D. malgré
```
归类依据：malgré un orage 表尽管暴风雨将至海滩仍开放。

**2023-Q066** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2023-paper/2023年法语专四真题.md:514–518

```text
66. ________ un vent très fort, il est sorti se promener.
A. À cause d'
B. Vu
C. Malgré
D. Faute d'
```
归类依据：malgré 加名词表让步：尽管大风仍出去。

反例 **2005-Q074**：bien que introduit une concession au subjonctif；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:381。

反例 **2010-Q061**：尽管有雪仍开车出发，用bien qu’il y ait；Même si须直陈式不能接ait。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:337。

反例 **2015-Q063**：bien que + 虚拟式表尽管已看过仍一起再看。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2015-paper/2015年法语专四真题（无水印版）.md:372。

反例 **2017-Q053**：bien que 后用虚拟式过去时，第三人称单数 ait remplacé。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2017-paper/2017年法语专四真题（无水印版）.md:329。

## 33. plus/moins de＋名词数量比较

- 类型：same_rule
- 旧叶：k-2009-q047, k-2008-q048
- 新叶：kp-plus-de-noun-comparison
- 共同规则：plus/moins de N（que…）比较名词数量；比较对象可包含chez等已有场所成分，方向依语境取多或少。
- 边界：不混淆autant de等量或aussi＋形容词的程度比较。
- 支持题：2008-Q048, 2009-Q047, 2010-Q074, 2021-05-Q033
- 近邻反例：2009-Q045, 2010-Q058, 2014-Q072, 2025-Q067

**2008-Q048** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:267–271

```text
48. Les Européens et les Américains mangent en général ____ viande que les Chinois.
A. de la
B. plus de la
C. beaucoup de
D. plus de
```
归类依据：plus de viande que compare les quantités

**2009-Q047** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2009-paper/2009年法语专四真题及答案 校对 + 仿考试卷排版.md:325–329

```text
47. Il y a certainement plus de clients au supermarché \_\_\_\_\_\_\_\_\_\_ les petits commerçants.
A. chez
B. que chez
C. dans
D. que dans
```
归类依据：plus de clients que chez compare les deux lieux de vente

**2010-Q074** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:419–423

```text
74. Elle vient d'acheter une petite voiture qui consomme beaucoup moins ______ que la grosse..
A. essence
B. d'essence
C. l'essence
D. de l'essence
```
归类依据：moins d'essence que 表较少汽油。

**2021-05-Q033** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2021-05-paper/2021年5月法语专四真题（无水印版）.md:264–264

```text
33. A. autant d' B. moins d' C. plus d' D. nombre d'
```
归类依据：垃圾增加与食品使用比过去更多包装呼应，plus d'emballages。

反例 **2009-Q045**：autant de noms que exprime l’égalité quantitative；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2009-paper/2009年法语专四真题及答案 校对 + 仿考试卷排版.md:313。

反例 **2010-Q058**：autant d'argent que 表金额相等，否定表示没那么多。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:328。

反例 **2014-Q072**：autant d'employés que 比较员工数量。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2014-paper/2014年法语专四真题（无水印版）.md:429。

反例 **2025-Q067**：名词数量相等autant de sport que，B；aussi修饰形容词/副词而非此de名词结构。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2025-paper/2025年法语专四真题.md:387。

## 34. jusqu’à ce que：时间终点从句

- 类型：same_rule
- 旧叶：k-jusqua-ce-que, k-jusqua-ce-que-subj
- 新叶：kp-jusqua-ce-que
- 共同规则：jusqu’à ce que引出达到某终点事件的时间从句，通常使用虚拟式，时态依叙述文体和参照确定。
- 边界：不是jusqu’à＋温度/地点名词，也不同于à moins que例外条件。
- 支持题：2009-Q051, 2016-Q075, 2017-V04
- 近邻反例：2017-Q042

**2009-Q051** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2009-paper/2009年法语专四真题及答案 校对 + 仿考试卷排版.md:353–357

```text
51. J'y resterai _______ l'opération soit accomplie.
A. jusque
B. jusqu'à ce que
C. jusqu'après
D. jusqu'à
```
归类依据：jusqu’à ce que introduit une limite avec subjonctif

**2016-Q075** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2016-paper/2016年法语专四真题（无水印版）.md:465–469

```text
75. Il agitait alors son fauteuil à roulettes jusqu'à ce qu'il ________ en face de la porte de son cabinet.
A. se trouvera
B. se trouverait
C. se trouvât
D. se trouvait
```
归类依据：jusqu'à ce que 后虚拟式未完成过去 se trouvât。

**2017-V04** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2017-paper/2017年法语专四真题（无水印版）.md:511–511

```text
Comme un professeur exigeant (**corriger**) \_\_\_\_\_\_\_\_ les devoirs de ses élèves, le général de Gaulle révisait minutieusement, plume à la main, les documents qu'on lui soumettait. Il lui (**arriver**) \_\_\_\_\_\_\_\_ de faire (**réécrire**) \_\_\_\_\_\_\_\_ deux ou trois fois le texte, jusqu'à ce qu'il le (**satisfaire**) \_\_\_\_\_\_\_\_, tant pour le fond que pour la forme. Le style, ce (**être**) \_\_\_\_\_\_\_\_ l'homme. Et le Général (**détester**) \_\_\_\_\_\_\_\_ l'imprécision et l'à-peu-près. Aucune faute de français, qu'elle (**être**) \_\_\_\_\_\_\_\_ de syntaxe, de vocabulaire ou d'orthographe, ne lui (**échapper**) \_\_\_\_\_\_\_\_.
```
归类依据：直到文本令其满意用虚拟式；现代法语可satisfasse，书面过去配套也可satisfît，差别是语体，不因主句过去强判现在式错误。

反例 **2017-Q042**：descendre jusqu'à -35°C 表降至零下35度。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2017-paper/2017年法语专四真题（无水印版）.md:274。

## 35. 间接疑问qui作人称直接宾语

- 类型：same_rule
- 旧叶：k-interrogative-qui-object, k-2009-q053
- 新叶：kp-indirect-human-cod
- 共同规则：间接问句询问被邀请、被选择等人的直接宾语时使用qui；从句已有自己的主语。
- 边界：不使用qui est-ce qui直接问句结构，也不同于ce que询问事物。
- 支持题：2009-Q053, 2025-Q057
- 近邻反例：2015-Q045

**2009-Q053** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2009-paper/2009年法语专四真题及答案 校对 + 仿考试卷排版.md:365–369

```text
53. Dites-nous _______ nous pouvons choisir comme représentant.
A. ce qui
B. qui
C. la personne
D. l'homme
```
归类依据：qui désigne la personne choisie dans l’interrogation indirecte

**2025-Q057** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2025-paper/2025年法语专四真题.md:325–329

```text
57. Elle m'a demandé ________ j'allais inviter pour mon anniversaire.
A. ce qui
B. qui est-ce qui
C. qui
D. ce que
```
归类依据：inviter的人称宾语用间接疑问qui，C；ce que问事物，qui est-ce qui不合间接问句及宾语角色。

反例 **2015-Q045**：qui est-ce qui prépare 中第二个 qui 作从句主语。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2015-paper/2015年法语专四真题（无水印版）.md:267。

## 36. à condition de/que：成立条件

- 类型：same_rule
- 旧叶：k-a-condition-que, k-2009-q062
- 新叶：kp-condition-que-de
- 共同规则：à condition de＋不定式或à condition que＋虚拟式引出主句成立所需条件，形式按从句结构选择。
- 边界：区别à moins de/que的例外条件；pourvu que单纯愿望不自动并入。
- 支持题：2009-Q062, 2023-Q077
- 近邻反例：2010-Q061, 2015-Q078, 2021-05-Q047, 2025-Q069

**2009-Q062** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2009-paper/2009年法语专四真题及答案 校对 + 仿考试卷排版.md:423–427

```text
62. Vous réussirez ________ travailler avec application.
A. à condition de
B. à condition que
C. à condition
D. sous condition
```
归类依据：à condition de introduit un infinitif

**2023-Q077** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2023-paper/2023年法语专四真题.md:581–585

```text
77. Il gagnera le Tour de France ________ il n'y ait pas d'incident imprévu.
A. à condition qu'
B. de crainte qu'
C. à moins qu'
D. sinon qu'
```
归类依据：à condition que 加虚拟式表示没有意外的条件；赘词 ne 可出现。

反例 **2010-Q061**：尽管有雪仍开车出发，用bien qu’il y ait；Même si须直陈式不能接ait。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:337。

反例 **2015-Q078**：pourvu qu'il ne soit pas malade 表但愿没有生病，虚拟式。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2015-paper/2015年法语专四真题（无水印版）.md:467。

反例 **2021-05-Q047**：pourvu qu'il fasse beau 是对好天气的愿望；题干 il 已给出。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2021-05-paper/2021年5月法语专四真题（无水印版）.md:317。

反例 **2025-Q069**：独立Pourvu que祈愿接虚拟式fasse，C；未来词demain不要求fera。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2025-paper/2025年法语专四真题.md:399。

排除历史正例 **2010-Q061**：较新裁决表明该历史例并不支持此叶；从支持正例中排除，不改既有题目答案或分类。

## 37. plus que d’habitude：比平常更多

- 类型：same_rule
- 旧叶：k-2009-q065, k-plus-que-dhabitude
- 新叶：kp-plus-que-habit
- 共同规则：plus（de N）que d’habitude以通常数量、频率或程度为比较参照，说明比平常增加。
- 边界：不是plus的“不再”否定义，也不泛指所有比较级。
- 支持题：2009-Q065, 2011-Q033
- 近邻反例：2006-V20

**2009-Q065** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2009-paper/2009年法语专四真题及答案 校对 + 仿考试卷排版.md:441–445

```text
65. Les examens approchent, les étudiants sont plus occupes ________.
A. qu'habitude
B. que d'habitude
C. que l'habitude
D. qu'en habitude
```
归类依据：plus que d’habitude est la comparaison usuelle

**2011-Q033** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2011-paper/2011年法语专四真题（无水印版）.md:260–260

```text
33. A. d'habitude B. autrefois C. souvent D. toujours
```
归类依据：plus de chance que d'habitude 表比平常更幸运。

反例 **2006-V20**：Depuis表示从那以后持续至今，用现在时；完整nous n’avons plus aucune nouvelle，plus与aucune可共同表示再也没有任何消息，不加pas，不重复外部aucune。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:409。

## 38. en public/en privé：公开与私下

- 类型：synonymous_sense
- 旧叶：k-2009-q068, k-public-prive
- 新叶：kp-public-prive
- 共同规则：en public为在他人面前、公开进行，en privé为私下，构成活动场合的对立。
- 边界：不混淆公开机构public与私人机构privé的所有制词义。
- 支持题：2009-Q068, 2011-Q029
- 近邻反例：2017-Q069

**2009-Q068** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2009-paper/2009年法语专四真题及答案 校对 + 仿考试卷排版.md:459–463

```text
68. Cet enfant est timide ________, il reste muet comme une carpe.
A. au public
B. à la publique
C. en public
D. en publique
```
归类依据：en public signifie devant les autres

**2011-Q029** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2011-paper/2011年法语专四真题（无水印版）.md:232–236

```text
29. Après avoir surmonté la peur, il a fait une lecture <u>en public</u>.
A. en commun
B. en privé
C. en équipe
D. en société
```
归类依据：en public s'oppose à en privé.

反例 **2017-Q069**：responsable devant le parlement 表向议会负责。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2017-paper/2017年法语专四真题（无水印版）.md:427。

## 39. 省区名称的冠词与性数

- 类型：same_rule
- 旧叶：k-2009-q073, k-province-shanxi
- 新叶：kp-province-definite-article
- 共同规则：省区名称作为普通名词短语使用时按词汇惯例选择定冠词及性数，如le Jiangsu、le Shanxi。
- 边界：名称/地理事实的源异常不因冠词正确就获修复；国名地点介词另列。
- 支持题：2009-Q073, 2011-Q066
- 近邻反例：2010-Q068

**2009-Q073** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2009-paper/2009年法语专四真题及答案 校对 + 仿考试卷排版.md:493–497

```text
73. Une délégation française a rendu visite récemment à plusieurs provinces de Chine, dont ________.
A. le Jiangsu
B. la Jiangsu
C. les Jiangsu
D. Jiangsu
```
归类依据：le Jiangsu est un nom de province masculin avec article

**2011-Q066** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2011-paper/2011年法语专四真题（无水印版）.md:407–411

```text
66. <u>\_\_\_\_\_\_</u> est une très ancienne province de la Chine, dont le chef-lieu est Xi'an.
A. Shanxi
B. Les Shanxi
C. La Shanxi
D. Le Shanxi
```
归类依据：四项只有Le Shanxi具有预期阳性单数冠词；但Xi’an与所写省名不匹配，按西安题意应核正为Le Shaanxi。D只解决冠词，不能使全部事实自动正确。

反例 **2010-Q068**：en Espagne 与 au Mexique 为国名地点介词。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:381。

## 40. 副词tout的配合条件

- 类型：same_rule
- 旧叶：k-2009-q075, obj-tout-adverb
- 新叶：kp-tout-adverb-agreement
- 共同规则：副词tout修饰形容词一般不变；阴性形容词以辅音或有声h开头时配合，如toute seule，元音前如tout étonnées通常不变。
- 边界：区别tous/toutes表示全体的代词用法。
- 支持题：2007-Q055, 2008-Q064, 2009-Q075, 2014-Q044, 2015-Q049, 2019-Q063, 2021-05-Q052, 2021-06-Q034, 2023-Q063, 2025-Q046
- 近邻反例：2006-Q078

**2007-Q055** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:313–317

```text
55. Elles étaient\_\_\_\_\_\_ par ce qu'il avait dit.
A. toutes étonnées
B. tout étonné
C. toute étonnées
D. tout étonnées
```
归类依据：toutes étonnées表示她们全都惊讶；tout étonnées表示非常惊讶，副词在元音前不变。两义均自然。

**2008-Q064** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:367–371

```text
64. Anne est sortie de l'hôpital, \_\_\_\_\_\_ pale.
    A. tous
    B. tout
    C. toutes
    D. toute
```
归类依据：Anne阴性且pâle辅音开头，写toute pâle；源pale缺重音须按pâle读。

**2009-Q075** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2009-paper/2009年法语专四真题及答案 校对 + 仿考试卷排版.md:505–509

```text
75. Une petite fille s'amuse dans le jardin ________.
A. tout seul
B. tout seule
C. toute seule
D. toute seul
```
归类依据：toute seule s’accorde au féminin devant seule

**2014-Q044** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2014-paper/2014年法语专四真题（无水印版）.md:267–268

```text
44. <u>Elle est</u> <u>________</u> étonnée d'avoir trouvé si rapidement un boulot pour l'été.
A. tout B. toute C. tous D. toutes
```
归类依据：tout 修饰 étonnée，阴性元音开头时不配合。

**2015-Q049** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2015-paper/2015年法语专四真题（无水印版）.md:283–287

```text
49. C'est un beau mec. Il a les yeux ______ noirs.
A. tout
B. tous
C. toute
D. toutes
```
归类依据：tout 修饰形容词 noirs，作副词不变。

**2019-Q063** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2019-paper/2019年法语专四真题（无水印版）.md:371–372

```text
63. Elles étaient ________ par ce qu'il avait dit.
A. toutes étonnées B. tout étonné C. toute étonnées D. tout étonnées
```
归类依据：D tout étonnées表示全然惊讶，阴性元音起首副词不变；A toutes étonnées表示她们全都惊讶。两读法在原句都自然，B/C配合不合。

**2021-05-Q052** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2021-05-paper/2021年5月法语专四真题（无水印版）.md:352–356

```text
52. Regarde la jeune mariée, elle est _______ heureuse !
A. tout
B. toute
C. tous
D. toutes
```
归类依据：副词 tout 修饰 heureuse，哑音h前不配合。

**2021-06-Q034** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2021-06-paper/2021年6月法语专四真题（无水印版）.md:255–255

```text
34. A. tout B. toute C. tous D. toutes
```
归类依据：副词 tout 修饰阴性辅音开头的 simple，写 toute。

**2023-Q063** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2023-paper/2023年法语专四真题.md:494–498

```text
63. La jeune femme est _______ heureuse d'avoir obtenu son diplôme avec mention « très honorable ».
A. tout
B. tous
C. toute
D. toutes
```
归类依据：副词 tout 修饰阴性 heureuse；哑音 h 前不配合。

**2025-Q046** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2025-paper/2025年法语专四真题.md:263–264

```text
46. Elle était ________ rouge de honte.
A. tout B. toute C. tous D. toutes
```
归类依据：tout作程度副词，在阴性辅音起首rouge前配合toute；B，不把阳性复数副词也改tous。

反例 **2006-Q078**：toutes reprend les mères au féminin pluriel；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:369。

## 41. quant à/pour ce qui concerne：话题引入

- 类型：synonymous_sense
- 旧叶：k-pour-ce-qui-concerne, k-quant-a
- 新叶：kp-topic-quant-a
- 共同规则：quant à、pour ce qui concerne引出某个论述对象，表达至于、关于。
- 边界：不把à l’égard de态度针对对象或en raison de原因混同话题转换。
- 支持题：2017-Q033, 2019-Q036
- 近邻反例：2005-Q077, 2021-06-Q022, 2024-Q025

**2017-Q033** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2017-paper/2017年法语专四真题（无水印版）.md:258–258

```text
33. A. que B. ce que C. qui D. ce qui
```
归类依据：pour ce qui concerne 表至于、关于。

**2019-Q036** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2019-paper/2019年法语专四真题（无水印版）.md:257–257

```text
36. A. quand B. or C. quant à D. pourtant
```
归类依据：quant à elle 为至于她，引出对 Laura 的转述。

反例 **2005-Q077**：通常泛论移民群体，à l’égard des immigrés最直接。envers des immigrés或concernant des immigrés可把des读不定冠词一些移民，不是同一限定范围，但语法也通。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:403。

反例 **2021-06-Q022**：à l'égard des femmes introduit l'objet de la violence, comme envers les femmes.；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2021-06-paper/2021年6月法语专四真题（无水印版）.md:199。

反例 **2024-Q025**：à l'égard de 表对待、关于，与 envers 在此对应。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2024-paper/2024年法语专业四级真题.md:241。

## 42. campeur与touriste的范围

- 类型：same_rule
- 旧叶：k-touristes-campeurs, k-campeurs
- 新叶：kp-campeur-touriste
- 共同规则：campeur指采用露营方式的旅行者，touriste为范围更宽的游客；篇章须按所指群体判断是否允许两者。
- 边界：不是任何上下文都可互换；多读法和范围差异原样保留。
- 支持题：2017-Q035, 2017-Q039
- 近邻反例：2012-Q033

**2017-Q035** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2017-paper/2017年法语专四真题（无水印版）.md:260–260

```text
35. A. campeurs B. immigrants C. touristes D. envahisseurs
```
归类依据：学生篇章说越来越多旅游者把度假转向文化遗产，touristes为自然总称；camping主题下campeurs也可指这一子群，不如C宽但不是语法错误。

**2017-Q039** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2017-paper/2017年法语专四真题（无水印版）.md:264–264

```text
39. A. (d')étrangers B. campeurs C. parisiens D. franciliens
```
归类依据：全文以露营者为对象，genre de campeurs 与 camping 对应。

反例 **2012-Q033**：les filles 与残障、少数族裔和贫困儿童并列作为受排斥群体。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2012-paper/2012年法语专四真题（无水印版）.md:235。

## 43. 副词最高级与最高可及程度

- 类型：same_rule
- 旧叶：k-le-mieux, k-le-plus-vite
- 新叶：kp-adverb-superlative
- 共同规则：le plus＋副词、le mieux等表示动作方式的最高程度；possible可限定为尽可能达到的程度。
- 边界：区别meilleur/le meilleur修饰名词或作形容词的最高级，也不等同最多名词数量。
- 支持题：2010-Q060, 2016-Q069, 2017-Q051
- 近邻反例：2009-Q048, 2022-Q060

**2010-Q060** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:334–335

```text
60. C'est cette période que je connais ______.
A. le mieux B. mieux C. le meilleur D. meilleure
```
归类依据：le mieux 是副词最高级，修饰 connais。

**2016-Q069** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2016-paper/2016年法语专四真题（无水印版）.md:424–429

```text
69. Nous espérons que les étudiants français contactent leur famille _______ possible.
<u>famille</u>
A. plus vite
B. plus rapide
C. le plus vite
D. le plus rapide
```
归类依据：contactent修饰动作需副词vite，最高程度le plus vite possible。孤立famille是转写重复，不充当新句法成分；rapide形容词不修饰联系动作。

**2017-Q051** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2017-paper/2017年法语专四真题（无水印版）.md:317–321

```text
51. C'est dans les jeux avec les mots, dans cet amour de l'utilisation de la langue que se reconnaît _______ l'esprit français.
A. mieux
B. le mieux
C. meilleur
D. le meilleur
```
归类依据：le mieux 是副词 bien 的最高级，修饰 se reconnaît。

反例 **2009-Q048**：les meilleurs s’accorde avec vins et forme un superlatif；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2009-paper/2009年法语专四真题及答案 校对 + 仿考试卷排版.md:335。

反例 **2022-Q060**：比较形容词 bonne 用不规则比较级 meilleure。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2022-paper/2022年法语专四真题（无水印）.md:355。

## 44. 具体重读事件与一般职责读法

- 类型：conditional_duplicate
- 旧叶：k-relire-temps, u-sol-c9d2b18f0f69
- 新叶：kp-relire-event-vs-duty
- 共同规则：relire在具体已发生事件读法下可用复合过去时，在一般职责任务读法下可用现在时；两种视角保持区别。
- 边界：仅合并同一语境竞争分析，不把所有现在与过去时合为一条规则。
- 支持题：2017-V12
- 近邻反例：2005-V01, 2005-V02, 2007-V02, 2007-V03

**2017-V12** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2017-paper/2017年法语专四真题（无水印版）.md:515–515

```text
- Oui, (<u>dire</u>) \_\_\_\_\_\_\_\_ le Général, mais c'est l'ambassadeur qui (<u>relire</u>) \_\_\_\_\_\_\_\_ la lettre.
```
归类依据：指这封已出现错误的信，是大使重读后负责，a relu自然承接具体事件；relit可将重读作为职责任务一般现在陈述，语义不同但可接受。

反例 **2005-V01**：présentation actuelle avec pronom réfléchi；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:433。

反例 **2005-V02**：我已获自由四天且仍在旅途，用je suis libéré depuis quatre jours；这是现在时être加过去分词的状态被动，不把suis libéré误称libérer的主动复合过去。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:433。

反例 **2007-V02**：remerciement actuel；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:481。

反例 **2007-V03**：信中现在感谢邀请并说明目前无法决定，sommes touchés与当前感谢并列；也可回顾收信时的反应。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:481。

## 45. imprévu：未预料

- 类型：synonymous_sense
- 旧叶：k-imprevu-inattendu, k-imprevu-soudain
- 新叶：kp-imprevu-unexpected
- 共同规则：imprévu表示未被预料，与inattendu对应；soudain/brusque在突发语境可近似表达，但只强调突发不必然未被预料。
- 边界：不把所有突然事件都当成意外，也不同于事物的original新奇义。
- 支持题：2005-Q023, 2010-Q025, 2022-Q021
- 近邻反例：2015-Q028

**2005-Q023** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:157–158

```text
3. Cet orage <u>imprévu</u> a dérangé le projet que nous avions fait.
    A. inattendu B. inespéré C. surprenante D. inimaginable
```
归类依据：imprévu signifie inattendu

**2010-Q025** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:212–216

```text
25. Cet orage <u>imprévu</u> nous a retenus toute la journée à la maison.
A. soudain
B. extraordinaire
C. incroyable
D. brusque
```
归类依据：暴风雨未被预料，在本句以突然来临soudain近似表达；突发与未预料并非严格同义。

**2022-Q021** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2022-paper/2022年法语专四真题（无水印）.md:194–195

```text
21. En rentrant à la maison, Maude a fait une rencontre tour à fait <u>imprévue</u>.
A. inconnue          B. inattendue          C. incroyable          D. impossible
```
归类依据：imprévue signifie inattendue : la rencontre n'était pas prévue.

反例 **2015-Q028**：progressivement s'oppose à brusquement.；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2015-paper/2015年法语专四真题（无水印版）.md:218。

## 46. aggraver：使问题程度加重

- 类型：synonymous_sense
- 旧叶：k-soulager-aggraver, k-aggraver-moderer
- 新叶：kp-aggraver-severity
- 共同规则：aggraver使症状、困难等变得更严重；soulager或modérer依对象表示减轻、缓和。
- 边界：不保证所有语境可用calmer替换；不把所有影响健康的affecter都等同加重。
- 支持题：2010-Q028, 2024-Q027
- 近邻反例：2015-Q022

**2010-Q028** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:228–229

```text
28. Le froid a <u>aggravé</u> les difficultés des mal-logés.
A. a calmé B. a posé C. a modéré D. a créé
```
归类依据：加重困难的相反是减轻modérer；calmer多用于情绪、疼痛或骚动，不如modérer与困难程度契合。

**2024-Q027** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2024-paper/2024年法语专业四级真题.md:258–262

```text
27. Le médecin m'a conseillé de prendre ce médicament pouvant <mark><u>[soulager]</u></mark> la douleur.
A. aggraver
B. supporter
C. oublier
D. partager
```
归类依据：soulager 缓解疼痛，aggraver 则加重。

反例 **2015-Q022**：affecter la santé dans un contexte négatif signifie l'abîmer.；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2015-paper/2015年法语专四真题（无水印版）.md:193。

## 47. à peine：极低或勉强达到的程度

- 类型：synonymous_sense
- 旧叶：k-a-peine-aimable, k-a-peine
- 新叶：kp-a-peine-degree
- 共同规则：à peine＋性质/行为说明程度很低、几乎不或勉强达到，如几乎不友善、勉强通过。
- 边界：不包括à peine…que刚一…就…的时间结构。
- 支持题：2010-Q036, 2011-Q025
- 近邻反例：2013-Q076, 2018-Q050

**2010-Q036** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:262–262

```text
36. A. très B. un peu C. fort D. à peine
```
归类依据：à peine aimables 与后文 mais il y a pire 表送货员几乎不友善。

**2011-Q025** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2011-paper/2011年法语专四真题（无水印版）.md:206–210

```text
25. On peut <u>a peine</u> passer par cet étroit escalier.
A. aussitôt
B. beaucoup
C. difficilement
D. seulement
```
归类依据：à peine passer signifie passer difficilement.

反例 **2013-Q076**：dès qu'il a posé ... il s'est endormi 表一放下头就睡着。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2013-paper/2013年法语专四真题（无水印版）.md:496。

反例 **2018-Q050**：周末独处时喜欢看电影，lorsqu’il était seul最中性自然。dès que/aussitôt que会增加一独处便去的立即性，习惯叙述下也可成立；après que不自然承接未完成状态。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2018-paper/2018年法语专四真题（无水印版）.md:265。

## 48. le/la/les替代直接宾语

- 类型：same_rule
- 旧叶：k-2006-q052, k-2008-q045, k-former-quelquun-a, k-gerondif-pronom
- 新叶：kp-nominal-cod-clitic
- 共同规则：已识别为动词直接宾语的名词对象由le/la/les按性数替代，弱读代词置于所支配动词、不定式或分词前。
- 边界：不合并lui/leur间接宾语、命题le或肯定命令式后置顺序。
- 支持题：2006-Q052, 2008-Q045, 2018-Q063, 2019-Q059, 2021-05-Q076
- 近邻反例：2005-Q045, 2006-Q052, 2006-Q055, 2008-Q067

**2006-Q052** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:264–265

```text
52. Le docteur m'a demandé de passer une radio à l'hôpital. Je vais ______ faire cet après-midi.
A. la B. en C. le D. y
```
归类依据：la可回指une radio，faire la radio；le可回指passer une radio整件事。题干不足排除中性le。

**2008-Q045** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:249–253

```text
45. Ils aiment la musique, surtout les chansons populaires. Elles ___ intéressent beaucoup.
A. leur
B. les
C. s'
D. s'y
```
归类依据：intéresser prend un objet direct les

**2018-Q063** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2018-paper/2018年法语专四真题（无水印版）.md:349–353

```text
63. **Les cadeaux ne vous plaisent pas ? Mieux vaut s'en débarrasser que de \_\_\_\_\_\_\_\_ laisser dans un placard.**
A. le
B. les
C. vous
D. leur
```
归类依据：les 替代阳性复数 cadeaux，作 laisser 的直接宾语。

**2019-Q059** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2019-paper/2019年法语专四真题（无水印版）.md:351–355

```text
59. Il ne suffit pas d'équiper les individus en nouvelles technologies. Il faut aussi \_\_\_\_\_\_ former à leur utilisation.
A. les
B. leur
C. en
D. y
```
归类依据：former les individus à 使用直接宾语 les。

**2021-05-Q076** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2021-05-paper/2021年5月法语专四真题（无水印版）.md:507–511

```text
76. J'ai songé en _______ regardant : « Comme ils ont l'air tristes ! »
A. le
B. leur
C. les
D. eux
```
归类依据：en les regardant：看着他们，直接宾语代词 les 位于分词前。

反例 **2005-Q045**：le reprend le fait de dire merci；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:228。

反例 **2006-Q052**：la可回指une radio，faire la radio；le可回指passer une radio整件事。题干不足排除中性le。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:264。

反例 **2006-Q055**：le reprend la proposition entière de la situation；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:273。

反例 **2008-Q067**：le reprend la proposition elle est partie；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:385。

排除历史正例 **2021-05-Q063**：较新裁决表明该历史例并不支持此叶；从支持正例中排除，不改既有题目答案或分类。

## 49. à l’abri de：免受危险

- 类型：synonymous_sense
- 旧叶：k-menace-abri, k-a-labri-de
- 新叶：kp-abri-danger
- 共同规则：être à l’abri de表示不受某威胁或危险，语境可与être menacé相对。
- 边界：不将à l’ombre的纯树荫位置或dans l’ombre的受遮蔽比喻都并入安全义。
- 支持题：2011-Q024, 2019-Q030
- 近邻反例：2025-Q025

**2011-Q024** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2011-paper/2011年法语专四真题（无水印版）.md:200–204

```text
24. Dans l'immédiat, il faut placer les victimes <u>à l'abri</u> de la tempête.
A. hors de
B. au-dessus de
C. au-dessous de
D. à mesure de
```
归类依据：à l'abri de la tempête signifie hors de son danger.

**2019-Q030** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2019-paper/2019年法语专四真题（无水印版）.md:230–231

```text
30. Beaucoup d'animaux sont ~~menacés par~~ la hausse de la température.
A. risqués de B. propagés par C. gardés par D. à l'abri de
```
归类依据：être menacé par与être à l’abri de相反。删除线保留；划去词仍可读，不把排除独立样本资格等同无法解答。

反例 **2025-Q025**：热与树荫语境支持B à l'abri的遮蔽义；只作本语境近义，不将两短语视作任何环境下恒等。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2025-paper/2025年法语专四真题.md:194。

## 50. plutôt＋形容词：相当、比较

- 类型：synonymous_sense
- 旧叶：k-plutot, u-sol-5ae7e128c303
- 新叶：kp-plutot-degree
- 共同规则：plutôt修饰amusant、jeune等性质时可近义assez，表示相当、比较的程度。
- 边界：区别plutôt que偏好对照与plus tôt更早。
- 支持题：2010-Q064, 2010-Q090
- 近邻反例：2008-Q060, 2009-Q058, 2018-Q052, 2021-05-Q037

**2010-Q064** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:357–361

```text
64. Ton aventure est _____ amusante.
A. plutôt
B. plus tôt
C. plutôt qu'
D. tôt
```
归类依据：plutôt amusante 表相当有趣，区别 plus tôt 时间更早。

**2010-Q090** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:568–575

```text
90. Quelle affirmation suivante est vraie à propos de cette clientèle masculine?
A. Ils sont d'âge mûr.

---

B: Ils sont assez jeunes.
C: Ils sont assez âgés.
D: Ils sont d'un certain âge.
```
归类依据：原文明言消费者plutôt jeune，对应assez jeunes；冒号标签按位置2识别。

反例 **2008-Q060**：plutôt que de oppose les deux activités；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:343。

反例 **2009-Q058**：A表达偏好对比，其余为时间先后或缺连接词；但两名词的规范搭配通常préférer le français aux autres langues。[学院说明](https://www.academie-francaise.fr/preferer-que-b)强调名词第二补语用à，因此记录选项设计缺少标准à而不把A当唯一规范范式。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2009-paper/2009年法语专四真题及答案 校对 + 仿考试卷排版.md:395。

反例 **2018-Q052**：plutôt que de + 不定式比较倾向，空后已有原形。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2018-paper/2018年法语专四真题（无水印版）.md:278。

反例 **2021-05-Q037**：plutôt qu'en papier 对比布制与纸制手帕；qu' 后已有 en。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2021-05-paper/2021年5月法语专四真题（无水印版）.md:268。

## 51. chez＋人：住所或执业场所

- 类型：same_rule
- 旧叶：k-chez-producteurs, k-chez-nourrice
- 新叶：kp-chez-person-place
- 共同规则：chez＋表示人的名词短语定位在其住所、店铺或职业活动场所，如生产者处、保姆家。
- 边界：不同于dans＋地域或sur＋网络平台；不把所有人际关系都视为地点。
- 支持题：2016-Q040, 2018-Q053
- 近邻反例：2016-Q045

**2016-Q040** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2016-paper/2016年法语专四真题（无水印版）.md:270–270

```text
40. A. une mère B. une tante C. un nourrisson D. une nourrice
```
归类依据：chez une nourrice 指把孩子交给保姆。

**2018-Q053** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2018-paper/2018年法语专四真题（无水印版）.md:284–288

```text
53. Le docteur nous conseille de faire nos courses _______ <u>producteurs locaux</u>.
A. des
B. aux
C. chez les
D. pour les
```
归类依据：faire ses courses chez les producteurs 表到生产者处购物。

反例 **2016-Q045**：sur Weibo et WeChat 表在平台上发布。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2016-paper/2016年法语专四真题（无水印版）.md:288。

## 52. de peur de/que：避免担忧事件

- 类型：same_rule
- 旧叶：k-de-peur-de, k-de-peur-que
- 新叶：kp-peur-de-que
- 共同规则：de peur de＋不定式或de peur que＋虚拟式说明为避免所担忧事件而行动；从句可有赘词ne。
- 边界：不等同pour avoir fait的已发生原因或sans的未发生伴随。
- 支持题：2008-Q077, 2011-Q064, 2018-Q064, 2019-Q044, 2022-Q069, 2025-Q054
- 近邻反例：2013-Q043

**2008-Q077** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:449–453

```text
77. Je t'interdis de parler en mangeant ________ tu ne t'étouffes.
A. afin que
B. de peur que
C. pour que
D. de façon que
```
归类依据：de peur que ne introduit le risque à éviter

**2011-Q064** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2011-paper/2011年法语专四真题（无水印版）.md:395–399

```text
64. Ne lui dis pas <u>la vérité</u>, \_\_\_\_\_\_ le choquer.
A. de peur de
B. afin de
C. de façon à
D. à condition de
```
归类依据：de peur de le choquer 表怕使他震惊；原文空位在真话后。

**2018-Q064** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2018-paper/2018年法语专四真题（无水印版）.md:355–359

```text
64. **Ils parlent tout bas \_\_\_\_\_\_\_\_ on ne les entende.**
A. pour qu'
B. de façon qu'
C. de peur qu'
D. afin qu'
```
归类依据：de peur qu'on ne les entende 表怕被听见，ne 为赘词。

**2019-Q044** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2019-paper/2019年法语专四真题（无水印版）.md:276–277

```text
**44.** Je ne lui ai pas dit tout à fait la vérité ________ elle soit peinée.
A. de peur qu' B. sous prétexte qu' C. au point qu' D. parce qu'
```
归类依据：de peur qu'elle soit peinée 表担心使她难过。

**2022-Q069** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2022-paper/2022年法语专四真题（无水印）.md:392–393

```text
69. Elle leur a téléphoné pour les prévenir de son retard______ils ne s'inquiètent.
A. de peur qu' B. à moins qu' C. pour qu' D. pourvu qu'
```
归类依据：de peur que ... ne s'inquiètent 表为了避免担心，ne 为赘词。

**2025-Q054** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2025-paper/2025年法语专四真题.md:307–311

```text
54. Elle a éteint son téléphone portable ________ on ne la dérange.
A. de manière qu'
B. de peur qu'
C. pour qu'
D. si bien qu'
```
归类依据：关闭手机为避免干扰，B de peur que配虚拟式及赘词ne；pour que若接肯定dérange反而表达要被打扰。

反例 **2013-Q043**：pour avoir roulé 表因先前超速受罚。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2013-paper/2013年法语专四真题（无水印版）.md:302。

## 53. favoriser：促进

- 类型：synonymous_sense
- 旧叶：obj-lex-encourage, k-favoriser-freiner
- 新叶：kp-favoriser-promote
- 共同规则：favoriser使某活动、行为或生产得到推动、发展，可近义encourager，与freiner阻碍相对。
- 边界：不把给予个人精神支持的soutenir/appuyer一概等同生产促进。
- 支持题：2012-Q023, 2018-Q027
- 近邻反例：2018-Q024

**2012-Q023** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2012-paper/2012年法语专四真题（无水印版）.md:191–192

```text
23. Les villes, aidées par l'État, cherchent à <u>favoriser</u> l'usage de modes de déplacement plus écologiques.
A. rassurer B. encourager C. maintenir D. envisager
```
归类依据：favoriser l'usage signifie l'encourager.

**2018-Q027** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2018-paper/2018年法语专四真题（无水印版）.md:184–185

```text
27. La baisse des prix <u>favorise</u> la production et la productivité.
A. facilite B. freine C. trouble D. tue
```
归类依据：favoriser la production s'oppose à la freiner.

反例 **2018-Q024**：鼓励给予精神支持，用appuyer最贴切；secourir偏救助危急处境，虽同属帮助却不如C贴合encouragements。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2018-paper/2018年法语专四真题（无水印版）.md:165。

## 54. suivre/suivant：随后、后继

- 类型：synonymous_sense
- 旧叶：k-precedent-suivant, k-annees-suivre
- 新叶：kp-suivre-temporal
- 共同规则：时间序列中的suivre、suivant指随后发生或后继的一项，与précédent相对。
- 边界：区别suivre un itinéraire按路线行进的空间义。
- 支持题：2016-Q028, 2018-Q036
- 近邻反例：2013-Q033

**2016-Q028** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2016-paper/2016年法语专四真题（无水印版）.md:237–238

```text
28. Le nouveau gouvernement Valls compte 38 ministres et secrétaires d'État contre 32 dans <u>le précédent</u>. 19 hommes et 19 femmes.
A. le passé B. le présent C. le suivant D. le moment
```
归类依据：le précédent s'oppose au suivant.

**2018-Q036** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2018-paper/2018年法语专四真题（无水印版）.md:220–220

```text
**36.** A. passé B. suivi C. précédé D. vécu
```
归类依据：les années qui ont suivi 是随后那些年。

反例 **2013-Q033**：suivre un itinéraire précis 表遵循明确路线。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2013-paper/2013年法语专四真题（无水印版）.md:278。

## 55. divorce/divorcer：解除婚姻

- 类型：synonymous_sense
- 旧叶：k-divorce-mariage, k-divorcer
- 新叶：kp-divorce-marriage
- 共同规则：divorce、divorcer表示离婚、解除婚姻，和mariage建立婚姻的方向相反。
- 边界：不把分居、一般人际冲突或所有分离都当作离婚。
- 支持题：2015-Q026, 2018-Q035
- 近邻反例：2025-Q028

**2015-Q026** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2015-paper/2015年法语专四真题（无水印版）.md:212–213

```text
26. Des mesures ont été prises pour lutter contre le taux de <u>divorce</u> en augmentation.
A. fiançailles B. cohabitation C. mariage D. accord
```
归类依据：divorce s'oppose au mariage.

**2018-Q035** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2018-paper/2018年法语专四真题（无水印版）.md:218–218

```text
**35.** A. déménagent B. voyagent C. divorcent D. travaillent
```
归类依据：父母 divorcent 后母亲把他交给保姆或寄养家庭。

反例 **2025-Q028**：en bons termes融洽的反义C en conflit；B/D为近义干扰，en panne不用于人际融洽。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2025-paper/2025年法语专四真题.md:206。

## 56. passer/consacrer du temps à

- 类型：same_rule
- 旧叶：k-passer-temps-a, k-consacrer-a
- 新叶：kp-time-devoted-a
- 共同规则：passer/consacrer du temps à＋活动说明把时间用于该活动；à保留在名词或不定式活动补语前。
- 边界：不等同en＋时段的完成耗时、pendant持续时长或国名地点à。
- 支持题：2019-Q046, 2024-Q069
- 近邻反例：2008-Q044, 2014-Q076, 2024-Q070, 2025-Q052

**2019-Q046** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2019-paper/2019年法语专四真题（无水印版）.md:282–283

```text
**46.** Mon frère consacre une partie de son temps ________ l'élaboration de son projet d'avenir
A. en B. à C. pour D. de
```
归类依据：consacrer du temps à l'élaboration 支配 à。

**2024-Q069** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2024-paper/2024年法语专业四级真题.md:575–579

```text
69. Que l'on me donne six heures pour couper un arbre, j'en passerai quatre **【___】** préparer mon outil.
A. sans
B. pour
C. de
D. a
```
归类依据：passer quatre heures à préparer为花时间做事，à引活动。原D写a而解析597及613行写à，结合句法可核定重音修订。A sans虽可成一般“未做某事”描述，却不表达本句将四小时投入工具准备的时间分配，不与à并列最佳；B目的pour/C de也不承接规范时间活动支配。原始a若逐字填入是错误，位置D和修订后文本à须分开记录。

反例 **2008-Q044**：en cinq minutes mesure la durée nécessaire；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:243。

反例 **2014-Q076**：en moins d'une heure 表一小时内完成所需时间。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2014-paper/2014年法语专四真题（无水印版）.md:458。

反例 **2024-Q070**：en quatre-vingts jours 表完成环球旅行所需时间。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2024-paper/2024年法语专业四级真题.md:581。

反例 **2025-Q052**：A en cinq ans表达修复完成所需时长，最适本句承诺目标；B dans可表达五年后这个延后时点，但不是同一含义。两版解析武断排en，不能覆盖首轮正确推理。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2025-paper/2025年法语专四真题.md:295。

## 57. tout程度与toutes全体的双读法

- 类型：conditional_duplicate
- 旧叶：u-sol-184f76bd7111, u-sol-ee9d1214fb1f
- 新叶：kp-tout-degree-vs-all
- 共同规则：tout étonnées表示非常惊讶，toutes étonnées表示她们全都惊讶；两读法的语义角色不同，阴性元音前程度副词不变。
- 边界：不因两者自然就压成唯一答案，也不合并仅考辅音前副词配合的叶。
- 支持题：2007-Q055, 2019-Q063
- 近邻反例：2007-Q055, 2008-Q064, 2014-Q044, 2015-Q049

**2007-Q055** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:313–317

```text
55. Elles étaient\_\_\_\_\_\_ par ce qu'il avait dit.
A. toutes étonnées
B. tout étonné
C. toute étonnées
D. tout étonnées
```
归类依据：toutes étonnées表示她们全都惊讶；tout étonnées表示非常惊讶，副词在元音前不变。两义均自然。

**2019-Q063** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2019-paper/2019年法语专四真题（无水印版）.md:371–372

```text
63. Elles étaient ________ par ce qu'il avait dit.
A. toutes étonnées B. tout étonné C. toute étonnées D. tout étonnées
```
归类依据：D tout étonnées表示全然惊讶，阴性元音起首副词不变；A toutes étonnées表示她们全都惊讶。两读法在原句都自然，B/C配合不合。

反例 **2007-Q055**：toutes étonnées表示她们全都惊讶；tout étonnées表示非常惊讶，副词在元音前不变。两义均自然。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:313。

反例 **2008-Q064**：Anne阴性且pâle辅音开头，写toute pâle；源pale缺重音须按pâle读。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:367。

反例 **2014-Q044**：tout 修饰 étonnée，阴性元音开头时不配合。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2014-paper/2014年法语专四真题（无水印版）.md:267。

反例 **2015-Q049**：tout 修饰形容词 noirs，作副词不变。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2015-paper/2015年法语专四真题（无水印版）.md:283。

## 58. ce dernier point回指并列末项

- 类型：same_rule
- 旧叶：k-high-r-last-coordinate, u-sol-dd3b8819b409
- 新叶：kp-last-coordinate-reference
- 共同规则：ce dernier point把后续陈述限定于前面并列的最后一项，不自动覆盖所有并列话题。
- 边界：不是任意最近名词回指；题干与被回指末项范围不合时保留条件/阻断。
- 支持题：2021-06-Q099
- 近邻反例：2011-Q099

**2021-06-Q099** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2021-06-paper/2021年6月法语专四真题（无水印版）.md:695–699

```text
99. Aux yeux des Français, qu'est-ce qui est laissé de côté dans le traitement des problèmes de la vie quotidienne ?
A. Les informations dramatiques du monde.
B. Le goût du spectaculaire.
C. La confusion et l'incohérence.
D. Le suivi des informations.
```
归类依据：sur ce dernier point回指世界悲剧这一并列末项，使跟进不足不能无条件推广到日常问题报道。

反例 **2011-Q099**：ces deux terribles réalités紧邻les soucis d’hier et de demain，故C对应忧虑；A仅谈日期不对应soucis。C对未来的肯定比原文可能忧虑略强。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2011-paper/2011年法语专四真题（无水印版）.md:703。

## 59. 按篇章独立事件列举计数

- 类型：same_rule
- 旧叶：u-sol-a86cde765a35, u-sol-3e32040a93d6
- 新叶：kp-enumerated-event-count
- 共同规则：统计篇章实际列举的独立事件或阶段，不只数显式序号，也不将同一单位的重复提及多算一次。
- 边界：不同于直接查找已给数字、日期作差或按工作日历计时。
- 支持题：2007-Q092, 2014-Q098
- 近邻反例：2016-Q085

**2007-Q092** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2007-paper/2007年法语专四真题及答案 校对 + 仿考试卷排版.md:624–628

```text
92. Nancy Huston a passé _______ fois à côté des prix littéraires les plus prestigieux français.
A. un
B. deux
C. trois
D. quatre
```
归类依据：1981、1996、2001三部作品被列为未获该最高奖的前例，题意计三个既往落选事例，不把一部入围不同奖项重复计数。

**2014-Q098** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2014-paper/2014年法语专四真题（无水印版）.md:673–678

```text
## 98. Dans ce texte, on divise l'immigration chinoise en \_\_\_\_\_\_\_\_ périodes ou vagues ?

A. deux
B. trois
C. quatre
D. cinq
```
归类依据：南方先后两波之后，enfin另引东北近年的小规模移民，全文共三波；不能只数明确带première/deuxième的南方段而漏最后一波。

反例 **2016-Q085**：先绑定施工开始与主体完工两个事件端点，再计算87年并匹配近百年。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2016-paper/2016年法语专四真题（无水印版）.md:562。

## 60. 列举清单中的未提及项排除

- 类型：same_rule
- 旧叶：u-sol-2352de9e9487, u-sol-c8ccccb2ee68
- 新叶：kp-unlisted-inventory-exclusion
- 共同规则：否定问法下对照文章明确列举的对象或问题清单，识别没有对应文本条目的选项。
- 边界：不将“未提及”一般等同“明确相反”，也不靠主题不相符证明活动从不发生。
- 支持题：2005-Q099, 2010-Q084
- 近邻反例：2008-Q093

**2005-Q099** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:615–619

```text
99. Dans la liste suivante, éliminez le problème qui n'est pas indiqué dans le texte.
A. Le manque de bénéfices.
B. La surproduction.
C. La mauvaise gestion financière.
D. Les coûts de la production.
```
归类依据：亏损、生产成本和员工所指管理失误均有原文；过量生产未提。C把管理失误缩为财务管理，措辞较窄，但B的过量生产完全无对应。

**2010-Q084** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:522–526

```text
**84.** Lequel de ces matériels n'est pas utilisé dans le cours ?
A. Des manuels de grammaire.
B. Des **documents authentiques.**
C. Des paroles de chansons.
D. Des articles théoriques.
```
归类依据：歌曲、影视等真实材料、社会学文章均列出，语法教材未提；忽略局部加粗。

反例 **2008-Q093**：最早需要证件的是离开稳定社区者，D一直留社区与条件明确相反；外交官虽未列出，但不等于被明确排除。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:621。

## 61. 历史现在时的连续叙事

- 类型：instance_normalization
- 旧叶：k-historical-present, u-sol-680463a3f2d3, u-sol-4e53799c39a0
- 新叶：kp-historical-present-narration
- 共同规则：叙述过去事件时可转用现在时使场景现场化；在amène等已建立视角下，fait asseoir、se met à等谓语延续该视角。
- 边界：给定提示词中的使役或起始词汇结构保留作辅助证据，不另把每个事件建主叶；区别当前现场和已完成过去事件。
- 支持题：2008-V17, 2008-V18, 2008-V19
- 近邻反例：2005-V04, 2005-V06, 2005-V07, 2005-V08

**2008-V17** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:487–487

```text
Tout le monde (prendre) __________ congé, puis le roi est venu à moi, m'a saisi le bras et m'amène dans le grand salon d'attente, où il (s'asseoir) __________ et (me faire asseoir) __________ sur un canapé rouge qui est entré deux portes vis-à-vis de la cheminée. Alors il (se mettre) __________ à parler vivement, énergiquement :
```
归类依据：已给m’amène转入现在叙事，où il s’assied承接同一视角；s’assoit也是同一时态合法变体。

**2008-V18** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:487–487

```text
Tout le monde (prendre) __________ congé, puis le roi est venu à moi, m'a saisi le bras et m'amène dans le grand salon d'attente, où il (s'asseoir) __________ et (me faire asseoir) __________ sur un canapé rouge qui est entré deux portes vis-à-vis de la cheminée. Alors il (se mettre) __________ à parler vivement, énergiquement :
```
归类依据：承接amène和s’assied，用me fait asseoir表示让叙述者坐下；人称代词在faire前。

**2008-V19** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:487–487

```text
Tout le monde (prendre) __________ congé, puis le roi est venu à moi, m'a saisi le bras et m'amène dans le grand salon d'attente, où il (s'asseoir) __________ et (me faire asseoir) __________ sur un canapé rouge qui est entré deux portes vis-à-vis de la cheminée. Alors il (se mettre) __________ à parler vivement, énergiquement :
```
归类依据：承接连续现在叙事，Alors il se met à parler表示随后开始说话。

反例 **2005-V04**：distance parcourue aujourd’hui；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:433。

反例 **2005-V06**：visite à une auberge achevée；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:433。

反例 **2005-V07**：给定envoyer变为a envoyé，完整需on m’a envoyé作省音；但此处逐客含义为renvoyer，[Nathan所载雨果原文](https://horizons-pluriels.nathan.fr/horizonspluriels2019-2de/assets/chapitre-10-parcours-initiatiques-textes-dys-1/preview)第18页写m’a renvoyé，源漏re-。答案不静默更换给定动词。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:433。

反例 **2005-V08**：présentation du passeport antérieure；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:433。

## 62. bien que/quoique：事实让步

- 类型：synonymous_sense
- 旧叶：k-bien-que-subj, k-2008-q076, k-bien-que-elliptique, k-quoique-elliptique
- 新叶：kp-bien-que-quoique
- 共同规则：bien que、quoique说明某事实并不妨碍主句成立；完整从句通常用虚拟式，也可省略为形容词等短语。
- 边界：区别quoi que的无论什么、même si直陈式假设；省略式不凭空补造变位。
- 支持题：2005-Q072, 2005-Q074, 2008-Q076, 2010-Q061, 2015-Q063, 2016-Q074, 2017-Q053, 2018-Q057, 2019-Q045
- 近邻反例：2012-Q044, 2014-Q059, 2021-05-Q070, 2024-Q049

**2005-Q072** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:369–373

```text
72. ______ tu sois arrivé en retard, ils ne se fâcheront pas.
A. Même si
B. Malgré
C. Quoi que
D. Quoique
```
归类依据：quoique suivi du subjonctif exprime une concession

**2005-Q074** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:381–385

```text
74. ______ ses parents lui aient envoyé de l'argent, il n'a pas pu rentrer en France.
A. Puisque
B. Bien que
C. D'ailleurs
D. Par contre
```
归类依据：bien que introduit une concession au subjonctif

**2008-Q076** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2008-paper/2008年法语专四真题及答案 校对 + 仿考试卷排版.md:443–447

```text
76. Le chemin devenait plus facile, ________ un peu moins large.
A. quel que
B. quelque
C. quoi que
D. quoique
```
归类依据：quoique introduit une concession elliptique

**2010-Q061** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2010-paper/2010年法语专四真题（无水印版）.md:337–338

```text
61. ______ y ait de la neige, nous partirons en voiture à Lyon.
A. Même s'il B. Bien qu'il C. Pourvu qu'il D. A condition qu'il
```
归类依据：尽管有雪仍开车出发，用bien qu’il y ait；Même si须直陈式不能接ait。

**2015-Q063** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2015-paper/2015年法语专四真题（无水印版）.md:372–376

```text
63. ______ j'aie vu ce film dans ce cinéma, on retournera le voir tous ensemble.
A. Afin que
B. Pour que
C. À condition que
D. Bien que
```
归类依据：bien que + 虚拟式表尽管已看过仍一起再看。

**2016-Q074** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2016-paper/2016年法语专四真题（无水印版）.md:459–463

```text
74. Il n'a que quarante ans, ________ paraisse plus âgé.
A. quoiqu'il
B. quoi qu'il
C. même s'il
D. afin qu'il
```
归类依据：quoiqu'il paraisse 表尽管看起来老，用虚拟式。

**2017-Q053** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2017-paper/2017年法语专四真题（无水印版）.md:329–333

```text
53. Bien que le nom « France », après l'invasion des Francs, _______ le nom « Gaule » pour nommer le pays, ce sont les Gaulois que l'on désigne comme les ancêtres des Français.
A. ai remplacé
B. aie remplacé
C. aies remplacé
D. ait remplacé
```
归类依据：bien que 后用虚拟式过去时，第三人称单数 ait remplacé。

**2018-Q057** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2018-paper/2018年法语专四真题（无水印版）.md:309–313

```text
57. _______ <u>très jeune</u>, elle fait preuve d'une grande maturité.
A. Sauf que
B. Quoi que
C. Quoique
D. Quelle que
```
归类依据：quoique très jeune 为省略式让步，尽管年轻却成熟。

**2019-Q045** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2019-paper/2019年法语专四真题（无水印版）.md:279–280

```text
**45.** La route devenait plus facile, ________ glissante.
A. quoi que B. malgré C. bien que D. tant que
```
归类依据：bien que glissante 为省略式让步，路虽滑但更易走。

反例 **2012-Q044**：不论报纸怎么说，用quoi qu’on dise；源disc须按dise转写修复。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2012-paper/2012年法语专四真题（无水印版）.md:257。

反例 **2014-Q059**：quoi que tu dises 表无论说什么。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2014-paper/2014年法语专四真题（无水印版）.md:346。

反例 **2021-05-Q070**：quoi que tu fasses 表无论做什么，后用虚拟式。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2021-05-paper/2021年5月法语专四真题（无水印版）.md:465。

反例 **2024-Q049**：quoi que tu dises 表无论你说什么。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2024-paper/2024年法语专业四级真题.md:434。

## 63. essor：增长、蓬勃发展

- 类型：synonymous_sense
- 旧叶：k-essor-expansion, k-essor-difficulte
- 新叶：kp-essor-expansion
- 共同规则：en plein essor表示快速发展或扩张，可近义en pleine expansion；在发展方向上与en difficulté相对。
- 边界：不把技术先进avancé或一切数量增加均视为同一词义。
- 支持题：2014-Q023, 2021-05-Q028
- 近邻反例：2022-Q030

**2014-Q023** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2014-paper/2014年法语专四真题（无水印版）.md:198–202

```text
23. Avec le développement d'Internet, l'e-commerce est en plein <u>essor</u>.
A. (pleine) expansion
B. mouvement
C. état
D. éveil
```
归类依据：en plein essor signifie en pleine expansion.

**2021-05-Q028** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2021-05-paper/2021年5月法语专四真题（无水印版）.md:229–233

```text
28. Ce mode de vente en ligne est <u>en plein essor</u>.
A. mis en cause
B. très critiqué
C. bien apprécié
D. en difficulté
```
归类依据：en plein essor signifie en forte croissance ; en difficulté est l'opposé le plus proche.

反例 **2022-Q030**：techniques de pointe sont avancées, tandis que dépassées sont obsolètes.；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2022-paper/2022年法语专四真题（无水印）.md:226。

## 64. favorable/hostile：支持与反对

- 类型：synonymous_sense
- 旧叶：k-favorable-hostile, k-2005-q028
- 新叶：kp-favorable-hostile
- 共同规则：favorable à和hostile à在对项目、提议等的态度上构成支持、有利与反对、不利的对立。
- 边界：不泛化到所有表示利益的en faveur de或不同行为的许可。
- 支持题：2005-Q028, 2022-Q029
- 近邻反例：2019-Q023

**2005-Q028** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:174–175

```text
8. La mère <u>est favorable</u> à ce mariage, elle adore la fiancée de son fils.
    A. mécontente de B. inquiète pour C. fâchée avec D. hostile à
```
归类依据：être hostile à s’oppose à être favorable à

**2022-Q029** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2022-paper/2022年法语专四真题（无水印）.md:223–224

```text
29. Elle est sans doute <u>favorable</u> à ce projet.
A. utile B. habituée C. préférable D. hostile
```
归类依据：favorable à un projet s'oppose à hostile à ce projet.

反例 **2019-Q023**：保护地球的措施是au profit de la planète；au service de虽相关却不是同等精确的受益关系替换。B原有下划线不作判定依据，词义本身足以支持。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2019-paper/2019年法语专四真题（无水印版）.md:196。

## 65. renoncer/abandonner/se retirer：放弃行动

- 类型：synonymous_sense
- 旧叶：k-se-retirer-abandonner, k-renoncer, k-abandonner-annuler
- 新叶：kp-renoncer-abandonner
- 共同规则：在行动、计划或比赛语境，renoncer à、abandonner、se retirer de表达不再坚持该行动或退出。
- 边界：与仅中断而未必放弃的interrompre区分；annuler不是任何对象上都能替换。
- 支持题：2016-Q021, 2018-Q023, 2021-06-Q023
- 近邻反例：2006-Q021

**2016-Q021** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2016-paper/2016年法语专四真题（无水印版）.md:194–198

```text
21. Nous avons dû <u>abandonner</u> notre projet à cause de cet incident.
A. changer
B. reporter
C. annuler
D. établir
```
归类依据：abandonner un projet signifie y renoncer ou l'annuler.

**2018-Q023** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2018-paper/2018年法语专四真题（无水印版）.md:159–163

```text
23. Je me décide à vous écrire, <u>renonçant</u> à trouver le courage de vous parler.
A. voulant toujours
B. ne voulant plus
C. ayant peur de
D. pensant
```
归类依据：renoncer à trouver le courage signifie ne plus vouloir ou abandonner l'idée de le trouver.

**2021-06-Q023** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2021-06-paper/2021年6月法语专四真题（无水印版）.md:205–209

```text
**23. Deux concurrents <u>se sont retirés de</u> la course.**
A. ont perdu
B. ont participé à
C. ont abandonné
D. ont gagné
```
归类依据：se retirer de la course signifie abandonner la compétition.

反例 **2006-Q021**：因就业中断学业，用interrompre ses études最惯常；abandonner更突出放弃，interrompre本身不保证永久。quitter ses études较不惯用，不能仅凭quitter可表离开就并列首选。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:159。

## 66. à cause de：不利事件原因

- 类型：same_rule
- 旧叶：u-sol-c0958dfc109f, k-cause-negative
- 新叶：kp-a-cause-de-negative
- 共同规则：à cause de＋名词短语说明通常带不利评价的原因；est dû à属于另一完整归因构式。
- 边界：不接受孤立介词à直接代替est dû à；旧487的不同解释单列待核。
- 支持题：2006-Q050
- 近邻反例：2005-Q035, 2018-Q045

**2006-Q050** · /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2006-paper/2006年法语专四真题及答案 校对 + 仿考试卷排版.md:258–259

```text
50. Cet accident est ______ mon imprudence.
A. grâce à B. à cause de C. sans D. à
```
归类依据：事故由我的疏忽造成，à cause de是给定选项中成立的因果短语；更正式可说est dû à。D仅à而没有dû不能独立表达归因，不接受旧候选D。

反例 **2005-Q035**：en raison de introduit le motif défavorable；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2005-paper/2005年法语专四真题及答案 校对 + 仿考试卷排版.md:201。

反例 **2018-Q045**：嗅觉帮助寻回失踪者，grâce à最自然。en raison de可中性陈述相同因果，并非语法错误；D把嗅觉拟作帮助者较弱，C通常偏不利原因。；来源 /Users/chuzu/codex test/TFS4-materials/data/stage2-handoff/md-batch/output/2018-paper/2018年法语专四真题（无水印版）.md:246。

