# 阶段2 JSON候选导入约定（初版）

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

answer为`{value,evidence}`，evidence为`{documentId,location,quote}`，必须指向answers资料。explanation为null或相同证据结构，必须指向explanations资料。分类为空可入候选，但给出缺失解析警告；有分类时必须有解析。

classification为null或`{primaryId,auxiliaryIds,basis,producer}`。主辅考点必须存在且不重复，basis保留提取理由，producer记载外部AI/人工生成来源。来源声明仅作为候选输入，不会因此获得审核状态。

阅读和听力必须有材料，材料questionIds与每题materialId双向一致。audioUrl只允许固定`/media/文件名`，不接收任意外部URL。材料题组未完整整理时不得拆散伪造完整性。

响应包含valid、errors、warnings，每个诊断含path、code、message。校验入口不写库；导入入口保存candidate或invalid批次供查看。对象字段顺序不影响内容指纹；重复内容返回原批次，相同source.id/version内容变化返回409，必须增加版本并注明修订。无效批次不占用正式来源版本，也不进入考试sources。

参考结构由`tests/bank-import.test.mjs`的合成样例验证；样例仅测试使用，不是2025真实内容。审核、发布和正式关联查询协议将在后续实现时补充，当前不存在发布API。
