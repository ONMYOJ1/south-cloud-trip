# 滇南同行

手机优先的云南国庆旅行协作页，包含：

- 每日行程时间线
- 租车候选方案与赞成/反对投票
- 按城市筛选的住宿候选、投票、评论
- 本地添加住宿和租车候选表单
- 邀请码加入旅行空间，Supabase 实时多人同步
- 无 Supabase 配置时使用演示数据，可直接体验界面

## 本地运行

```bash
npm install
npm run dev
```

未配置 Supabase 时自动使用演示数据。连接后端时，复制 `.env.example` 为 `.env`，填入 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`；`VITE_TRIP_ID` 保持 `supabase/seed.sql` 中固定的旅行 ID。

## GitHub Pages

项目使用 Vite 静态构建，执行 `npm run build` 后，将 `dist` 目录部署到 Pages 即可。接入 Supabase 时，在 CI 中注入 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`（`VITE_TRIP_ID` 已固定在 workflow 中）。

## 发布前置条件

正式发布前需要：

1. 在 Supabase SQL Editor 依次执行 `supabase/schema.sql` 和 `supabase/seed.sql`（seed 中替换邀请码和管理员 auth 用户 ID）。
2. 在 Supabase 后台开启 Anonymous Sign-ins。
3. 将 Supabase URL 和 anon key 配置为 GitHub Actions secrets。
4. 推送到 `main` 分支，Actions 会自动发布到 GitHub Pages。

GitHub Pages 地址是公开的，私密性依靠邀请码和 Supabase RLS；不要把 service role key 放进前端。
