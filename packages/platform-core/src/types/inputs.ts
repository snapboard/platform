
export type Input = TextInput | SelectInput | NumberInput | ResourceInput // | JsonInput | CodeInput | CollapseInput | TextAreaInput | ClipboardTextAreaInput
export interface InputBase {
  field: string
  title: string
  caption?: string
  initialValue?: string
  list?: boolean
  required: boolean
}

export interface TextInput extends InputBase {
  type: 'text'
  password?: boolean
  placeholder?: string
}

export interface NumberInput extends InputBase {
  type: 'number'
  placeholder?: string
}

export interface SelectInput extends InputBase {
  type: 'select'
  choices: Array<{ value: string, label: string }>
}

export interface ResourceInput extends InputBase {
  type: 'resource'
  resourceId: string
  inputs?: Record<string, string>
  filters?: Record<string, string>
}
