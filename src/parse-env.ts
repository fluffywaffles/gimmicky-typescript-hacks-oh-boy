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
        return Fallible.Outcome.Of[
          Number.isNaN(result)
            ? 'Failure'
            : 'Success'
        ](result)
      },
    },
  },
})

console.log(parseEnv('1234', 'number', { precision: 'float' }))

export default parseEnv
