# 阶段2 JSON导入约定与1.6生产证据

**版本范围：** 下文schemaVersion=2和接口描述当前代码，上游OCR、全量校对和机器证据现已由本机独立旁挂记录支持。产品/技术/清单已升级1.6，完整设计见[Stage2机器主导题库生产流程](Stage2机器主导题库生产流程.md)。生产证据不混入候选对象；由受控本机脚本核验并写入独立表。

## 1.6上游生产记录

原始资料先分年分卷，所有文档强制Best OCR，助手全量校对修订，再保存整理JSON和导入对象。已有文字层不跳过，原始OCR文字不是最终JSON。旁挂manifest记录来源/页码映射、工具/模式/模型/语言/DPI/哈希、全量校对覆盖、逐项修订、执行者AI、问题及各阶段状态；当前v2对象继续兼容，本轮2023/2024已接入服务端证据校验，保留机器校对与用户确认独立状态。

原始OCR、proofread.json、修订清单、import-v2.json各自存档并关联。用户指定参考答案和原始资料保留；AI建议与正式依据区分，缺答案的校对草稿不以假A填充现有必填字段。机器质量门通过后可记录机器校对通过，用户只需可选整批确认/退回；不得把一次人工内容通过写成Best及全量校对已完成。

内容与AI关联状态继续独立，关联实验JSON保存候选对及依据，未验证的实验不用于正式推荐。2023/2024最小测试实际通过后再全题库批处理。下面当前接口中人工来源确认、审核说明等维护能力，不是用户在1.6主流程必须逐题完成的工作。

## 当前导入对象与接口


2026-10-27。格式版本2，与阶段0的固定2025候选格式版本1区分。入口`POST /api/admin/bank/validate`和`POST /api/admin/bank/imports`，请求为`{"payload": {...}}`。仅管理员可用，写请求需要既有Origin、会话和CSRF。请求体沿用1MiB限制，大资料分明确来源版本整理，不静默截断。

顶层字段全部必填：

| 字段 | 内容 |
| --- | --- |
| schemaVersion / dataset | `2` / `candidate`，拒绝fixture、正式状态和额外审核字段 |
| source | id、version正整数、year、title、revisionNote |
| documents | id、name、sha256、kind（paper/answers/explanations/audio/transcript）、provenance（user_confirmed_reference/unconfirmed） |
| parts | id、label、component（listening/vocabulary/grammar/reading）、order正整数 |
| types | id、label |
| materials | id、kind（reading/cloze/listening）、questionIds完整有序题组；text或受控audioUrl至少一项 |
| knowledgePoints | id、name、aliases数组；规范名及同义名经NFKC/去空白/大小写归一后不得冲突 |
| questions | 见下文；每批至少一道，所有标识及原题号唯一 |

题目字段为id、version、originalNo、partId、typeId、materialId（允许null）、text、options（2–4个A–D非空选项）、answer、explanation、classification。

有参考答案时answer为`{value,evidence}`，evidence为`{documentId,location,quote}`，必须指向answers资料。explanation为null或相同证据结构，必须指向explanations资料。分类为空可入候选，但给出缺失解析警告；有分类时必须有解析。

classification为null或`{primaryId,auxiliaryIds,basis,producer}`。主辅考点必须存在且不重复，basis保留提取理由，producer记载外部AI/人工生成来源。来源声明仅作为候选输入，不会因此获得审核状态。

阅读和听力必须有材料，材料questionIds与每题materialId双向一致。audioUrl只允许固定`/media/文件名`，不接收任意外部URL。材料题组未完整整理时不得拆散伪造完整性。

响应包含valid、errors、warnings，每个诊断含path、code、message。校验入口不写库；导入入口保存candidate或invalid批次供查看。对象字段顺序不影响内容指纹；重复内容返回原批次，相同source.id/version内容变化返回409，必须增加版本并注明修订。无效批次不占用正式来源版本，也不进入考试sources。

参考结构由`tests/bank-import.test.mjs`的合成样例验证；真实候选见`data/2025-stage2-candidate.json`，待助手在题库成型后核对，用户不承担逐题关联审核。

## 当前AI关联维护接口（兼容实现）

`POST /api/admin/bank/batches/:id/classifications`接收`{sourceVersion,revisionNote,knowledgePoints,classifications,producer}`。classifications每项为`{questionId,primaryId,auxiliaryIds,basis}`。明确增加来源版本，保留原题面、指定答案和解析；未列入题目分类置空，不继承审核、来源确认或发布状态。整份修订也可导出JSON后增加来源版本重新导入。

`GET /api/admin/bank/batches/:id`返回payload、revision、reviews、confirmations、publication、audit及逐题issues。读取后所有修改带expectedRevision，过期返回409。

