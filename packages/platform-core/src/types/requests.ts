import { AxiosPromise, AxiosRequestConfig, Method, AxiosResponse } from 'axios'
import { AppAuthData } from './authdata'
export type { AxiosResponse as Response } from 'axios'

/**
 * Either a fn or request config object
 */
export type AppRequest<R=any, InputData=any> = AppFn<InputData, R>|RequestObjectConfig
export type AppFn<R=any, InputData=any> = (s: Snap, bundle: Bundle<InputData>) => Promise<R>

export interface Bundle<InputData = Record<string, any>, AuthData = AppAuthData> {
  authData: AuthData
  inputData: InputData
  inputDataRaw: { [x: string]: string }
  meta: {
    isBulkRead: boolean
    isFillingDynamicDropdown: boolean
    isLoadingSample: boolean
    isPopulatingDedupe: boolean
    isTestingAuth: boolean
    limit: number
    page: number
  }
  rawRequest?: Partial<{
    url: string
    method: Method
    querystring: string
    headers: { [x: string]: string }
    content: string
  }>
  cleanedRequest?:
  | Partial<{
    url: string
    method: Method
    querystring: { [x: string]: string }
    headers: { [x: string]: string }
    content: { [x: string]: string }
  }>
  | any
  outputData?: any
  subscribeData?: { id: string }
  targetUrl?: string
}

export interface Snap {
  log: Console['log']
  request: SnapRequest
}

export type SnapRequest = (config: RequestFnConfig) => AxiosPromise<AxiosResponse>

export interface RequestFnConfig extends AxiosRequestConfig {
  url: string

  /* Alias for data */
  body?: any
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
