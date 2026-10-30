# Stage2 v4：数据库与MD生产协议

2026-10-28，设计基准1.7。依据用户确认的完整Stage2重设计方案。当前为开发及真实数据校准阶段，**不表示Stage2全部验收完成**。

## 工作范围

LlamaParse负责PDF/图片到MD；Codex只读取MD及其已保存API返回，完成结构化、内部校对、参考映射、AI分析和规范考点标注。本轮不读取原PDF，不处理独立听力原文、翻译或音频。42份MD、452页、21套卷，2021年两场分别存储，没有独立2020卷。

沿用Fastify/SQLite，不接向量服务，不增加在线AI队列。内容、参考、AI分析、分类、审核和发布分别保存。Stage1 sources、考试快照、报告及成绩不改写；本期不接通新题库考试。

## 数据库

007迁移建立qb_域，008迁移补充不可变资料及追加审核事件的保护；001—006原文不变。

|层|表与约束|
|---|---|
|资料|qb_papers、qb_documents、qb_document_pages、qb_processing_runs；MD哈希、逐页原文、父来源哈希及流程参数；资料页不可修改|
|生产|qb_batches、qb_batch_items、qb_evidence_spans、qb_issues、qb_corrections；候选批次与逐项问题独立，证据使用Unicode码点区间|
|试卷|qb_paper_versions、qb_sections、qb_paper_items；卷别及章节结构保持原顺序|
|题目|qb_question_types、qb_questions、qb_question_versions；题目身份稳定，内容版本不可覆盖，题号仅为显示标签|
|材料|qb_materials、qb_material_versions、qb_material_members；材料版本改变时须增加依赖题目版本|
|资产|qb_assets、qb_asset_links；受控资产引用，缺实际图的生成描述不可替代图片|
|参考|qb_reference_entries、qb_answer_sets、qb_answer_candidates、qb_explanations；原始答案串、映射、来源冲突和参考采纳分别存储|
|考点|qb_knowledge_points、qb_knowledge_aliases、qb_knowledge_closure、qb_knowledge_relations、qb_method_patterns；规范树、别名、防环、合并及考法分开|
|分析|qb_analysis_versions、qb_classification_sets、qb_question_knowledge；绑定内容、答案和目录修订，一个主考点、多个辅助考点|
|发布|qb_review_events、qb_releases、qb_release_items、qb_effective_items；审核追加，当前有效组合单独记录|
|兼容|qb_legacy_mappings、qb_duplicate_pairs；旧ID及冻结内容匹配，重复候选不自动视为相同题|

分类基于三源MD校对后的明确解析依据或独立AI分析。AI分析与来源解析分区显示；有完整真题/答案/解析MD时，缺解析或三源冲突的题不得进入正式考点标注，仅可保留候选。答案mapped不等于adopted，不能因此进入自动判分。

目录任何修订目前采用保守失效策略：旧分类须基于新目录修订重新复核后恢复可检索。其内容仍保留。后续可优化为受影响子树失效，但不能默默复用已改变定义。

## v4内容对象

顶层：schemaVersion=4、kind=content、paper、paperVersion、revisionNote、documents、sections、types、materials、questions、references；可另带issues、corrections。不接收审核或发布字段。

- paper：id、year、session、title、examCode。
- document：id、role、name、mimeType、sha256、storageKey、provenance、pages，可带parentSha256。storageKey是私有目录相对键，拒绝绝对路径及父目录跳转。
- page：page、markdown。原始MD通过API逐页结果重建校验，存档时保留原文件字节哈希。
- section：id、parentId、label、order、instruction；父子防环。
- type：id、label、component、responseType。
- material：id、version、kind、text、questionIds、evidence。
- question：id、nodeKey、version、sectionId、typeId、originalLabel、order、text、responseType、options、annotations、materialId、evidence、answer；可附explanationIds、assetDescriptions、blankIndex。
- option：key、label、text；非选择题必须为空数组。候选可留异常标签，但可用选择题要求键唯一、内容非空。
- annotation：kind=underline、start、end，基于整理题干的Unicode码点。
- evidence：documentId、page、start、end、quote；quote必须精确等于原页切片。
- reference：id、kind、originalLabel、text、evidence。kind为answer、answer_group、model_essay或explanation。
- answer：version、status、value、candidates、reason。status为missing/mapped/conflicting/unusable/adopted；非adopted时value必须为null，adopted必须有匹配来源候选及采纳理由。
- issue：id、questionId、code、severity、status、message。blocking+open阻止对应内容通过。
- correction：id、questionId、before、after、reason、evidence。原文不覆盖。

动词空以blankIndex标示原篇章中的目标空，原号不伪造为101—122。完整材料独立保存。缺原图、缺明确空位、材料归属不明时保留具体问题。

## 2026-10-28确认的匹配原则更新

后续以“同知识点为核心，题型作为分组和训练顺序”为准，详见[Stage2匹配原则](Stage2匹配原则.md)。日常只标注题目的规范主知识点归属、题型及必要依据/复核；题间列表通过查询形成，不额外逐对配对、评分或写比较解析。新增有效题自动进入对应知识点/题型分组，不重标同组题。

