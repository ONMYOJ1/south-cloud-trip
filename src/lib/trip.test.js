import { describe, expect, it } from 'vitest'
import { applyVote, getVoteCounts, sortOptions } from './trip'

describe('trip collaboration helpers', () => {
  it('allows one member to change or clear a vote', () => {
    const first = applyVote([], 'm1', 'up')
    const changed = applyVote(first, 'm1', 'down')
    const cleared = applyVote(changed, 'm1', null)

    expect(first).toEqual([{ memberId: 'm1', value: 'up' }])
    expect(changed).toEqual([{ memberId: 'm1', value: 'down' }])
    expect(cleared).toEqual([])
  })

  it('counts votes and sorts options by net score', () => {
    const options = [
      { id: 'a', votes: [{ memberId: 'm1', value: 'up' }, { memberId: 'm2', value: 'down' }] },
      { id: 'b', votes: [{ memberId: 'm1', value: 'up' }, { memberId: 'm2', value: 'up' }] },
    ]

    expect(getVoteCounts(options[0].votes)).toEqual({ up: 1, down: 1, net: 0 })
    expect(sortOptions(options).map((option) => option.id)).toEqual(['b', 'a'])
  })
})
