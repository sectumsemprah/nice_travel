# nice_travel 项目基线

## 项目目标

nice_travel 是一个“旅行攻略智能工作台 + 旅行记忆生成器”。项目帮助用户从合规旅行信息源中筛选有价值内容，结合个人偏好生成可执行行程，并在旅行后生成路径图、电子相册和可分享的旅行回忆页。

## 项目边界

- 首版聚焦个人用户与轻量分享，不实现多人实时协同编辑。
- 首版支持手动文本/链接导入、示例公开信息源 Provider 与 Mock LLM/地图 Provider，不实现绕过平台限制的爬取。
- 首版支持本地开发和开源展示，生产部署以 PostgreSQL、对象存储和 HTTPS 为目标形态。
- 首版电子相册以网页预览与 JSON/HTML 导出为主，PDF 属于后续增强。

## 技术栈

- 包管理与工作区：npm workspaces。
- 前端与后端入口：Next.js + React + TypeScript。
- 领域与共享契约：TypeScript + Zod。
- 数据库建模：Prisma schema，默认目标数据库为 PostgreSQL。
- 测试：Vitest。
- 代码质量：TypeScript type-check、ESLint、Prettier。
- 样式：CSS Modules / 全局 CSS，后续可升级 Tailwind CSS。
- 部署：Docker 或 Vercel/Railway/Fly.io + PostgreSQL。

## 架构分层

- `apps/web`：Next.js 应用，承载页面、Route Handlers 与服务编排入口。
- `packages/domain`：核心领域模型与纯业务规则，例如偏好评分、行程生成、相册生成。
- `packages/providers`：外部能力适配器，例如信息源、LLM、地图和存储 Provider。
- `packages/shared`：前后端共享类型、Zod schema、常量与错误类型。
- `docs`：架构、部署、数据与安全说明。
- `openspec`：规范、变更提案与任务拆解。

## 编码规范

- 默认使用 TypeScript strict mode。
- 文档与代码注释默认中文；代码标识符使用英文。
- 业务规则优先放在 `packages/domain`，外部 API 调用优先放在 `packages/providers`。
- Route Handler 只做输入校验、鉴权上下文解析、调用应用服务与返回响应，不直接堆复杂业务逻辑。
- 外部信息源必须保留来源引用、处理状态和失败原因。
- 生成类能力必须可追踪任务状态，避免静默失败。

## 安全与合规

- 不实现绕过平台登录、反爬、版权或 API 限制的采集逻辑。
- 用户照片、轨迹、偏好和分享令牌按敏感数据处理。
- 日志必须脱敏，不记录密钥、完整 Cookie、原始访问令牌和大段用户隐私文本。
- 分享链接必须不可猜测，并支持撤销或过期。
- 生产环境必须使用 HTTPS，Cookie Secure 不得关闭。

## 本地命令

- 安装依赖：`npm install`
- 开发启动：`npm run dev`
- 类型检查：`npm run type-check`
- 单元测试：`npm test`
- 构建：`npm run build`
- 格式化检查：`npm run format:check`
- 自动格式化：`npm run format`

## CI 要求

GitHub Actions 必须至少执行：

- `npm ci`
- `npm run type-check`
- `npm test`
- `npm run build`

## 部署环境

必需环境变量：

- `DATABASE_URL`：PostgreSQL 连接字符串。
- `APP_URL`：公开访问地址。
- `SESSION_SECRET`：会话签名密钥。

可选环境变量：

- `LLM_PROVIDER`
- `LLM_API_KEY`
- `MAP_PROVIDER`
- `MAP_API_KEY`
- `OBJECT_STORAGE_ENDPOINT`
- `OBJECT_STORAGE_BUCKET`
- `OBJECT_STORAGE_ACCESS_KEY`
- `OBJECT_STORAGE_SECRET_KEY`

