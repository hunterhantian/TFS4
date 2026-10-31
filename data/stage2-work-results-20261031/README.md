# 昨天至今全部工作成果快照

用户授权同步到公开仓库hunterhantian/TFS4的stage-2-question-bank分支。完整包包含715个文件：Terra、Sol low、Sol high的实验、生产候选、审计核定、初标、报告、脚本和本地来源快照。历史不合格结果保留，不因上传变成审核通过；无账号、密钥或业务数据库。

## 阅读入口

- reports/本轮核定与初标交付小结.md：最新两套Sol成果。
- reports/首轮总报告.md：21场Terra high第一轮。
- reports/五流程比较报告.md：五组实验与限制。
- reports/Sol-low-305题摘要.md、reports/Sol-high-29题摘要.md：逐包统计。
- file-manifest.json：715个原始文件的路径、字节数、SHA256。
- archive-parts.json：33个二进制分块及校验值。

## 完整恢复

全部原始文件按原字节存入约6.45MB的tar.gz归档，通过33个二进制分块保存。克隆仓库后在本目录执行（输出目录请使用新空目录）：

```sh
cat archive/tfs4-complete-results-20261031.tar.gz.part* > /tmp/tfs4-complete-results-20261031.tar.gz
shasum -a 256 /tmp/tfs4-complete-results-20261031.tar.gz
mkdir /tmp/tfs4-results-restored-20261031
tar -xzf /tmp/tfs4-complete-results-20261031.tar.gz -C /tmp/tfs4-results-restored-20261031
```

归档SHA256：783b4ba80b598c02e8322f0a63cdea734222b47b30d32f49f5d903b53821af55。恢复后依据file-manifest.json校验每个原始文件。归档内部均为相对路径；JSON中的本机绝对路径是原始追溯记录，迁移运行时需作路径映射，不保证旧脚本可直接跨环境执行。

## 状态小结

Terra high首轮21场交付2520条记录，8条缺题面占位，2009因答案暴露排除独立样本，均未作正式金标。

Sol low：305题独立初标候选，177已有叶、128候选新叶，109个候选新叶定义；50题有改变分类的条件分支，115题条件状态，两个口径不同不相加。

Sol high：29题审阅，9题形成答案/最佳候选或多参考核定（含1题校勘前提），20题仍不能核定作答；16主标、6仅条件、7听力任务，17个候选新叶。尚未合树、正式采纳判分答案或发布。

本次只同步成果快照，不合并main、不部署。完整保存原件，报告中的验证不等同独立语义正确率。
