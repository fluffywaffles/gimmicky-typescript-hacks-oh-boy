import * as Fallible from './fallible'

/*
 * incorrigible cleverness lies hidden here
 * avert your eyes
 */

// legal types for K in index types like: { [k in K]: any }
type Key = (keyof any)

// type map from runtime representations of a type to actual type
type TypeRepresentationToTypeMap<
  // given a set of runtime representations of types...
  Representations extends Key = Key,
  // ... map every representation to a type at least as specific as any
  TypesForRepresentations
    extends { [Repr in Representations]: any }
          = { [Repr in Representations]: any },
> = (TypesForRepresentations)

// optional additional parse function parameters on a per-case basis
type TypeRepresentationPairToParserParametersMap<
  // map any pair of representations to optional extra parameters
  ParserParametersForRepresentationPairs
    extends { [A in Key]?: { [B in Key]?: any[] } }
          = { [A in Key]?: { [B in Key]?: any[] } },
> = (ParserParametersForRepresentationPairs)

/*
 * Double-duty type constructor and base constraint for configuring a set
 * of type representations and a mapping from representation to type.
 *
 * type  MyCustomType = {...}
 * const MyCustomTypeSymbol = Symbol.for('my custom type')
 * class MyClass {}
 * ParserConfiguration<{
 *   TypeRepresentation: (
 *     | 'string'
 *     | 'number'
 *     | 'MyClass'
 *     | (typeof MyCustomTypeSymbol)
 *   ),
 *   RepresentationToTypeMap: {
 *     'string': string,
 *     'number': number,
 *     'MyClass': MyClass,
 *     [MyCustomTypeSymbol]: MyCustomType,
 *   },
 * }>
 *
 * constrains RepresentationToTypeMap so that it must provide a type for
 * every case in TypeRepresentation, then returns both input types.
 */
type ParserConfiguration<
  Configuration extends {
    Types             : TypeRepresentationToTypeMap,
    ParserParameters? : TypeRepresentationPairToParserParametersMap,
  } = {
    Types             : TypeRepresentationToTypeMap<Key>,
    ParserParameters? : TypeRepresentationPairToParserParametersMap<{}>,
  },
> = (Configuration)

type ParametersForParser<
  Pair extends [ keyof Configuration['Types'], keyof Configuration['Types'] ],
  Configuration extends ParserConfiguration,
  A extends Pair[0] = Pair[0],
  B extends Pair[1] = Pair[1],
> = (
  A extends keyof Configuration['ParserParameters']
    ? B extends keyof Configuration['ParserParameters'][A]
      ? Configuration['ParserParameters'][A][B] extends any[]
        ? Configuration['ParserParameters'][A][B]
        : []
      : []
    : []
)

/*
 * s'up
 */
type ExhaustiveParserCases<Configuration extends ParserConfiguration> = (
  {
    // for all parseable types A...
    [A in keyof Configuration['Types']]: {
      // and for all parseable types B...
      [B in keyof Configuration['Types']]: (
        // must provide a function from A -> B
        (
          value  : Configuration['Types'][A],
          // which may have additional parameters if configured
          ...rest: (ParametersForParser<[ A, B ], Configuration>)
        ) => (
          // and which may return a Fallible.Outcome.Of<B> or Just B
          Fallible.Outcome.OrJust<Configuration['Types'][B]>
        )
      )
    }
  }
)

/*
 * this is just here for the shock value
 */
type Values<Target> = Target[keyof Target]
function makeParser<Configuration extends ParserConfiguration>(
  { cases, getRepresentation }: {
    cases             : ExhaustiveParserCases<Configuration>,
    getRepresentation : (value : Values<Configuration['Types']>) => (
      keyof Configuration['Types']
    ),
  },
) {
  return function parse<
    // source, desired type representations inferred from parameters
    SourceRepr  extends keyof Configuration['Types'],
    DesiredRepr extends keyof Configuration['Types'],
  >(
    value           : Configuration['Types'][SourceRepr]|undefined,
    desiredTypeRepr : DesiredRepr,
    ...restParams   : ParametersForParser<[ SourceRepr, DesiredRepr ], Configuration>
  ): (
    Fallible.Outcome<{
      Success: Configuration['Types'][DesiredRepr],
      Failure: any,
    }>
  ) {
    if (!value) {
      return Fallible.Outcome.Of.Failure(null)
    }
    /* We know that value is of SourceType and we know that typeof value
     * is SourceRepr, we just have to tell the compiler. In other words:
     * this is a safe, checked cast.
     */
    const sourceTypeRepr = getRepresentation(value) as SourceRepr
    /*
     * Succeed with the parsed result
     */
    const parser = cases[sourceTypeRepr][desiredTypeRepr]
    const result = parser(value, ...restParams)
    return Fallible.Outcome.OrJust.EnsureWrapped(result)
  }
}

// boilerplate runtime constants, this is as good a place for them as any
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
type RuntimeTypeOf =
  | 'bigint'
  | 'number'
  | 'object'
  | 'string'
  | 'symbol'
  | 'boolean'
  | 'function'
  | 'undefined'

type RuntimeTypeOfToTypeMap = TypeRepresentationToTypeMap<RuntimeTypeOf, {
  'bigint': bigint,
  'number': number,
  'object': object,
  'string': string,
  'symbol': symbol,
  'boolean': boolean,
  'function': () => {},
  'undefined': undefined,
}>

export type {
  // type constants for 'typeof'-based parsers
  RuntimeTypeOf,
  RuntimeTypeOfToTypeMap,
  // generic parser configuration types
  ExhaustiveParserCases,
  TypeRepresentationToTypeMap,
  ParserConfiguration as Configuration,
}

export {
  // the magic goods
  makeParser as make,
}
