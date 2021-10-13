import axios from 'axios'
import Handlebars from 'handlebars'
import qs from 'qs'
import { get, isFunction, mapValues, isString, isArray, isPlainObject, map, merge, forEach, some, isObjectLike } from 'lodash'
// import safeJsonStringify from 'safe-json-stringify'
import path from 'path'
import fs from 'fs'
import { App } from './types/app'
import { SnapRequest, RequestFnConfig, RequestObjectConfig, Snap, Bundle } from './types/requests'

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json')).toString('utf-8'))

export interface HandlerEventData {
  type?: 'request'|'call'
  path: string
  bundle: any
}

export async function handler (app: App, version: string, data: HandlerEventData) {
  const { type, path, bundle } = data

  const start = Date.now()
  const logger = createLogger('NOTICE', app, version)

  logger('platform__handler_start', { type, path, bundle })

  try {
    const val = get(app, path)
    let res = null

    if (val === undefined || val === null) {
      return null
    } else if (isFunction(val)) {
      res = await val(createSnap(createRequestFn(app, logger, bundle), logger), bundle)
    } else if (type === 'request' && isPlainObject(val) && val?.url) {
      res = await callRequestObject(createRequestFn(app, logger, bundle), val, getData(data))
    } else if (type === 'call') {
      res = handlebarsValue(val, getData(data))
    }

    logger('platform__handler_end', {
      duration: Date.now() - start
    })

    return res
  } catch (err: any) {
    const errorLogger = createLogger('ERROR', app, version)
    errorLogger('platform__handler_end', {
      duration: Date.now() - start
    })

    throw err
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
    const snap: Snap = { log: logger }
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

    let res = await axios(config)
    const { status, data } = res

    logger('platform__request_response', { request: config, response: { status, data } })

    if (app.afterResponse) {
      forEach(app.afterResponse, (afterFn) => {
        res = afterFn(res, snap, bundle)
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

export function createSnap (requester: SnapRequest, logger: Console['log']): Snap {
  return {
    log: logger,
    request: requester
  }
}

export function handlebarsValue (value: any, data: any): any {
  if (isPlainObject(value)) return mapValues(value, (v) => handlebarsValue(v, data))
  if (isArray(value)) return map(value, (v) => handlebarsValue(v, data))
  if (isString(value)) return Handlebars.compile(value)(data)
  return value
}
