# Supabase 初始化

1. 创建 Supabase 项目，在 SQL Editor 中执行 `schema.sql`。
2. 开启 Anonymous Sign-ins，供同行者用邀请码进入；管理员另建一个 Email/Password 用户。
3. 插入一条 `trips` 记录，`invite_code_hash` 使用文件末尾的 `crypt(...)` 示例生成。
4. 将管理员的 `auth.users.id` 与该旅行的 `members` 记录关联，并把 `role` 改为 `admin`。
5. 在 GitHub 仓库的 Actions secrets 中配置 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`。

不要把 Supabase service role key 放入前端、GitHub Pages 或 Actions 的公开构建变量中。
