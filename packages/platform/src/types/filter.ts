export type Filter = FilterAndOr | FilterComparison
export interface FilterAndOr {
  operator: 'and'|'or'
  left: Filter
  right: Filter
  negate?: boolean
}

export interface FilterComparison {
  operator: FilterComparisonOperators
  columnId: string
  value?: FilterPrimitive
  negate?: boolean
}

export interface FilterBasic extends FilterComparison {
  connector: 'and'|'or'
}

export type FilterComparisonOperators = 'eq'|'gte'|'gt'|'lt'|'lte'|'neq'|'empty'|'notempty'
export type FilterPrimitive = string|number|boolean