- `POST .../confirm-documents`：`{expectedRevision,documentIds,reason}`。仅在实际核实后确认可作为审核依据，留操作者与说明；不因文件名含“解析”自动确认官方来源。
- `POST .../review`：`{expectedRevision,questionIds,decision,reason,acknowledgeIssues?}`。decision为approved/returned。通过必须有分类、解析、已确认的答案与解析依据。解析出现不同答案时须额外显式确认并写处置说明，指定参考答案不自动修改。整批原子提交；任何一项失败不部分写入。
- `POST .../publish`：`{expectedRevision}`。只发布已通过关联，未审/退回题的primary_id为空。重复请求幂等；发布后批次只读。新版本不能覆盖历史题目版本的题面、材料、答案或题型；内容变化须增加题目版本。不同规范考点的同义名冲突会阻止整个发布。

正式Part、题型和材料按发布版本存储，规范考点和同义名全库统一。已发布的新来源版本取代该来源旧版本参与关联查询；旧版本和审核日志保留。发布不修改Stage1的sources、考试快照、报告或判分事件。

`GET /api/reports/:id/questions/:questionId/related`验证报告归属或管理员只读权限；使用该报告冻结题号/版本及题面/答案匹配当前已发布关联，只匹配相同题型和主考点及能力分项，排除自身。返回候选年份来源、解析、完整材料题组及当前登录用户的次数、错误次数、最近结果，按未做过优先、年份倒序。辅助考点不单独触发推荐。未审核或版本不符时明确返回空结果及原因。

错误批次、全部未审核批次和仅退回批次无法发布。听力/阅读材料种类须与分项匹配。同一卷面SHA256不能改来源ID重复导入。候选请求超过浏览器keepalive限制时前端使用常规请求；服务器仍执行1MiB限制。


## 当前内容审核接口与关联分离

现有页面允许管理员查看题目后直接选择“审核通过”，不要求填写通过说明，不要求先有分类、解析或人工来源确认，答案/解析异常只作为内容提示，指定判分答案不改变。单题按钮和批量选择均支持；结果立即保存，刷新保留。

知识点分类、主辅考点、同义名、AI候选、关联核对和关联发布属于独立的“AI关联维护”页面，由助手在后期题库成型后集中维护。内容审核与关联审核使用不同记录和版本，不互相代替；内容通过不等于关联通过或发布。关联推荐仍只使用内容通过且经独立核对发布的关联；内容退回会即时停止该题作为关联目标。

本规则替代此前把当前审核按钮解释为“通过所选关联”，以及让用户先确认来源、填写必填说明或处理分类后才能通过的流程。这些是现有接口行为；1.6要求机器校对通过及用户可选批次确认，不能把手动点击替代生产质量证据。

### 内容审核接口

- `GET /api/admin/bank/batches/:id/content`：返回候选payload、内容revision、内容reviews和只读issues。
- `POST /api/admin/bank/batches/:id/content-review`：`{expectedRevision,questionIds,decision,reason?}`。decision为approved/returned；reason可省略，服务端生成默认说明。仅检查结构有效批次、选中题目归属和并发版本，不依赖解析、分类、来源确认或异常确认。写入独立的bank_content_reviews/state/audit，不写bank_reviews或bank_publications。
- 原`.../review`、`.../confirm-documents`、`.../publish`保留为AI关联维护接口；来源和分类依据校验只在关联流程生效。关联发布还要求题目内容已通过。
- 外部AI只改分类生成新版本时，继承未变化内容的审核结果，关联审核和来源确认仍不继承；一般完整JSON修订不自动继承内容审核。
- 增量迁移005只新增内容审核表，不把旧关联审核记录冒充成内容审核，不修改原题、基础存档及已有确认记录。


## 2023/2024缺参考答案与生产证据扩展

缺参考资料时answer允许`{value:null,evidence:null,status:"missing_reference"}`；非空伪造值拒绝。返回MISSING_REFERENCE_ANSWER警告，内容审核和已审核题库正常展示，AI关联通过及发布拒绝。解析仍为null并提示待补。

`GET /api/admin/bank/batches/:id/content`新增production，可为空或可信本机生产摘要。迁移006的bank_production_evidence按import_id保存不可覆盖证据；普通JSON上传不能授予生产状态。本机脚本`scripts/import-proofread-batches.mjs`核验实际原件、页图、OCR输出、候选文件哈希，逐页/逐题覆盖及材料页码后，备份并事务导入；重复执行幂等。听力原文、翻译、音频不进入本轮生产输入。详见[2023/2024题库准备与验收](2023-2024题库准备与验收.md)。
