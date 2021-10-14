
export type Input = TextInput | SelectInput | NumberInput | PasswordInput | ResourceInput // | JsonInput | CodeInput | CollapseInput | TextAreaInput | ClipboardTextAreaInput
export interface InputBase {
  field: string
  title: string
  caption?: string
  initialValue?: string
  list?: boolean
  required: boolean
  props?: any
}

export interface TextInput extends InputBase {
  type: 'text'
  props?: {
    placeholder?: string
  }
}

export interface PasswordInput extends InputBase {
  type: 'password'
  props?: {
    placeholder?: string
  }
}

export interface NumberInput extends InputBase {
  type: 'number'
  props?: {
    placeholder?: string
  }
}

export interface SelectInput extends InputBase {
  type: 'select'
  props?: {
    choices: Array<{ value: string, label: string }>
  }
}

export interface ResourceInputProps {
  resourceId: string
  inputs?: Record<string, string>
  filters?: Record<string, string>
}

export interface ResourceInput extends InputBase {
  type: 'resource'
  props?: ResourceInputProps
}
