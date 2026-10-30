# 剩余解析PDF批量转换（fast）

用户确认2005单卷fast效果满意后，准备本批。共21份PDF、1758页，排除已经完成的2005（92页）。2021五月/六月及2023两个解析版本分别处理；包括2025，因其之前为cost_effective，本批按确认的新参数重新转换，旧结果保留。

参数沿用试跑：`tier: fast`，`version: latest`，语言顺序`fr, ch_sim`，`output_options.watermark_handling: remove`。官方说明fast忽略此去水印选项，此限制与2005试跑相同，不自动升档。

双击同目录`run-remaining-fast.cmd`；本机完整路径：

```powershell
& 'D:\老蒋\LlamaParse\batch-explanations-2005-2025\run-remaining-fast.cmd'
```

如先仅检查输入文件、哈希、参数：

```powershell
& 'D:\老蒋\LlamaParse\batch-explanations-2005-2025\run-remaining-fast.cmd' --check
```

结果保存到`output-remaining-fast\<id>\`，每份有完整MD、逐页MD、页数/哈希/空页记录及原始返回。2005结果仍在`output-2005-fast`，原cost_effective批次仍在`output`。

沿用现有密钥读取、逐份顺序处理、续跑及防重复计费提交机制；再次执行本入口会跳过哈希一致的已完成文件，已有任务继续查询。服务端明确失败后才按需使用`--retry-failed`；结果不明时按原使用说明核对任务ID，勿盲目清状态。不要同时运行同一输出批次。脚本交付只做本地预检，不代表21份已提交/完成，也不自动上传MD到GitHub或修改题库。
