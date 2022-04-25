import * as Parser from './parser'

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
        switch (precision) {
          case   'int': return parseInt(v)
          case 'float': return parseFloat(v)
        }
      },
    },
  },
})

console.log(parseEnv('1234', 'number', { precision: 'float' }))

export default parseEnv
