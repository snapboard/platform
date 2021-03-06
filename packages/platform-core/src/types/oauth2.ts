import { AppRequest } from './requests'

export interface AppAuthOAuth2Config {
  authorizeUrl: AuthorizeUrlResponse
  getAccessToken: AppRequest<AccessTokenResponse, GetAccessTokenInputData>
  refreshAccessToken?: AppRequest<AccessTokenResponse, RefereshAccessTokenInputData>
  scopes?: string[]
  scopesSeperator?: string
  autoRefresh?: boolean
}

export interface AccessTokenResponse {
  accessToken?: string
  access_token?: string
  refreshToken?: string
  refresh_token?: string
}

export interface AuthorizeUrlResponse {
  url: string
  params?: Record<string, string>
}

export interface GetAccessTokenInputData {
  code: string
  redirect_uri: string
  scopes: string
}

export interface RefereshAccessTokenInputData {
  redirect_uri: string
  scopes: string
  refreshToken?: string
  refresh_token?: string
}
