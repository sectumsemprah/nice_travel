## ADDED Requirements

### Requirement: 用户旅行项目管理

系统 SHALL 允许用户创建、查看、编辑和删除旅行项目，并记录目的地、日期、预算、同行人、偏好与项目状态。

#### Scenario: 创建旅行项目

- GIVEN 用户已完成身份认证
- WHEN 用户提交目的地、日期、预算和偏好
- THEN 系统 MUST 创建旅行项目
- AND 系统 MUST 将项目归属于当前用户
- AND 系统 MUST 返回项目详情与初始状态

#### Scenario: 访问他人旅行项目

- GIVEN 用户 A 创建了私有旅行项目
- WHEN 用户 B 请求访问该项目
- THEN 系统 MUST 拒绝访问
- AND 系统 MUST 记录权限校验失败日志

### Requirement: 社交平台旅行信息检索与导入

系统 SHALL 支持基于目的地和偏好检索或导入旅行信息，并 MUST 遵守平台条款、公开 API、robots.txt 或用户授权边界。

#### Scenario: 合规检索公开信息

- GIVEN 用户创建了旅行项目
- WHEN 用户触发候选旅行信息检索
- THEN 系统 MUST 仅使用已配置的合规信息源 Provider
- AND 系统 MUST 保存来源 URL、平台名称、检索时间和处理状态
- AND 系统 MUST 避免保存未授权的大段原文或受版权保护图片

#### Scenario: 信息源不可用

- GIVEN 外部信息源 API 超时或返回错误
- WHEN 系统执行检索任务
- THEN 系统 MUST 将任务标记为失败或部分成功
- AND 系统 MUST 向用户展示清晰失败原因
- AND 系统 MUST 记录结构化错误日志

### Requirement: 候选内容筛选与洞察提取

系统 SHALL 从候选旅行信息中提取地点、推荐理由、限制条件、避坑提示、热度和置信度。

#### Scenario: 提取地点洞察

- GIVEN 系统已获取合规候选信息
- WHEN 摘要与提取任务运行
- THEN 系统 MUST 生成结构化 TravelInsight
- AND 每条洞察 MUST 保留来源引用
- AND 每条洞察 SHOULD 包含置信度或来源数量

### Requirement: 个性化行程生成

系统 SHALL 根据用户偏好、旅行时间、地点距离、营业时间、预算和节奏生成多日行程。

#### Scenario: 生成多日行程

- GIVEN 用户有旅行项目、偏好和候选地点
- WHEN 用户请求生成行程
- THEN 系统 MUST 生成按天组织的 ItineraryDay
- AND 每个行程节点 MUST 包含地点、建议时间、预计停留时长和推荐理由
- AND 系统 SHOULD 标记可能冲突的营业时间、交通时间或预算风险

#### Scenario: 候选信息不足

- GIVEN 候选地点不足以生成完整行程
- WHEN 用户请求生成行程
- THEN 系统 MUST 显式提示信息不足
- AND 系统 SHOULD 给出可补充的信息类型或默认备选方案

### Requirement: 路径图生成

系统 SHALL 根据已确认行程生成路径图或路线快照，并保留地图 Provider 与路线元数据。

#### Scenario: 生成路径图

- GIVEN 用户已确认至少一天行程
- WHEN 用户请求生成路径图
- THEN 系统 MUST 根据行程顺序计算路径
- AND 系统 MUST 保存 RouteSnapshot
- AND 系统 MUST 展示距离、预计耗时和关键路径点

#### Scenario: 地图 Provider 不可用

- GIVEN 地图服务不可用或额度不足
- WHEN 用户请求生成路径图
- THEN 系统 MUST 降级展示地点顺序列表
- AND 系统 MUST 保留失败原因用于后续重试

### Requirement: 旅行记忆素材管理

系统 SHALL 支持用户上传、管理和关联旅行照片、文字、时间与地点信息。

#### Scenario: 上传照片

- GIVEN 用户拥有旅行项目
- WHEN 用户上传旅行照片
- THEN 系统 MUST 保存原始素材或受控压缩版本
- AND 系统 MUST 生成缩略图
- AND 系统 MUST 将素材归属于对应旅行项目

#### Scenario: 删除素材

- GIVEN 用户拥有某个旅行素材
- WHEN 用户删除该素材
- THEN 系统 MUST 删除或标记删除素材记录
- AND 系统 SHOULD 清理关联的导出产物或标记其过期

### Requirement: 电子相册与回忆页生成

系统 SHALL 基于旅行素材、行程和地点轨迹生成电子相册或旅行回忆页。

#### Scenario: 生成电子相册

- GIVEN 用户已有旅行素材和行程
- WHEN 用户请求生成电子相册
- THEN 系统 MUST 生成包含封面、时间线、地点、图片和文案的 MemoryAlbum
- AND 系统 MUST 保存生成版本
- AND 用户 MUST 能预览生成结果

### Requirement: 分享与导出

系统 SHALL 支持将行程、路径图和电子相册以受控方式分享或导出。

#### Scenario: 创建只读分享链接

- GIVEN 用户拥有旅行项目或相册
- WHEN 用户创建分享链接
- THEN 系统 MUST 生成不可猜测的访问令牌
- AND 系统 SHOULD 支持过期时间或撤销能力
- AND 访问者 MUST 只能读取被分享内容

### Requirement: 异步任务与可观测性

系统 SHALL 将检索、摘要、路线计算和相册导出等耗时流程作为可追踪任务处理。

#### Scenario: 查询任务状态

- GIVEN 用户触发了行程生成或相册生成任务
- WHEN 用户查询任务状态
- THEN 系统 MUST 返回 pending、running、succeeded、failed 或 canceled 状态
- AND 系统 MUST 返回失败原因或结果引用
- AND 系统 MUST 记录 requestId、userId、tripId、jobId、traceId、耗时和结果

### Requirement: GitHub 开源交付

项目 SHALL 以可公开发布的 GitHub 仓库形式组织，并包含运行、测试、贡献、安全与环境变量说明。

#### Scenario: 新贡献者启动项目

- GIVEN 新贡献者克隆仓库
- WHEN 贡献者阅读 README 和 `.env.example`
- THEN 贡献者 MUST 能理解项目目标、依赖、启动命令和必要配置
- AND CI MUST 能执行 lint、type-check、test 和 build

## MODIFIED Requirements

当前没有已生效规范可修改。

## REMOVED Requirements

当前没有已生效规范可移除。

