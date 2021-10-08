import axios from 'axios'
import Handlebars from 'handlebars'
import type { Request, Response } from 'express'
import { get, isFunction, mapValues, isString, isArray, isPlainObject, map, merge, forEach } from 'lodash'
import { App } from './types/app'
import { SnapRequest, RequestFnConfig, RequestObjectConfig, Snap } from './types/requests'
import pkg from '../package.json'

export type { App } from './types/app'

const PROJECT_ID = process.env.PROJECT_ID ?? 'snapboard-prod'

export async function handler (req: Request, res: Response, app: App, version: string) {
  const { path, bundle } = req.body

  const start = Date.now()
  const logger = createLogger('NOTICE', app, version, req)
  const requester = createRequestFn(app, logger)

  logger('platform__handler_start')

  try {
    const fn = get(app, path)
    if (!isFunction(fn) && fn?.url === undefined) {
      throw new Error('Path is not a fn')
    }

    const result = isFunction(fn)
      ? await fn(createSnap(requester, logger), bundle)
      : await callRequestObject(requester, fn, bundle)

    res.status(200).send(result)

    logger('platform__handler_end', {
      duration: Date.now() - start
    })
  } catch (err: any) {
    res.status(500).send({
      error: {
        code: err?.code,
        reason: err?.reason,
        message: err?.message
      }
    })

    const errorLogger = createLogger('ERROR', app, version, req)
    errorLogger('platform__handler_end', {
      duration: Date.now() - start
    })
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

export function createLogger (severity: string, app: App, version: string, req: Request) {
  const globalLogFields: Record<string, string> = {}

  if (typeof req !== 'undefined') {
    const traceHeader = req.header('X-Cloud-Trace-Context')
    if (traceHeader && PROJECT_ID) {
      const [trace] = traceHeader.split('/')
      globalLogFields[
        'logging.googleapis.com/trace'
      ] = `projects/${PROJECT_ID}/traces/${trace}`
    }
  }

  return function logger (message: any, ...params: any[]) {
    const entry = {
      severity,
      message,
      params,
      appId: app?.id,
      version,
      platformVersion: pkg.version,
      ...globalLogFields
    }

    console.log(entry)
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
