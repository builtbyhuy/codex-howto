# 从一个可验证的项目开始使用 Codex

**语言范围：**本入门指南提供五种语言。60 篇详细课程、可执行练习文件、源码预览和知识测验仍为英文。选择指南语言并不会把整套课程切换成中文。

指南更新于 **2026 年 10 月 22 日**；产品文档核对日期为 **2026 年 10 月 21 日**。功能可用性可能因客户端版本、操作系统、账户和组织策略而不同。

[English](../en/README.md) · [Tiếng Việt](../vi/README.md) · [中文](../zh/README.md) · [日本語](../ja/README.md) · [Українська](../uk/README.md)

## 1. 打开一个你能亲自检查的项目

Codex 是编程智能体，可以读取项目文件、提出修改并使用可用工具。建议从桌面应用开始：项目、对话和预览集中在同一工作区。安装和登录请按[官方应用说明](https://learn.chatgpt.com/docs/app)操作；如果已经安装，先确认当前版本和界面。选择 Codex，再打开独立的练习文件夹。登录成功并不代表已经选中了正确的项目。

打开[第一课](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s01-01)，下载 [Orbit Notes](https://codex-howto.hokhachuy1234.chatgpt.site/labs/project-workflow.zip) 并解压。压缩包会在解压根目录下保留 `labs/project-workflow/` 结构。进入该练习目录，运行：

```text
node create-workspace.cjs
```

这需要已有的 Node.js 20+，命令会返回一个全新的临时文件夹路径。请在 Codex 中打开这个准确路径。没有 Node 时，可以用文件管理器复制 `starter/`，但要明确记录“尚未执行代码检查”。不要把私人文档放进练习目录。

## 2. 先确认事实，再允许修改

打开返回的文件夹后，发送：

```text
只读操作：确认实际工作目录。读取 README.md、AGENTS.md 和 notes.json。说明项目用途、四条笔记的 ID，以及文档是否提供部署网址。先检查 package.json 是否存在，再判断 README 中的测试说明是否成立。不要修改文件，也不要安装任何东西。
```

亲自打开文件核对回答。四个虚构笔记 ID 是 `n1`、`n2`、`n3`、`n4`。项目没有记载部署网址。初始 README 建议执行 `npm test`，但项目并不存在 `package.json`：这是练习中故意放入的不成立指令。可靠的回答应指出这个矛盾，而不是编造网址，或安装依赖来掩盖它。

`AGENTS.md` 是项目指令文件，但文件存在并不能证明所有客户端都发现并遵循了它。此时最重要的成果，是有文件证据支持的环境说明。如果回答中的工作目录不对，先打开正确的项目，不要让 Codex 继续修改无关文件。

## 3. 修复一个错误并验证结果

在自己的临时副本中记录初始状态：

```text
node --test checks.cjs
node cli.cjs REVIEW
```

预期为 **4 项通过、2 项失败**。搜索应支持子串匹配，不区分大小写，并忽略查询两端的空格。请 Codex 修复 `notes.cjs`，保留原笔记对象及其顺序，同时将 README.md 的验证命令改成实际可用的命令。保持 `notes.json`、`checks.cjs` 和 `WORK-NOTE.md` 不变。然后执行：

```text
node --test checks.cjs
node cli.cjs "  REVIEW  "
```

目标是 **6 项全部通过**，并输出 `n1: Review launch checklist` 和 `n3: Review documentation`。亲自查看修改后的文件。智能体说“完成”不能代替测试结果。如果仍然失败，提供具体输出，要求修复最小相关范围；不要删除失败断言，也不要直接用参考答案覆盖整个项目。练习包提供完整答案与评分标准，请在尝试之后再比较。

随后可以练习局部恢复：在 README 中保留一段有用的新说明，只撤销一个不满意的标题修改。重新开一个对话不会恢复文件。已有 Git 的用户可进行可选练习，查看暂存区基线与实际差异；另一个独立演示说明持久化提交历史。暂存快照和 Git 提交是不同的检查点，不要混淆。

## 4. 按十个模块循序学习

课程共 **60 课**，顺序如下。Skill 是可复用的指令包；MCP 是连接工具与数据的协议；子智能体负责被委派的任务；hook 在受支持的事件发生时执行处理；plugin 把相关能力打包分发。后续课程会分别说明设置方式与可用条件。

| 阶段 | 模块与课数 |
| --- | --- |
| 基础 | [命令与首次会话](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s01-01) — 6；[项目指令与记忆](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s02-01) — 5；[恢复与 Git](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s08-01) — 5；[CLI](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s10-01) — 5 |
| 中级 | [Skills](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s03-01) — 6；[Hooks](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s06-01) — 7；[MCP](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s05-01) — 6；[子智能体](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s04-01) — 7 |
| 进阶 | [高级功能](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s09-01) — 7；[Plugins](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s07-01) — 6 |

每课都有目标、说明、示例、练习、应检查的证据、参考答案和知识测验。先独立尝试，再展开答案。显示的学习时间只是估算，不代表完成后必然熟练。

## 5. 分清七个练习包的验证范围

[练习库](https://codex-howto.hokhachuy1234.chatgpt.site/#labs)提供七个独立下载包。`project-workflow` 练习首个项目与恢复；`cli-pipeline` 验证子进程事件流及提取报告；`skill-workflow` 提供可复用审查 skill 和确定性辅助程序；`mcp-workbench` 在本地进程之间实际交换 JSON-RPC 消息；`delegation-capstone` 集成两份有明确边界的任务；`hook-policy` 回放受约束事件并核对文件证据；`workflow-plugin` 组合 skill、工具和连接配置材料。

这些本地程序会实际执行，但虚构数据、合成事件和模拟委派都有标注。辅助程序通过测试，不等于 Codex 真正调用了 skill、选择了 MCP 工具、启动了子智能体或激活了 hook。可选的原生客户端路线会单独说明如何观察这些行为。阅读每个包的 README，在新副本中操作，并区分初始练习故意失败的检查与参考实现应通过的检查。

## 6. 应用、CLI 和 IDE 的操作并不相同

**桌面应用**使用项目、对话和修改审查面板。**CLI** 是终端中的独立客户端，当前目录和命令参数决定运行环境。**IDE 扩展**位于代码编辑器中，需要确认编辑器工作区根目录并使用扩展的界面。不要把 CLI 命令粘贴到应用对话中，就假定它能操作应用本身。

查看已安装客户端实际支持的菜单和功能，并遵循课程中对应客户端的说明。API 密钥或机密材料不应出现在练习提示中。参阅 [CLI 文档](https://learn.chatgpt.com/docs/codex/cli)、[身份验证](https://learn.chatgpt.com/docs/auth)及[执行权限](https://learn.chatgpt.com/docs/agent-approvals-security)。遇到组织限制时，先确认限制来自哪里，不要把缺少权限当成模型能力问题。

## 7. 保存进度或在本机运行网站

网站不要求学习账户。打开课程会记录进度；完成验证后再标记学完。进度和测验选择存储在当前浏览器、当前来源中，因此本地预览和公开网站各有一份记录。更换设备或清除浏览器数据前，在 Source library 中导出进度备份，然后在目标浏览器导入。隐私模式或禁用存储可能导致无法持久保存。网站不会执行终端示例。

已有 Git 和 Node.js 20+ 时：

```text
git clone https://github.com/builtbyhuy/codex-howto.git
cd codex-howto
node scripts/server.cjs
```

访问 `http://127.0.0.1:4173/`，保持终端运行，按 Ctrl+C 停止。无需安装依赖包或执行框架构建。请通过服务器访问，不要直接双击 index.html。交互阅读器需要 JavaScript。

## 来源、反馈与再使用

这是独立的社区指南，与 OpenAI、Anthropic 或参考项目作者没有隶属关系，也不提供认证。学习组织方式参考 [Claude How-To](https://luongnv.com/claude-howto/)，Codex 操作内容则根据已核实的能力重新编写。[源码仓库](https://github.com/builtbyhuy/codex-howto)包含来源说明及[第三方声明](https://github.com/builtbyhuy/codex-howto/blob/main/THIRD-PARTY-NOTICES.md)。原项目的 [MIT 声明](https://github.com/builtbyhuy/codex-howto/blob/main/assets/licenses/claude-howto-MIT.txt)，以及字体、图标、Mermaid 和 schema 的各自许可证均予保留。公开访问不等于为原创课程内容授予新的统一许可证。

通过 [GitHub Issues](https://github.com/builtbyhuy/codex-howto/issues/new)反馈时，请注明课程 ID、客户端与版本，以及已去除敏感信息的症状。移除密钥和个人路径。如果产品与课程不同，请查阅链接的官方文档。核对日期说明证据所处的时间，不保证未来版本保持相同。
