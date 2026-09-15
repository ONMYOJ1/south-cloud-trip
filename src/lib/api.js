import { supabase } from './supabase'

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function mapItineraryItem(row) {
  const [year, month, day] = row.day_date.slice(0, 10).split('-')
  const weekday = WEEKDAYS[new Date(year, Number(month) - 1, Number(day)).getDay()]
  return { id: row.id, date: `${month}.${day}`, weekday, title: row.title, place: row.place, status: row.status, items: row.details || [] }
}

export function attachVotes(options, votes, targetType) {
  return options.map((option) => ({
    ...option,
    votes: votes.filter((vote) => vote.target_type === targetType && vote.target_id === option.id).map((vote) => ({ memberId: vote.member_id, value: vote.value })),
  }))
}

export function attachComments(targets, comments, targetType, memberById) {
  const byTarget = {}
  comments.filter((comment) => comment.target_type === targetType).forEach((comment) => {
    ;(byTarget[comment.target_id] ||= []).push(comment)
  })
  return targets.map((target) => ({
    ...target,
    comments: (byTarget[target.id] || []).map((comment) => ({ id: comment.id, member: memberById[comment.member_id]?.name || '同行者', text: comment.body, time: formatTime(comment.created_at) })),
  }))
}

export function formatTime(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffHours < 48) return '昨天'
  return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

export async function loadTripData(tripId) {
  const [membersRes, itineraryRes, carsRes, staysRes, votesRes, commentsRes] = await Promise.all([
    supabase.from('members').select('*').eq('trip_id', tripId).order('created_at'),
    supabase.from('itinerary_items').select('*').eq('trip_id', tripId).order('sort_order').order('day_date'),
    supabase.from('car_options').select('*').eq('trip_id', tripId).order('created_at'),
    supabase.from('stay_options').select('*').eq('trip_id', tripId).order('created_at'),
    supabase.from('votes').select('*').eq('trip_id', tripId),
    supabase.from('comments').select('*').eq('trip_id', tripId).order('created_at'),
  ])
  const failed = [membersRes, itineraryRes, carsRes, staysRes, votesRes, commentsRes].find((res) => res.error)
  if (failed) throw failed.error

  const members = membersRes.data.map((member) => ({ id: member.id, name: member.display_name, role: member.role === 'admin' ? '管理员' : '成员', initials: member.display_name.slice(0, 1) }))
  const memberById = Object.fromEntries(membersRes.data.map((member) => [member.id, { name: member.display_name, initials: member.display_name.slice(0, 1) }]))
  const itinerary = itineraryRes.data.map(mapItineraryItem)
  const cars = attachVotes(carsRes.data, votesRes.data, 'car')
  const stays = attachComments(attachVotes(staysRes.data, votesRes.data, 'stay'), commentsRes.data, 'stay', memberById)

  return { members, itinerary, cars, stays }
}

export async function ensureSession() {
  const { data } = await supabase.auth.getSession()
  if (!data.session) {
    const { error } = await supabase.auth.signInAnonymously()
    if (error) throw error
  }
}

export async function joinTrip(tripId, inviteCode, nickname) {
  const { data, error } = await supabase.rpc('join_trip', { target_trip: tripId, invite_code: inviteCode, nickname })
  if (error) throw error
  return { id: data.id, name: data.display_name, role: data.role }
}

export async function myMembership() {
  const { data, error } = await supabase.rpc('my_memberships')
  if (error) throw error
  const member = data?.[0]
  return member ? { id: member.id, name: member.display_name, role: member.role } : null
}

export async function saveVote(tripId, memberId, targetType, targetId, value) {
  if (!value) {
    const { error } = await supabase.from('votes').delete().eq('member_id', memberId).eq('target_type', targetType).eq('target_id', targetId)
    if (error) throw error
    return
  }
  const { error } = await supabase.from('votes').upsert({ trip_id: tripId, member_id: memberId, target_type: targetType, target_id: targetId, value }, { onConflict: 'member_id,target_type,target_id' })
  if (error) throw error
}

export async function addComment(tripId, memberId, targetId, body) {
  const { error } = await supabase.from('comments').insert({ trip_id: tripId, member_id: memberId, target_type: 'stay', target_id: targetId, body })
  if (error) throw error
}

export async function addStayOption(tripId, memberId, draft) {
  const { error } = await supabase.from('stay_options').insert({ trip_id: tripId, created_by: memberId, night: draft.night, city: draft.city, title: draft.title, location: draft.location, price: draft.price, detail: draft.detail || '', link: draft.link || null })
  if (error) throw error
}

export async function addCarOption(tripId, memberId, draft) {
  const { error } = await supabase.from('car_options').insert({ trip_id: tripId, created_by: memberId, title: draft.title, subtitle: draft.subtitle || null, seats: draft.seats, rental_dates: draft.dates, price: draft.price, deposit: '押金待确认', note: draft.note || null })
  if (error) throw error
}
