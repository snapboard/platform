import { AppAuth } from './auth'
import { RequestFnConfig } from './requests'
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
  before?: Array<(config: Partial<RequestFnConfig>) => RequestFnConfig>
  auth?: AppAuth<AT>
  resources?: Record<string, AppResource<AT>>
}
