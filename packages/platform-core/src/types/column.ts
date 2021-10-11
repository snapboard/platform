export interface Column {
  name: string
  type: string
  desc?: string
  example?: any
  list?: boolean
  visibility?: 'above'|'below'|'hidden'

  meta?: {
    dateInSeconds?: boolean
  }

  // ID used to link to another resource
  ref?: {
    resourceId: string
  }
}
