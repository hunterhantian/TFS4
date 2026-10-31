# 截至2026-10-31的新增成果同步

本轮增量包含176个新增／修改文件（新增176、修改0）。结合[上轮715文件归档](../stage2-work-results-20261031/README.md)，完整当前快照共891文件。原始候选、待核、条件与来源状态继续保留。

## 直接阅读

- [近六卷反推考试大纲报告](reports/近六卷真题反推考试大纲报告.md)
- [36页PDF（含305知识叶附录与9个数据附件）](../../output/pdf/法语专四-近六卷反推考试大纲与命题分析.pdf)
- [完整知识点统计附录](reports/知识点统计附录.md)
- [720项题目索引](reports/题目索引.tsv)
- [词汇词元近似表](reports/词汇词元近似表.tsv)
- [Sol low r2语义去重报告](reports/Sol-low-r2语义去重报告.md)
- [66组合并台账](reports/Sol-low-r2语义合并台账.md)
- [未合并与待核边界](reports/Sol-low-r2未合并与待核.md)
- [Sol low r1知识树报告](reports/Sol-low-r1知识树报告.md)
- [Terra合成索引](reports/Terra合成索引.md)、[来源优先矩阵](reports/答案来源优先矩阵.md)

直接阅读副本保持原字节；其中本地相对链接及绝对路径以恢复后的项目目录为准。可直接打开PDF查看完整内容及GitHub题号链接。

## 本轮范围

`TFS4-final-synthesis/`、`TFS4-knowledge-tree-sol-low/r1/`与`r2/`、`TFS4-reports/`、`output/pdf/`及独立成果入口说明、打包脚本。完整JSON、静态知识树浏览器、逐叶审视、逐题映射和来源台账均在归档内；未将整棵树的所有大JSON逐个展开为GitHub普通文件。所有文件逐个列于[file-manifest.json](file-manifest.json)。

旧715文件无删除且不改动，本轮另建成果导航；已有公开README和旧交接页保留原版，不在新归档中重新披露它们的运维文字。原始题面、答案与历史报告不覆写。PDF临时PNG、临时依赖和词典下载不属于交付快照；PDF验证证据已单独保存。

## 完整恢复

先按上轮README恢复原715文件，再于同一恢复目录执行以下步骤。增量仅更新清单列出的新增／修改文件，不删除旧文件。

```sh
cat archive/tfs4-update-20261031.tar.xz.part* > tfs4-update-20261031.tar.xz
shasum -a 256 tfs4-update-20261031.tar.xz
# 应为 ca4b698fb701b181d739f501172d59ca2349b3ab44b1cc664288cb2c9177139e
tar -xJf tfs4-update-20261031.tar.xz
```

增量归档2946500字节，共15个顺序分块。每个分块的SHA256与Git blob SHA见[archive-parts.json](archive-parts.json)；完整当前快照、增量逐文件SHA256及字节数见[file-manifest.json](file-manifest.json)。本地已验证归档逐项解包字节与原件一致。

恢复后可打开`TFS4-knowledge-tree-sol-low/r2/index.html`浏览完整r2树。需要构建报告时，使用报告目录内脚本及其说明；词元统计依赖的Lexique公开词典未打包，来源链接与许可在报告中。

## 状态边界

21场2520题映射完整保留；r2为902节点／881叶的候选目录，不等于正式答案发布或全量语义验收。六卷考纲报告仅反推观测到的题型与能力，词汇规划不是官方门槛。未合并main、未部署。
