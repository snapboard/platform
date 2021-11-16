import { Input } from './inputs'
import { AppAuthOAuth2Config } from './oauth2'
import { AppRequest, AppFn } from './requests'

export type AppAuth<AT=any> = AppAuthToken<AT> | AppAuthOauth2 | null

export interface AppAuthBase {
  type: 'token'|'oauth2'

  /**
   * Info box will be displayed to the user during auth.
   */
  info?: string
  /**
   * Input fields required to obtain tokens for authentication
   */
  inputs?: Input[]
}

export interface AppAuthBaseWithTest <AT = any> extends AppAuthBase {
  /**
   * Get the user profile and test the connection using the provided token details. If connection
   * is invalid then error should be thrown. Should return user data.
   */
  profile?: AppRequest<AT, any>

  /**
   * Get the label that will be used to name the account
   */
  connectionLabel?: string|AppFn<string>

  /**
   * Get the externalId
   */
  externalId?: string|AppFn<string>
}

export interface AppAuthToken<AT=any> extends AppAuthBaseWithTest<AT> {
  type: 'token'

  /**
   * A key from fields to be used as the externalId (can use dot notation e.g. 'field.subfield').
   * Selected field should provide a unique value for a user account on an app. Sometimes, it doesn't
   * make sense to have an externalId from the input fields - if you don't provide one,
   * we generate a random unique ID instead.
   */
  externalKey?: string

  /**
   * A key from fields to be used as the label displayed to the user (can use dot notation e.g. 'field.subfield').
   * We show the user to help them work out which account the token
   * represents. If you don't provide this, then we will ask the user to "name"
   * their account when they go through the auth process.
   */
  nameKey?: string
}

export interface AppAuthOauth2<AT=any> extends AppAuthBaseWithTest<AT> {
  type: 'oauth2'

  /**
   * Router to be called on OAUTH flow
   */
  oauth2Config: AppAuthOAuth2Config
}
