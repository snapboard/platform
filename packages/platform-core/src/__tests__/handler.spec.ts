import { handlebarsValue } from '../handler'

describe('handler', () => {
  describe('handlebarsValue', () => {
    test('string input', () => {
      const val = handlebarsValue('{{ hello.world }}', {
        hello: { world: 'exists' }
      })
      expect(val).toBe('exists')
    })

    test('object input', () => {
      const val = handlebarsValue({
        name: '{{ hello.world }}'
      }, {
        hello: { world: 'exists' }
      })
      expect(val).toEqual({ name: 'exists' })
    })

    test('array input', () => {
      const val = handlebarsValue(['{{ hello.world }}'], {
        hello: { world: 'exists' }
      })
      expect(val).toEqual(['exists'])
    })

    test('different inputs', () => {
      const val = handlebarsValue({
        a: ['{{ hello.world }}'],
        b: 2,
        c: { d: '{{ hello.world }}' }
      }, {
        hello: { world: 'exists' }
      })
      expect(val).toEqual({
        a: ['exists'],
        b: 2,
        c: { d: 'exists' }
      })
    })
  })
})
