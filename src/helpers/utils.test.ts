import { describe, expect, it } from 'vitest'
import { parseAmount } from './utils'

describe('parseAmount', () => {
  it('should return 1 if value is 1000000000000000000', () => {
    expect(parseAmount('1000000000000000000')).toBe('1')
  })
})