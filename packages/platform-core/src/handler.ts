import axios, { AxiosResponse } from 'axios'
import Handlebars from 'handlebars'
import qs from 'qs'
import objectPath from 'object-path'
import { isFunction, mapValues, isString, isArray, isPlainObject, map, merge, forEach, some, isObjectLike } from 'lodash'
import path from 'path'
import fs from 'fs'
import { App } from './types/app'
import { SnapRequest, RequestFnConfig, RequestObjectConfig, Snap, Bundle } from './types/requests'
import { createError, SnapError } from '@snapboard/errors'
import { retryAfterSeconds } from './util'

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json')).toString('utf-8'))

export interface HandlerEventData {
  type?: 'request'|'call'
  path: string|string[]
  bundle: any
}

export async function handler (app: App, version: string, data: HandlerEventData) {
  const start = Date.now()

  try {
    const { type, path, bundle } = data

    const logger = createLogger('NOTICE', app, version)

    const requester = createRequestFn(app, logger, bundle)
    const snap = createSnap(logger, requester)

    logger('platform__handler_start', { type, path, bundle })

    const val = objectPath.get(app, path)
    let res = null

    if (val === undefined || val === null) {
      throw createError('not-found')
    } else if (isFunction(val)) {
      res = await callFunctionValue(val, snap, bundle)
    } else if (type === 'request' && isPlainObject(val) && val?.url) {
      res = await callRequestObject(requester, val, getData(data))
    } else if (type === 'call') {
      res = handlebarsValue(val, getData(data))
    }

    logger('platform__handler_end', {
      duration: Date.now() - start
    })

    return {
      data: res,
      error: null
    }
  } catch (err: any) {
    const errorLogger = createLogger('ERROR', app, version)

    errorLogger('platform__handler_end', {
      duration: Date.now() - start
    })

    return {
      data: null,
      error: err instanceof SnapError
        ? err.toJSON()
        : createError('internal', {
          message: err?.message,
          originalError: err
        }).toJSON()
    }
  }
}

export function getData (data: HandlerEventData) {
  return {
    bundle: data.bundle,
    process: {
      env: process.env
    }
  }
}

export async function callFunctionValue (fn: (snap: Snap, bundle: any) => any, snap: Snap, bundle: any) {
  try {
    return fn(snap, bundle)
  } catch (err: any) {
    if (err instanceof SnapError) throw err
    throw createError('apps/internal', { message: err?.message, originalError: err })
  }
}

export async function callRequestObject (requester: SnapRequest, config: RequestObjectConfig, idata: Record<string, any> = {}) {
  const { transformResponse, data, body, ...otherConfig } = config

  const mappedConfig = handlebarsValue({ ...otherConfig, data: data ?? body }, idata) as RequestFnConfig

  // Transform object values
  const resp = await requester(mappedConfig)

  if (!transformResponse) return resp?.data

  // TODO: perform transform
  return resp?.data
}

export function createRequestFn (app: App, logger: Console['log'], bundle: Bundle): SnapRequest {
  // Generate the before processors
  return async function sendRequest (initialConfig: RequestFnConfig) {
    logger('platform__request', { request: initialConfig })

    // Apply the beforeRequest middleware
    let config: Partial<RequestFnConfig> = merge({ headers: {} }, initialConfig)
    const snap: Snap = createSnap(logger)
    if (app.beforeRequest) {
      forEach(app.beforeRequest, (beforeFn) => {
        config = beforeFn(config, snap, bundle)
      })
    }

    // Use body, if no data
    if (!config.data && config.body) config.data = config.body

    // If content type is urlencoded
    if (
      some(config?.headers,
        (value, key) => key.toLowerCase() === 'content-type' && value === 'application/x-www-form-urlencoded'
      ) && (isObjectLike(config.data) || isArray(config.data))) {
      config.data = qs.stringify(config.data)
    }

    let res: AxiosResponse
    let error: any

    try {
      res = await axios(config)
    } catch (err: any) {
      error = err
      if (err.response) {
        res = err.resonse
      } else if (err.request) {
        throw createError('apps/invalid-connection')
      } else {
        throw createError('internal', { message: 'Unable to send axios request' })
      }
    }

    const { status, data } = res

    logger('platform__request_response', { request: config, response: { status, data } })

    if (app.afterResponse) {
      forEach(app.afterResponse, (afterFn) => {
        res = afterFn(res, snap, bundle)
      })
    }

    if (!config.skipThrowForStatus && status > 300) {
      if (status === 429) {
        const retryTimeout = retryAfterSeconds(res)
        throw createError('apps/rate-limit', {
          internal: { retryTimeout },
          data: res.data
        })
      }

      if (status === 403) {
        throw createError('auth/invalid-auth', {
          message: error.message,
          data: res.data
        })
      }

      if (status === 401) {
        throw createError('auth/refresh-required', {
          message: error.message,
          data: res.data
        })
      }

      throw createError('apps/internal', {
        message: error?.message,
        data: res.data
      })
    }

    return res
  }
}

export function createLogger (severity: string, app: App, version: string) {
  const globalLogFields: Record<string, string> = {}
  const platformVersion = pkg?.version

  return function logger (message: any, ...params: any[]) {
    const entry = {
      severity,
      message,
      params,
      appId: app?.id,
      version,
      platformVersion,
      ...globalLogFields
    }

    console.log(JSON.stringify(entry))
  }
}

export function createSnap (logger: Console['log'], requester?: SnapRequest): Snap {
  return {
    log: logger,
    request: requester,
    errors: {
      Error: (message: string, immedieteStop?: boolean) => createError('apps/internal', { message, internal: { immedieteStop } }),
      HaltedError: (message: string) => createError('apps/halted', { message }),
      ExpiredAuthError: (message: string) => createError('auth/invalid-auth', { message }),
      RefreshAuthError: (message: string) => createError('auth/refresh-required', { message }),
      RateLimitError: (message: string, retryTimeout: number) => createError('apps/rate-limit', {
        message,
        internal: { retryTimeout }
      })
    }
  }
}

export function handlebarsValue (value: any, data: any): any {
  if (isPlainObject(value)) return mapValues(value, (v) => handlebarsValue(v, data))
  if (isArray(value)) return map(value, (v) => handlebarsValue(v, data))
  if (isString(value)) return Handlebars.compile(value)(data)
  return value
}
