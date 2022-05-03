import * as Parser from './parser'
import * as Fallible from './fallible'

// now let's make sure we get those environment variables parsed
type EnvParser = Parser.Configuration<{
  Types: (
    Pick<Parser.RuntimeTypeOfToTypeMap, 'string'|'number'>
  ),
  ParserParameters: {
    string: {
      number: [{ precision: 'int'|'float' }],
    },
  },
}>

const parseEnv = Parser.make<EnvParser>({
  getRepresentation(value: string|number) {
    return ((typeof value) as 'string'|'number')
  },
  cases: {
    number: {
      number: v => v,
      string: v => v.toString(),
    },
    string: {
      string: v => v,
      number: (v, { precision } = { precision: 'int' }) => {
        const result = (() => {
          switch (precision) {
            case   'int': return parseInt(v)
            case 'float': return parseFloat(v)
          }
        })()
        if (Number.isNaN(result)) {
          return Fallible.Outcome.Of.Failure(result)
        } else {
          return Fallible.Outcome.Of.Success(result)
        }
      },
    },
  },
})

const parsed = parseEnv('xyz', 'number', { precision: 'float' })
console.log(parsed)
if (Fallible.Outcome.isSuccess(parsed)) {
  parsed
} else {
  parsed
}

export default parseEnv
