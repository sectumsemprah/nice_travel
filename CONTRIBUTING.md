# 贡献指南

感谢你关注 nice_travel。

## 工作流

1. 对新功能先创建 OpenSpec 变更。
2. 在 `proposal.md`、Delta spec 和 `tasks.md` 获得确认后再实现。
3. 实现完成后执行类型检查、测试和构建。
4. 提交 PR 时说明关联的 OpenSpec change。

## 本地验证

```bash
npm run type-check
npm test
npm run build
```

## 合规要求

- 不提交真实 API Key、Cookie、访问令牌或用户照片。
- 不实现绕过第三方平台访问控制的爬取逻辑。
- 引入第三方代码前必须确认许可证兼容性。

