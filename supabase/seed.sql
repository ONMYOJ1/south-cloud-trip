-- 滇南同行 · 初始化数据
-- 用法：先在 SQL Editor 执行 schema.sql，
--       1. 把下方 YOUR_INVITE_CODE 换成一段足够长的随机邀请码（如 12+ 位字母数字），
--       2. 把 YOUR_ADMIN_EMAIL 换成管理员 Auth 账号的邮箱（Dashboard → Authentication → Users 里能看到），
--       3. 整段执行。
-- 前端 .env 中 VITE_TRIP_ID 固定为 b8d4f6e2-1a3c-4d5e-9f0a-7b8c9d0e1f2a。

insert into public.trips (id, title, invite_code_hash, start_date, end_date) values
  ('b8d4f6e2-1a3c-4d5e-9f0a-7b8c9d0e1f2a', '滇南同行 · 云南6人行',
   crypt('YOUR_INVITE_CODE', gen_salt('bf')), '2026-09-30', '2026-10-07')
on conflict (id) do nothing;

-- 管理员（通过邮箱找到 auth.users 的 UUID；其余五人在网页输入邀请码自行加入）
insert into public.members (trip_id, auth_user_id, display_name, role)
select 'b8d4f6e2-1a3c-4d5e-9f0a-7b8c9d0e1f2a', id, '林野', 'admin'
from auth.users
where email = 'YOUR_ADMIN_EMAIL'
on conflict (trip_id, auth_user_id) do nothing;

insert into public.itinerary_items (trip_id, day_date, title, place, details, status, sort_order) values
  ('b8d4f6e2-1a3c-4d5e-9f0a-7b8c9d0e1f2a', '2026-09-30', '抵达昆明', '昆明', '["入住后休息","晚餐：翠湖 / 南屏街附近"]'::jsonb, '已规划', 1),
  ('b8d4f6e2-1a3c-4d5e-9f0a-7b8c9d0e1f2a', '2026-10-01', '昆明半日 · 前往西双版纳', '昆明 → 景洪', '["上午：翠湖、云南大学、讲武堂","下午：昆明南站动车 · 约 3h20m","晚上：告庄西双景夜市"]'::jsonb, '已规划', 2),
  ('b8d4f6e2-1a3c-4d5e-9f0a-7b8c9d0e1f2a', '2026-10-02', '热带植物园一日', '勐腊县', '["西区热带雨林与棕榈园","雨林沟谷、兰园、奇花异卉园","傍晚返回景洪 · 约 1–1.5h"]'::jsonb, '重点日', 3),
  ('b8d4f6e2-1a3c-4d5e-9f0a-7b8c9d0e1f2a', '2026-10-03', '野象谷 · 取车', '景洪 → 野象谷', '["上午：野象谷雨林步道","下午：观象 / 高空观景廊道","傍晚：告庄取车，准备进山"]'::jsonb, '待确认', 4),
  ('b8d4f6e2-1a3c-4d5e-9f0a-7b8c9d0e1f2a', '2026-10-04', '驶入景迈山', '景洪 → 景迈山', '["自驾约 3.5–4.5h，山路慢行","翁基古寨、糯干古寨、茶林"]'::jsonb, '重点日', 5),
  ('b8d4f6e2-1a3c-4d5e-9f0a-7b8c9d0e1f2a', '2026-10-05', '茶山日出 · 普洱', '景迈山 → 普洱', '["早起看日出（视天气）","下午：茶马古城 / 茶博物馆"]'::jsonb, '已规划', 6),
  ('b8d4f6e2-1a3c-4d5e-9f0a-7b8c9d0e1f2a', '2026-10-06', '抵达抚仙湖', '普洱 → 抚仙湖', '["自驾约 6–6.5h，国庆预留余量","湖边散步，看日落"]'::jsonb, '长途日', 7),
  ('b8d4f6e2-1a3c-4d5e-9f0a-7b8c9d0e1f2a', '2026-10-07', '返程', '抚仙湖 → 昆明机场', '["上午湖边慢逛","开往长水机场并还车"]'::jsonb, '返程', 8);

insert into public.car_options (trip_id, title, subtitle, seats, rental_dates, price, deposit, note, link, tag) values
  ('b8d4f6e2-1a3c-4d5e-9f0a-7b8c9d0e1f2a', '9座商务车 · 舒适优先', '别克GL8 / 同级', '9座', '10/02 晚 - 10/07', '¥2,680', '押金 ¥3,000', '六人+行李更宽松，适合景迈山山路', null, '推荐'),
  ('b8d4f6e2-1a3c-4d5e-9f0a-7b8c9d0e1f2a', '7座SUV · 预算平衡', '汉兰达 / 同级', '7座', '10/02 晚 - 10/07', '¥1,980', '押金 ¥2,000', '能装下人，但六人行李需要精简', null, '性价比'),
  ('b8d4f6e2-1a3c-4d5e-9f0a-7b8c9d0e1f2a', '两台5座轿车 · 灵活', '轩逸 / 同级 × 2', '10座', '10/02 晚 - 10/07', '¥2,240', '押金 ¥4,000', '价格接近商务车，需要两位司机', null, '备选');

insert into public.stay_options (trip_id, night, city, title, location, price, detail, link, tag) values
  ('b8d4f6e2-1a3c-4d5e-9f0a-7b8c9d0e1f2a', '09.30', '昆明', '翠湖·云上小院', '五华区 翠湖南路', '¥180/人', '步行可达翠湖，次日去昆明南站约 35 分钟', null, '交通方便'),
  ('b8d4f6e2-1a3c-4d5e-9f0a-7b8c9d0e1f2a', '10.01–10.03', '景洪', '告庄·江景双床房', '告庄西双景 景勐寨', '¥220/人/晚', '离夜市近，打车去植物园更方便', null, '首选区域'),
  ('b8d4f6e2-1a3c-4d5e-9f0a-7b8c9d0e1f2a', '10.04', '景迈山', '翁基古寨·云端茶宿', '翁基古寨观景台附近', '¥260/人', '看日出方便，停车需提前和民宿确认', null, '氛围最好'),
  ('b8d4f6e2-1a3c-4d5e-9f0a-7b8c9d0e1f2a', '10.05–10.06', '普洱', '思茅·茶城设计酒店', '思茅区 茶马古城旁', '¥150/人/晚', '去茶博物馆、夜市方便，停车免费', null, '待投票'),
  ('b8d4f6e2-1a3c-4d5e-9f0a-7b8c9d0e1f2a', '10.06', '抚仙湖', '广龙小镇·湖畔民宿', '广龙小镇东门', '¥210/人', '餐饮选择多，第二天去机场约 1.5h', null, '返程友好');
