import { AxiosResponse } from 'axios'

export function retryAfterSeconds (response: AxiosResponse) {
  if (!response?.headers) return null

  const retryAfter = response.headers['retry-after']
  if (retryAfter === null || retryAfter === undefined) return null

  const nval = Number(retryAfter)
  if (Number.isFinite(nval)) return nval

  const retryDateMS = Date.parse(retryAfter)
  if (Number.isNaN(retryDateMS)) return null

  const deltaMS = retryDateMS - Date.now()
  return (deltaMS > 0) ? Math.ceil(deltaMS / 1000) : 1
}
