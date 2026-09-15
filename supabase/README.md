# Supabase 初始化

1. 创建 Supabase 项目，在 SQL Editor 中先执行 `schema.sql`，再执行 `seed.sql`（执行前替换两处占位符：邀请码 `YOUR_INVITE_CODE`、管理员账号邮箱 `YOUR_ADMIN_EMAIL`）。
2. 在 Dashboard → Authentication → Sign In / Providers 中开启 **Anonymous Sign-ins**，供同行者匿名登录后用邀请码进入。
3. 管理员自己的账号：在 Authentication 中创建一个 Email/Password 用户（或用 Supabase 内置邀请创建），`seed.sql` 会按邮箱自动关联为 `admin`。
4. 前端 `.env`（本地）或 Actions secrets（线上）配置 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`；`VITE_TRIP_ID` 固定为 seed 中的旅行 ID。
5. 把邀请码发给其余五人，打开网页输入昵称 + 邀请码即可加入。

不要把 Supabase service role key 放入前端、GitHub Pages 或 Actions 的公开构建变量中。
