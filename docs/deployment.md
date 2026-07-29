# 部署说明

## 本地开发

```bash
npm install
npm run dev
```

若 3000 端口已被占用：

```bash
npx next dev apps/web --hostname 127.0.0.1 --port 3002
```

## 数据库

生产建议使用 PostgreSQL。配置：

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nice_travel"
```

验证 Prisma schema：

```bash
npm run prisma:validate
```

执行迁移：

```bash
npx prisma migrate deploy --schema prisma/schema.prisma
```

## 生产安全

- 必须启用 HTTPS。
- `SESSION_SECRET` 必须使用高强度随机值。
- 不要提交 `.env`、上传素材、真实用户数据。
- 对外部 Provider 配置请求超时和速率限制。
