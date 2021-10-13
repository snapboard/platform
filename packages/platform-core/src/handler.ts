import axios from 'axios'
import Handlebars from 'handlebars'
import { get, isFunction, mapValues, isString, isArray, isPlainObject, map, merge, forEach, isObjectLike } from 'lodash'
import path from 'path'
import fs from 'fs'
import { App } from './types/app'
import { SnapRequest, RequestFnConfig, RequestObjectConfig, Snap } from './types/requests'

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
  const requester = createRequestFn(app, logger)

  logger('platform__handler_start', { type, path, bundle })

  try {
    const val = get(app, path)
    let res = null

    if (val === undefined || val === null) {
      return null
    } else if (isFunction(val)) {
      res = await val(createSnap(requester, logger), bundle)
    } else if (type === 'request' && isPlainObject(val)) {
      res = await callRequestObject(requester, val, getData(data))
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
