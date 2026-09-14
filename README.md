# 滇南同行

手机优先的云南国庆旅行协作页。当前为可部署到 GitHub Pages 的前端 MVP，包含：

- 每日行程时间线
- 租车候选方案与赞成/反对投票
- 按城市筛选的住宿候选、投票、评论
- 本地添加住宿和租车候选表单
- 无 Supabase 配置时使用演示数据，后续接入数据库即可多人同步

## 本地运行

```bash
npm install
npm run dev
```

## GitHub Pages

项目使用 Vite 静态构建，执行 `npm run build` 后，将 `dist` 目录部署到 Pages 即可。后续接入 Supabase 时，在 CI 中注入 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`。

## 发布前置条件

当前代码尚未推送到 GitHub，也没有连接 Supabase。正式发布前需要：

1. 在本机重新执行 `gh auth login`，并创建一个 GitHub 仓库。
2. 在 Supabase SQL Editor 执行 `supabase/schema.sql`。
3. 创建管理员 Auth 用户和旅行空间，按 `supabase/README.md` 设置 `members.role = 'admin'`。
4. 将 Supabase URL 和 anon key 配置为 GitHub Actions secrets。
5. 推送到 `main` 分支，Actions 会自动发布到 GitHub Pages。

GitHub Pages 地址是公开的，私密性依靠邀请码和 Supabase RLS；不要把 service role key 放进前端。
