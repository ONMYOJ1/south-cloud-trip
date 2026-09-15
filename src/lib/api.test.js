import { describe, expect, it } from 'vitest'
import { attachComments, attachVotes, mapItineraryItem } from './api'

describe('supabase data mappers', () => {
  it('maps an itinerary row with computed weekday', () => {
    const row = { id: 'i1', day_date: '2026-09-30', title: '抵达昆明', place: '昆明', status: '已规划', details: ['入住后休息'] }
    expect(mapItineraryItem(row)).toEqual({ id: 'i1', date: '09.30', weekday: '周三', title: '抵达昆明', place: '昆明', status: '已规划', items: ['入住后休息'] })
  })

  it('attaches votes to the right targets', () => {
    const options = [{ id: 'a' }, { id: 'b' }]
    const votes = [
      { member_id: 'm1', target_type: 'stay', target_id: 'a', value: 'up' },
      { member_id: 'm2', target_type: 'stay', target_id: 'a', value: 'down' },
      { member_id: 'm1', target_type: 'car', target_id: 'a', value: 'up' },
    ]
    expect(attachVotes(options, votes, 'stay')).toEqual([
      { id: 'a', votes: [{ memberId: 'm1', value: 'up' }, { memberId: 'm2', value: 'down' }] },
      { id: 'b', votes: [] },
    ])
  })

  it('attaches comments with member display names', () => {
    const options = [{ id: 's1', votes: [] }]
    const comments = [{ id: 'c1', member_id: 'm2', target_type: 'stay', target_id: 's1', body: '位置很好', created_at: new Date().toISOString() }]
    const memberById = { m2: { name: '阿周' } }
    const result = attachComments(options, comments, 'stay', memberById)
    expect(result[0].comments[0].member).toBe('阿周')
    expect(result[0].comments[0].text).toBe('位置很好')
    expect(result[0].comments[0].time).toBe('刚刚')
  })
})
