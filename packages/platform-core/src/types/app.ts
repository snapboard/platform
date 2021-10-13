import { AxiosResponse } from 'axios'
import { AppAuth } from './auth'
import { RequestFnConfig, Snap, Bundle } from './requests'
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
  beforeRequest?: Array<(config: Partial<RequestFnConfig>, s: Snap, bundle: Bundle) => RequestFnConfig>
  afterResponse?: Array<(response: AxiosResponse, s: Snap, bundle: Bundle) => any>
  auth?: AppAuth<AT>
  resources?: Record<string, AppResource<AT>>
}
