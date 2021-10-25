import { Input } from './inputs'
import { Column } from './column'
import { AppAuthData } from './authdata'
import { Snap, Bundle } from './requests'

export interface AppResourceBase {
  /**
   * A unique ID across all provider importers. Should be prefixed with providerId.
   */
  id: string

  /**
   * A friendly name that the user will see if they manually use importer
   */
  name: string

  /**
   * A friendly desc that the user will see if they manually use importer
   */
  desc: string

  /**
   * Show info message to user, don't over use this. Only add this if the
   * message is really important.
   */
  info?: string

  /**
   * A list of inputs used to configure how data is obtained from the endpoint
   */
  inputs?: Input[]

  /**
   * This should be based on the rate limit set by the app provider.
   */
  maxFrequency?: string

  /**
   * The default frequency for the importer
   */
  defaultFrequency?: string

  /**
   * ID field, used to identify existing records.
   * @default id
   */
  primaryKey?: string

  /**
   * Display name shown to the user
   * @default title
   */
  titleKey?: string

  /**
   * Whether the importer returns custom data.
   * @default none
   */
  custom?: 'none'|'partial'|'full'

  /**
   * List of additional scopes (beyond defined in the auth section),
   * required for this auth
   */
  additionalScopes?: string[]

  /**
   * Key/value list of columns and their types
   */
  columns: Record<string, Column>

  /**
   * Determines visbility of the importer
   * @default below
   */
  visibility: 'hidden'|'below'|'above'
}

export interface AppResource<AuthData=AppAuthData, InputData=any, C=any> extends AppResourceBase {
  /**
   * A set of fields to ignore when discovering new fields for an API
   */
  ignore?: string[]

  /**
   * The handler function is called every time an update is requested
   * (either forcefully by the user or after a time interval) - this
   * can be up to every minute. Any error you throw here will be displayed
   * to the user.
   */
  handler: AppResourceHandler<AuthData, InputData, C>

  testInput?: InputData
}

export type AppResourceHandler<AuthData, InputData=any, C=any> = (s: Snap, params: Bundle<AuthData, InputData, C>) => Promise<AppResourceHandlerResponse>

export interface AppResourceHandlerResponse<C=any> {
  /**
   * Data to be set - can be new or update
   */
  data: any[]

  /**
   * If true, another call to the handler will be scheduled in a few seconds
   * time so the remaining dataset can be fetched.
   */
  hasMore?: boolean

  /**
   * A unix timestamp (milliseconds) that schedules the time for the next handler call.
   */
  reschedule?: number

  /**
   * This value will be passed to the next call of handler as `cursor` prop. This is used for
   * partial updates (allowing for only changes to be retrieved for each sync cycle).
   * Cursor/partial updates should only be used when:
   *   - Data cannot be deleted
   *   - Data cannot be updated or API identifies updated records (and allows filtering for updates)
   *   - API identifies new records (and allows filtering for them)
   */
  cursor?: C

  /**
   * Overide the default primary key.
   */
  primaryKey?: string
}
