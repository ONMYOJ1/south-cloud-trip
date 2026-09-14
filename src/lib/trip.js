export const initialTrip = {
  members: [
    { id: 'm1', name: '林野', role: '管理员', initials: 'LY' },
    { id: 'm2', name: '阿周', role: '成员', initials: 'AZ' },
    { id: 'm3', name: '小满', role: '成员', initials: 'XM' },
    { id: 'm4', name: '乔乔', role: '成员', initials: 'QQ' },
    { id: 'm5', name: '大川', role: '成员', initials: 'DC' },
    { id: 'm6', name: 'Nina', role: '成员', initials: 'NI' },
  ],
  itinerary: [
    { date: '09.30', weekday: '周三', title: '抵达昆明', place: '昆明', status: '已规划', items: ['入住后休息', '晚餐：翠湖 / 南屏街附近'] },
    { date: '10.01', weekday: '周四', title: '昆明半日 · 前往西双版纳', place: '昆明 → 景洪', status: '已规划', items: ['上午：翠湖、云南大学、讲武堂', '下午：昆明南站动车 · 约 3h20m', '晚上：告庄西双景夜市'] },
    { date: '10.02', weekday: '周五', title: '热带植物园一日', place: '勐腊县', status: '重点日', items: ['西区热带雨林与棕榈园', '雨林沟谷、兰园、奇花异卉园', '傍晚返回景洪 · 约 1–1.5h'] },
    { date: '10.03', weekday: '周六', title: '野象谷 · 取车', place: '景洪 → 野象谷', status: '待确认', items: ['上午：野象谷雨林步道', '下午：观象 / 高空观景廊道', '傍晚：告庄取车，准备进山'] },
    { date: '10.04', weekday: '周日', title: '驶入景迈山', place: '景洪 → 景迈山', status: '重点日', items: ['自驾约 3.5–4.5h，山路慢行', '翁基古寨、糯干古寨、茶林'] },
    { date: '10.05', weekday: '周一', title: '茶山日出 · 普洱', place: '景迈山 → 普洱', status: '已规划', items: ['早起看日出（视天气）', '下午：茶马古城 / 茶博物馆'] },
    { date: '10.06', weekday: '周二', title: '抵达抚仙湖', place: '普洱 → 抚仙湖', status: '长途日', items: ['自驾约 6–6.5h，国庆预留余量', '湖边散步，看日落'] },
    { date: '10.07', weekday: '周三', title: '返程', place: '抚仙湖 → 昆明机场', status: '返程', items: ['上午湖边慢逛', '开往长水机场并还车'] },
  ],
  cars: [
    { id: 'c1', title: '9座商务车 · 舒适优先', subtitle: '别克GL8 / 同级', seats: '9座', dates: '10/02 晚 - 10/07', price: '¥2,680', deposit: '押金 ¥3,000', tag: '推荐', note: '六人+行李更宽松，适合景迈山山路', votes: [{ memberId: 'm1', value: 'up' }, { memberId: 'm2', value: 'up' }, { memberId: 'm3', value: 'up' }, { memberId: 'm4', value: 'down' }] },
    { id: 'c2', title: '7座SUV · 预算平衡', subtitle: '汉兰达 / 同级', seats: '7座', dates: '10/02 晚 - 10/07', price: '¥1,980', deposit: '押金 ¥2,000', tag: '性价比', note: '能装下人，但六人行李需要精简', votes: [{ memberId: 'm1', value: 'up' }, { memberId: 'm2', value: 'up' }, { memberId: 'm5', value: 'up' }] },
    { id: 'c3', title: '两台5座轿车 · 灵活', subtitle: '轩逸 / 同级 × 2', seats: '10座', dates: '10/02 晚 - 10/07', price: '¥2,240', deposit: '押金 ¥4,000', tag: '备选', note: '价格接近商务车，需要两位司机', votes: [{ memberId: 'm3', value: 'up' }, { memberId: 'm4', value: 'up' }, { memberId: 'm6', value: 'down' }] },
  ],
  stays: [
    { id: 's1', night: '09.30', city: '昆明', title: '翠湖·云上小院', location: '五华区 翠湖南路', price: '¥180/人', detail: '步行可达翠湖，次日去昆明南站约 35 分钟', link: 'https://www.booking.com', tag: '交通方便', votes: [{ memberId: 'm1', value: 'up' }, { memberId: 'm2', value: 'up' }, { memberId: 'm3', value: 'up' }, { memberId: 'm5', value: 'down' }], comments: [{ member: '阿周', text: '位置很适合第一天，晚上吃饭选择也多。', time: '刚刚' }] },
    { id: 's2', night: '10.01–10.03', city: '景洪', title: '告庄·江景双床房', location: '告庄西双景 景勐寨', price: '¥220/人/晚', detail: '离夜市近，打车去植物园更方便', link: 'https://www.booking.com', tag: '首选区域', votes: [{ memberId: 'm1', value: 'up' }, { memberId: 'm2', value: 'up' }, { memberId: 'm3', value: 'up' }, { memberId: 'm4', value: 'up' }, { memberId: 'm6', value: 'down' }], comments: [{ member: '小满', text: '建议选含停车位的房源，2号晚上取车。', time: '12分钟前' }, { member: '乔乔', text: '同意，最好离星光夜市步行 10 分钟内。', time: '8分钟前' }] },
    { id: 's3', night: '10.04', city: '景迈山', title: '翁基古寨·云端茶宿', location: '翁基古寨观景台附近', price: '¥260/人', detail: '看日出方便，停车需提前和民宿确认', link: 'https://www.booking.com', tag: '氛围最好', votes: [{ memberId: 'm1', value: 'up' }, { memberId: 'm2', value: 'up' }, { memberId: 'm4', value: 'up' }, { memberId: 'm5', value: 'up' }], comments: [] },
    { id: 's4', night: '10.05–10.06', city: '普洱', title: '思茅·茶城设计酒店', location: '思茅区 茶马古城旁', price: '¥150/人/晚', detail: '去茶博物馆、夜市方便，停车免费', link: 'https://www.booking.com', tag: '待投票', votes: [{ memberId: 'm1', value: 'up' }, { memberId: 'm3', value: 'up' }, { memberId: 'm6', value: 'down' }], comments: [] },
    { id: 's5', night: '10.06', city: '抚仙湖', title: '广龙小镇·湖畔民宿', location: '广龙小镇东门', price: '¥210/人', detail: '餐饮选择多，第二天去机场约 1.5h', link: 'https://www.booking.com', tag: '返程友好', votes: [{ memberId: 'm1', value: 'up' }, { memberId: 'm2', value: 'up' }, { memberId: 'm4', value: 'up' }], comments: [] },
  ],
}

export function applyVote(votes, memberId, value) {
  return value ? [...votes.filter((vote) => vote.memberId !== memberId), { memberId, value }] : votes.filter((vote) => vote.memberId !== memberId)
}

export function getVoteCounts(votes = []) {
  const up = votes.filter((vote) => vote.value === 'up').length
  const down = votes.filter((vote) => vote.value === 'down').length
  return { up, down, net: up - down }
}

export function sortOptions(options) {
  return [...options].sort((a, b) => getVoteCounts(b.votes).net - getVoteCounts(a.votes).net)
}
