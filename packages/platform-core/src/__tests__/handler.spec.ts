import { createLogger, handlebarsValue } from '../handler'
import { App } from '../types/app'

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

  describe('createLogger', () => {
    test('creates logger default values', () => {
      const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()

      const logger = createLogger('LOG', { id: 'typeform' } as any, '1.0.1')
      logger('important message')

      expect(consoleLogMock).toBeCalledTimes(1)
      expect(JSON.parse(consoleLogMock.mock.calls[0][0])).toMatchObject({
        severity: 'LOG',
        message: 'important message',
        params: [],
        appId: 'typeform',
        version: '1.0.1',
        platformVersion: expect.stringMatching(/^\d+\.\d+\.\d+$/)
      })

      consoleLogMock.mockRestore()
    })
  })
})
