import { AppAuth } from './auth'
import { RequestFnConfig } from './requests'
import { AppResource } from './resource'

export type AppCategories = 'social'|'developer'|'payment-processor'|'popular'|'database'|'collaberation'|'files'|'websites'|'analytics'|'forms'|'email'|'marketing'|'productivity'|'project-management'|'events'|'misc'

export interface AppBase {
  id: string
  visibility?: 'hidden'|'above'
  color?: string
  /**
   * Some providers can be logically grouped - e.g. googlesheets and googleanalytics can
   * be grouped as google
   */
  parentAppId?: string
  isParentProvider?: boolean
  name: string
  tagline: string
  beta?: boolean
  unpublished?: boolean
  desc: string
  domain: string | null
  categories: AppCategories[]
  premium?: boolean
  before: Array<(config: Partial<RequestFnConfig>) => RequestFnConfig>
}

export interface App<AT = any> extends AppBase {
  auth?: AppAuth<AT>
  resources?: Record<string, AppResource<AT>>
  testAccount?: Omit<AT, 'type'>
  testLogin?: {
    username: string
    password: string
    url?: string
  }
}
