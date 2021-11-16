export type AppAuthData = AppOAuth2Data|AppTokenAuthData

export interface AppTokenAuthData <AuthInputs = Record<string, any>> extends AppAuthDataBase<AuthInputs> {
  type: 'token'
  inputs: AuthInputs
}

export interface AppOAuth2Data <AuthInputs = Record<string, any>> extends AppAuthDataBase<AuthInputs> {
  type: 'oauth2'
  refreshToken?: string | null
  refresh_token?: string
  accessToken: string
  access_token: string
  profile?: Record<string, any>
}

export interface AppAuthDataBase <AuthInputs> {
  externalId?: string
  inputs?: AuthInputs
}
