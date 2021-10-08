
export type Input = TextInput | SelectInput | SwitchInput | NumberInput | PasswordInput | ImporterInput // | JsonInput | CodeInput | CollapseInput | TextAreaInput | ClipboardTextAreaInput
export interface InputBase {
  field: string
  title: string
  caption?: string
  initialValue?: string
  list?: boolean
  required: boolean
  tree?: Input[]
  props?: any
}

export interface TextInput extends InputBase {
  type: 'text'
}

export interface PasswordInput extends InputBase {
  type: 'password'
}

export interface NumberInput extends InputBase {
  type: 'number'
}

export interface SelectInput extends InputBase {
  type: 'select'
}

export interface SwitchInput extends InputBase {
  type: 'switch'
}

export interface ImporterInputProps {
  importerId: string
  inputs?: Record<string, string>
  filters?: Record<string, string>
}

export interface ImporterInput extends InputBase {
  type: 'importer'
  props?: ImporterInputProps
}
