# nice_travel

一个辅助制定旅行攻略、沉淀旅行记忆的开源项目。

nice_travel 将旅行信息检索、个性化行程生成、路径图和电子相册串成一条完整链路：出发前生成攻略，旅行中记录素材，旅行后生成可分享的回忆页。

## 核心能力

- 合规旅行信息导入：支持用户粘贴链接/文本，并保留来源引用。
- 候选内容筛选：提取地点、推荐理由、避坑提示、热度和置信度。
- 个性化行程：根据目的地、日期、预算、同行人、兴趣和节奏生成多日计划。
- 路径图：基于行程节点生成路线快照，地图服务不可用时降级为地点顺序列表。
- 旅行记忆：管理照片、文字、地点和时间线，生成电子相册。
- 分享导出：支持只读分享链接和 HTML/JSON 导出。

## 技术栈

- Next.js + React + TypeScript
- npm workspaces
- Zod 共享契约
- Prisma schema，目标数据库 PostgreSQL
- Vitest 单元测试

## 快速开始

```bash
npm install
npm run dev
```

访问：

```text
http://127.0.0.1:3001
```

如果需要手动指定其他端口，可使用：

```bash
npx next dev apps/web --hostname 127.0.0.1 --port 3002
```

然后访问：

```text
http://127.0.0.1:3002
```

## 常用命令

```bash
npm run type-check
npm test
npm run build
npm run format
```

## 环境变量

复制 `.env.example` 为 `.env.local`，按需填写。

首版默认提供 Mock Provider，因此不配置外部密钥也能体验核心流程。

## OpenSpec

当前变更方案位于：

```text
openspec/changes/design-travel-memory-planner
```

实现完成并验证通过后，可执行：

```bash
openspec archive design-travel-memory-planner --yes
```

## 许可证

默认采用 MIT License。若后续引入强 copyleft 代码，需要重新评估许可证兼容性。
