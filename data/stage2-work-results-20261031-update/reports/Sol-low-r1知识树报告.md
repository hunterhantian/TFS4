# Sol-low 独立知识树 r1

已写出独立的语义候选目录与全量映射，覆盖21场2520条记录。输出只在本目录；未推送、部署、正式采纳判分答案或创建其它聊天/定时跟进。请求配置为gpt-6.1-sol / low，运行时未提供可独立验证的模型元数据。

## 答案输入真实状态

在TFS4-final-synthesis及TFS4-audits中定位了逐题裁决、修订内容和引用链，没有发现统一的最终答案表。上游ledger仍为intermediate_not_final_answers。本轮依据Sol high精确范围→Sol low精确范围修订→Terra候选建立answer-reference-view.json；听力源字母映射独立保留。多参考、不同读法、源修订前提和未决答案不压成唯一答案。跨层分歧保存在unresolved-and-conflicts.json，未重新答题。

## 目录变化

原临时树1002节点/970叶；本树981节点/960叶，最长3层。上层为语言形式与句法、词汇意义与惯用表达、书面篇章理解、口语理解任务、文化与专名知识；题型只在叶内分组。同一具体规则跨年跨型共享身份。

记录122组跨ID规则合并，合并170个额外旧候选身份；2次同ID功能拆分、2次上位复合定义拆分。保留190个旧具体叶，另有770个候选叶，正式采纳新叶为0。新增与保留并存，未设压缩目标。241种未列目录标签逐项保留去向或按语境建立独立候选，不把被替代标签自动视为同义证明。每个原ID/定义上下文见leaf-id-map.json；逐项理由和来源见catalog-decisions.json。共同218节点目录已读，本轮不称盲标；旧临时canonical树仅在本轮保存之后读取比较。

## 状态与计数

互斥集合：本地默认可用51，候选1912（1870条未审题 + 42条已审题但指向未独立审核的新叶），条件/未决136，听力题干任务413，缺源8。共2520条。未分配7条属于缺源子集（2018听力缺题面），不另加总。听力总记录420，其中413有任务候选、7缺题面；源字母不证明听辨知识点已审。原2009暴露/独立样本排除标记保留。formal_tree_usable全部为false，默认可用只表示隔离本地审核子集。

## 验证与语义证据

ID覆盖与唯一性、主叶/条件叶引用、无循环孤儿、深度、逐节点题型去重与状态过滤均通过；冻结的190个源文件SHA256未变。浏览页嵌入脚本通过node --check；未声称已作真实浏览器交互测试。

11组定向语义实证抽查已读取源MD行区间与必要材料，并给同叶正例、邻近困难负例，见semantic-checks.json。包括命题le vs 表语le、简单过去主线 vs 未完成背景、où所在 vs d’où来源、en完成耗时 vs il y a过去日期、grâce à vs à force de、bien que虚拟式 vs même si直陈式，以及en effet解释 vs 确认。2011-Q075“je le pense aussi”从表语叶移至命题回指叶，记录题面及旧→新理由，未升级审核状态。两个同叫until-clause的旧候选实际分别考presque arrivé的近邻位置与consister à支配，没有按标题合并。

这些检查不是全库语义准确率。1870条题目仍缺独立分类审核，部分宽泛/复合的继承候选仍需进一步逐题复核；本轮目录合成不使候选自动成为真值。11组边界抽查不能证明所有候选归类正确，未宣称生产判分已通过。

## 浏览与复现

打开index.html可搜索规则、题号及题面，按状态筛选；本地静态文件，无部署。机器产物包括input-manifest、答案引用视图、canonical-catalog、knowledge-tree、tree-item-mappings、leaf-id-map、catalog-decisions、未解/冲突清单、node-item-groups、对比报告、validation、timing和progress。synthesize.py、additional-decisions.py保存具体决定，validate.py重新核验，finalize.py写汇总。实际tokens和费用unknown；UTC起止与计时范围限制见timing.json。
