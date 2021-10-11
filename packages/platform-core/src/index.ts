import axios from 'axios'
import Handlebars from 'handlebars'
import { get, isFunction, mapValues, isString, isArray, isPlainObject, map, merge, forEach } from 'lodash'
import getPackageVersion from '@jsbits/get-package-version'
import { App } from './types/app'
import { SnapRequest, RequestFnConfig, RequestObjectConfig, Snap } from './types/requests'
// import pkg from '../package.json'

export type { App } from './types/app'

export interface HandlerEventData {
  path: string
  bundle: any
}

export async function handler (app: App, version: string, data: HandlerEventData) {
  const { path, bundle } = data

  const start = Date.now()
  const logger = createLogger('NOTICE', app, version)
  const requester = createRequestFn(app, logger)

  logger('platform__handler_start')

  try {
    const fn = get(app, path)
    if (!isFunction(fn) && fn?.url === undefined) {
      logger('platform__handler_end', {
        duration: Date.now() - start
      })

      return fn
    }

    const result = isFunction(fn)
      ? await fn(createSnap(requester, logger), bundle)
      : await callRequestObject(requester, fn, bundle)

    logger('platform__handler_end', {
      duration: Date.now() - start
    })

    return result
  } catch (err: any) {
    const errorLogger = createLogger('ERROR', app, version)
    errorLogger('platform__handler_end', {
      duration: Date.now() - start
    })

    throw err
  }
}

export async function callRequestObject (requester: SnapRequest, config: RequestObjectConfig, data: Record<string, any> = {}) {
  const { transformResponse, ...otherConfig } = config
  const mappedConfig = handlebarsValue(otherConfig, data) as RequestFnConfig

  // Transform object values
  const resp = await requester(mappedConfig)

  if (!transformResponse) return resp

  // TODO: perform transform
  return resp
}

export function createRequestFn (app: App, logger: Console['log']): SnapRequest {
  // Generate the before processors
  const befores = app.before
  const beforeConfig: Partial<RequestFnConfig> = {}
  if (befores) {
    forEach(befores, (beforeFn) => {
      merge(beforeConfig, beforeFn(beforeConfig))
    })
  }

  return async function createRequestFn (requestConfig: RequestFnConfig) {
    logger('platform__request', { request: requestConfig })

    const { data, body, ...rest } = requestConfig
    const res = await axios(merge({}, beforeConfig, {
      data: data || body,
      ...rest
    }))

    logger('platform__request_response', { request: requestConfig, response: res })

    return res
  }
}

export function createLogger (severity: string, app: App, version: string) {
  const globalLogFields: Record<string, string> = {}

  return function logger (message: any, ...params: any[]) {
    const entry = {
      severity,
      message,
      params,
      appId: app?.id,
      version,
      platformVersion: getPackageVersion(),
      ...globalLogFields
    }

    console.log(JSON.stringify(entry))
  }
}

export function createSnap (requester: SnapRequest, logger: Console['log']): Snap {
  return {
    log: logger,
    request: requester
  }
}

export function handlebarsValue (value: any, data: any): any {
  if (isPlainObject(value)) return mapValues(value, handlebarsValue)
  if (isArray(value)) return map(value, handlebarsValue)
  if (isString(value)) return Handlebars.compile(value)(data)
  return value
}
