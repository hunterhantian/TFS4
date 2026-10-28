# 手动批量转换为 Markdown

双击本目录的 `run.cmd`。窗口会持续显示上传、任务ID、服务端状态、耗时和完成页数，结束后停留等待按键。需要联网；密钥从 `D:\老蒋\llamakeys.txt` 读取，不写入脚本、状态或日志。

也可以在 PowerShell 运行：

```powershell
& 'D:\老蒋\LlamaParse\batch-2005-2025\run.cmd'
```

## 范围及固定参数

- 21套真题和21份配套答案，共42份输入，详见可编辑的 `sources.json`。
- 2005—2025资料中没有独立2020卷，保留2021年5月、6月两套，不虚构2020卷。
- 沿用之前登记的选源：2005—2009采用“校对 + 仿考试卷排版”合订版，其中可能自带答案；独立答案仍单独转换。其他年份优先已有分年卷，不上传十年合集、混年111.pdf或重复扫描版。
- 2022、2023的独立答案为JPG，作为图片原样上传解析。
- 不处理听力原文、翻译、音频，也不额外处理2025的解析PDF。
- `tier: cost_effective`；`version: latest`；`processing_options.ocr_parameters.languages: [ch_sim, fr]`。不限制页码，不设自动升档，不增加自定义提示词。
- 首次批处理复用之前2013测试成功的两份结果。其余40份首次运行会上传并解析，使用账户额度。没有预估或承诺费用。

## 输出和续跑

输出按输入分目录存入 `output\卷别-paper` 和 `output\卷别-answers`，每份包含：

- 原始MD（不润色，以 `---` 连接返回页面）。
- `result.json`：API完整结果，保留逐页原文。
- `request.json`、`submitted.json`、`upload.json`：配置及任务证据。
- `state.json`：输入及输出SHA256、任务ID、配置指纹、完成状态。
- `pages.json`：逐页字符数、原始页号与空页提示。

本目录 `run.log` 显示运行过程，`summary.json` 汇总本次结果。接口未返回费用时不推算实际账单。MD产出不代表已经校对或转JSON。

可以按Ctrl+C停止。再次双击会校验已完成文件哈希并跳过，未完成任务继续查询原任务，不重新提交。强行关窗或Ctrl+C后如遗留 `run.lock`，先确认旧进程已停止，再删除锁文件。不要同时开多个批处理窗口。

输入或配置变化时脚本会拒绝复用旧状态；请保留旧批次并使用新的批次目录，避免覆盖证据。

网络中断、轮询超时：直接重新运行。若服务端明确FAILED/CANCELLED，默认不重新计费提交；确需重试时运行：

```powershell
& 'D:\老蒋\LlamaParse\batch-2005-2025\run.cmd' --retry-failed
```

创建任务的POST不自动重试。如果提交后连接中断，无法确定服务端是否已经创建，脚本保留 `submissionPending` 并阻止重复提交。到LlamaCloud核对对应文件的任务：找到任务后将ID填入该文件 `state.json` 的 `jobId`；确实没有创建任务时才删除 `submissionPending` 后再运行。

只做本地文件检查、不读取密钥也不调用API：

```powershell
& 'D:\老蒋\LlamaParse\batch-2005-2025\run.cmd' --check
```

Node要求22或更新；启动器优先使用当前Codex捆绑Node，找不到时使用系统PATH中的node。

## 交付验证

脚本交付时只做Node语法检查、输入路径/数量核对及已有2013结果的哈希核验；未运行此批次、未发起新API请求。
