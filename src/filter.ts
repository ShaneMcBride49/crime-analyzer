import { gt, gte, lt, lte } from 'ramda'
const notEquals = (a: any, b: any) => a!= b
const equals = (a: any, b: any) => a == b
const operators = {
    '=': equals,
    '>': gt,
    '>=': gte,
    '<': lt,
    '<=': lte,
    '!=': notEquals
} as const

function filter (name: string, value: string, method: keyof typeof operators = '=') {
    const operator = operators[method]
    return (arr: any[]) => arr.filter(i => operator(i[name], value))
}

export default filter