只推进客观题，作文/看图等主观任务留存历史、不再进入后续匹配。正式节点聚合、多题分页和题型分组界面及最小标注适配仍待实现；下文strict/transfer/contrast和analysis-v1字段描述现有实现，不表示本轮已改接口或删改历史结构。

## AI分析与检索

analysis-v1对象字段：id、questionVersionId、answerSetId、catalogRevision、producer、runId、conclusion、primaryId、auxiliaryIds、methodId、basis、keyEvidence、boundary、distractors、issues、review。

keyEvidence引用question或material中的实际语句。review包含独立runId、producer、independentPrimaryId、decision、reason。独立轮次不同于独立模型，不能将同模型两轮复核声称为跨模型审计。

当前导入一次保存分析及其分类投影，分类投影位于独立表，修改分类需新分析ID，不复制整卷。独立classification-v1文件导入仍属后续接口补齐项。

严格模式仅相同typeId和primaryId；辅助考点、父级及表面相似不触发匹配。transfer限定不同题型；contrast要求有checked辨析边和区分信号。排序：同考法、本人未做、跨年份、年份倒序、卷别、原顺序。重复原题排除，完整材料随题返回。

## API

管理员统一前缀/api/admin/stage2；沿用会话、Origin、CSRF和权限。仅新导入与分析接口允许5MiB，其他接口维持原限制。

|接口|用途|
|---|---|
|GET /batches、/batches/:id|逐卷MD和候选批次状态|
|POST /imports/validate、/imports|{payload:content-v4}；校验不写库，导入不授予审核|
|POST /analyses|分析及独立复核候选，返回classificationId|
|GET/POST /knowledge-points|目录及expectedRevision条件写入|
|POST /knowledge-points/operations|merge/relation/method；expectedRevision防覆盖|
|GET /documents/:id/pages|受控读取原始MD证据，不返回本机路径|
|GET /questions|year、paperId、typeId、knowledgeId、descendants、q、page；25题分页|
|GET /questions/:versionId|内容、参考、材料、AI分析、修订和三项可用性标记|
|GET /questions/:versionId/related|mode=strict/transfer/contrast|
|POST /reviews|questionVersionId、expectedRevision、kind、decision、reason；支持items原子批量|
|POST /releases|items中的版本、分类和expectedRevision全部通过才事务发布|

旧报告相关题接口优先使用显式新旧映射，核对冻结题干、选项、答案及材料。没有映射的旧来源保留原兼容读取行为，不自动套新关联。旧bank_*写接口全面适配与停写切换尚未完成，因此仍保留旧页面，不把并行开发入口说成最终切换。

## 本机操作

从仓库根目录执行：

```powershell
node scripts/stage2-domain.mjs migrate-copy .local/stage2/app.sqlite .local/stage2-redesign/app.sqlite
node scripts/stage2-domain.mjs register-md .local/stage2-redesign/app.sqlite D:/老蒋/LlamaParse/batch-2005-2025
node scripts/stage2-domain.mjs backfill-legacy .local/stage2-redesign/app.sqlite
node scripts/stage2-redesign-review.mjs
```

前三项已实际执行，目的库已存在时不要重复migrate-copy覆盖。预览端口4176，沿用副本中的验收账号；不输出密码。register-md及backfill均可重复执行。旧候选回填是legacy_projection，不是MD或新增校对。

原始结构提取、三卷候选及校准分别由stage2-extract-md.mjs、stage2-pilot-content.mjs、stage2-calibrate.mjs负责。各脚本要求新输出目录。校准含本次50题的明确决定，不是可直接套全部年份的通用模型。

## 本轮客观题知识树实施更新（2026-10-28）

已在新独立副本实现最小主知识点标注适配与树节点多题查询，旧analysis-v1表和接口保持兼容。最小适配器只要求题目版本、主知识点、必要依据/引用、两个轮次及复核状态、expectedCatalogRevision；辅助点、考法、干扰项不强制补写。拒绝主观题及用上级汇总节点作主知识点。

- `POST /api/admin/stage2/objective-annotations`：导入最小标注候选，不自动审核或发布。
- `GET /api/admin/stage2/knowledge-tree?year=2012`：返回fr-objective目录、当前有效去重计数及待复核数。
- `GET /api/admin/stage2/knowledge-tree/:id/questions?status=available|pending&typeId=...&page=1&year=...`：后代题目聚合、题型分组计数及每页20项；候选与有效发布分开。

本轮三卷360项标注，277项可检索、83项候选。目录218节点，最长4层；同知识点不同题型共享主节点。独立副本为`.local/stage2-knowledge-tree/app.sqlite`，入口4181；旧源库与线上未改。API目前仍为管理员验收权限，普通用户考试/错题接入及Stage2正式质量门未完成。详见[交付记录](2026-10-28-三卷客观题标注与知识树交付.md)。

## 阶段完成标准

详见[Stage2-v4实施与验收记录](Stage2-v4实施与验收记录.md)。三卷候选122项结构可表达不等于三卷逐题校对完成。Precision@5不得由规范标签自匹配或不足五道相关题的小集合冒充。未完成完整真实闭环前，不进行21套正式JSON量产，也不部署云端。
