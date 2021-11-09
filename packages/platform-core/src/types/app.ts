import { AxiosResponse } from 'axios'
import { AppAuth } from './auth'
import { RequestFnConfig, BeforeSnap, Bundle } from './requests'
import { AppResource } from './resource'

export type AppCategories = 'social'|'developer'|'payment-processor'|'popular'|'database'|'collaberation'|'files'|'websites'|'analytics'|'forms'|'email'|'marketing'|'productivity'|'project-management'|'events'|'misc'

export interface AppBase {
  id: string
  color?: string
  name: string
  tagline: string
  desc: string
  domain: string | null
  categories: AppCategories[]
}

export interface App<AT = any> extends AppBase {
  beforeRequest?: AppBeforeRequestMiddleware[]
  afterResponse?: AppAfterResponseMiddleware[]
  auth?: AppAuth<AT>
  resources?: Record<string, AppResource<AT>>
}

export type AppBeforeRequestMiddleware = (config: Partial<RequestFnConfig>, s: BeforeSnap, bundle: Bundle) => Partial<RequestFnConfig>
export type AppAfterResponseMiddleware = (response: AxiosResponse, s: BeforeSnap, bundle: Bundle) => AxiosResponse
