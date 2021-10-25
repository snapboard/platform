import { SnapError } from '@snapboard/errors'
import { AxiosRequestConfig, Method, AxiosResponse } from 'axios'
import { AppAuthData } from './authdata'
import { FilterBasic } from './filter'
export type { AxiosResponse as Response } from 'axios'

/**
 * Either a fn or request config object
 */
export type AppRequest<Response=any, AuthData=any, InputData=any, Cursor=any> = AppFn<Response, AuthData, InputData, Cursor>|RequestObjectConfig
export type AppFn<Response=any, AuthData=any, InputData=any, Cursor=any> = (s: Snap, bundle: Bundle<AuthData, InputData, Cursor>) => Promise<Response>

export interface Bundle<AuthData = AppAuthData, InputData = Record<string, any>, Cursor=any> {
  authData?: AuthData

  /**
   * Will have the inputs requested in the importer config - otherwise is an empty object
   */
  inputData: InputData

  limit?: number

  /**
   * The cursor value returned when the last handler was called (for partial updates).
   * This value remains constant during a sync cycle.
   */
  cursor?: Cursor

  /**
   * A set of key/value filters
   */
  filters?: FilterBasic[]

  /**
   * A basic search (optionally implamented by importer)
   */
  search?: string

  meta?: {
    isFillingDynamicDropdown?: boolean
    isLoadingSample?: boolean
  }

  rawRequest?: Partial<{
    url: string
    method: Method
    querystring: string
    headers: { [x: string]: string }
    content: string
  }>
  cleanedRequest?: Partial<{
    url: string
    method: Method
    querystring: { [x: string]: string }
    headers: { [x: string]: string }
    content: { [x: string]: string }
  }>
}

export interface Snap {
  log: Console['log']
  request?: SnapRequest
  errors: {
    Error: (message: string) => SnapError
    HaltedError: (message: string) => SnapError
    ExpiredAuthError: (message: string) => SnapError
    RefreshAuthError: (message: string) => SnapError
    RateLimitError: (message: string, retryTimeout: number,) => SnapError
  }
}

export type SnapRequest = (config: RequestFnConfig) => Promise<AxiosResponse>

export interface RequestFnConfig extends AxiosRequestConfig {
  url: string

  /** Alias for data */
  body?: any

  /** Do not automatically throw errors based on status code */
  skipThrowForStatus?: boolean
}

export interface RequestObjectConfig extends Omit<
AxiosRequestConfig,
'transformRequest'|
'transformResponse'|
'paramsSerializer' |
'onUploadProgress' |
'onDownloadProgress' |
'responseType' |
'validateStatus' |
'httpAgent' |
'httpsAgent' |
'cancelToken' |
'adapter'
> {
  url: string

  /* Alias for data */
  body?: any

  /*
  Transforms the response values using interpolation. For example,
  if the response value is:

  {
    access_token: 'abc...'
  }

  You can use transformResponse to map the response value to the
  correct expected output:

  {
    accessToken: '{{ access_token }}'
  }

  */
  transformResponse?: Record<string, string>
}
