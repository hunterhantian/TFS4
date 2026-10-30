# 2025 未见卷全流程验证（第一轮）

处理日期：2026-10-30（UTC）。本卷是按时间倒序队列的起点；此前目录构建未使用 2025 卷。

## 输入冻结

- 试卷：`2025-paper`，18 页，SHA-256 `98912440dd684703954c2e63578bc513530ed5d39794da53e43416dbaec67bc9`。
- 答案：`2025-answers`，2 页，SHA-256 `fa0ce0667231125b45567062fc90dd2ec7087a2e55e8318da4b1e08cdb1e8674`。
- 未提供解析 MD；这不是可由答案字母补齐的缺口。
- 原始结构及逐页节点见 `2025/raw-structure.json`；结构化候选见 `2025-content-candidate/2025/content-v4.json`。

后续已接入独立的解析证据层 v1；其为未经校对的 LlamaParse 原文，不追溯修改上述输入冻结。校对结果见 `2025-explanation-evidence-r01/review-report.md`：80道非听力选择题有解析候选依据，52、61题存在答案冲突，66–70仅恢复为候选答案串 `ABACA`。

## 校对与结构化结果

- 题号、选择题选项、20 个动词括号、完形材料和四篇阅读材料均可由 MD 定位，并保留页码/字符区间证据。
- 生成 122 条内容记录：100 道选择题、20 个动词空、听写和写作任务各一条。当前生产范围是前 120 道客观/可核验动词题。
- schema 校验通过，无 warning；隔离库导入后存在 `tfs4-2025`、122 题与122个题目版本，`foreign_key_check` 为空。
- 2025 卷面中第15空动词写为 `renter`，答案为 `rentrerez`；两者原样保留，作为 MD 源差异待后续内容复核，不悄悄改正。

## 已隔离的来源问题

1. 答案 MD 的 66–70 行为 `ABACABA`（7 个字母对应5题）。因此 66–70 不映射答案，保留 `missing`；61–65 和71–80仍逐题映射。
2. 听力 1–20 虽有答案字母，但没有可用的音频/逐字稿；只可作为题干任务候选，不能进入已核验听力知识点或发布集合。
3. 无解析 MD，不能将答案字母当作知识点依据或官方正确性认证。

## 目录覆盖预检与新增点处理

现有 r03 目录可承接语法、阅读、完形和动词题的既有叶级标注流程；阅读材料边界在该卷完整，不需要因材料缺失新增阅读节点。词汇 Section A 的十个词义/固定表达，以及少量尚未裁决的语法边界，先进入**候选新增点清单**，不直接写入 r03 目录：

- 近义/反义目标：`prudent`、`nerfs d'acier`、`hors de lui`、`à tout prix`、`à l'ombre`、`se sont améliorées`、`avec précipitation`、`en bons termes`、`alourdissent`、`n'a pas pris une ride`。
- 每项后续必须有题干/选项证据、与现有叶的竞争比较、定义与排除边界；若只是既有“语境词义”叶的实例，则归入既有叶，不新建同义重复节点。

因此，本轮没有修改目录，也没有把候选标注伪装为已通过的金标。下一轮对 21–100 与20个动词题逐题给出主知识点候选，再集中裁决新点；这符合“先冻结校对产物、再批量标注”的流程。

## 可复现命令

```bash
node scripts/stage2-extract-md.mjs data/stage2-handoff/md-batch data/stage2-production-r01 2025
node scripts/stage2-pilot-content.mjs data/stage2-production-r01 data/stage2-production-r01/2025-content-candidate 2025
node scripts/stage2-domain.mjs validate data/stage2-production-r01/2025-content-candidate/2025/content-v4.json
```

隔离库为 `.local/stage2-2025/app.sqlite`，不纳入 Git，也未影响生产库或 r03 基线库。
