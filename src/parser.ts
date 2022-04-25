import * as Fallible from './fallible'

// generic-unused-types {{{
// shhhhhhhh
type DeepPartial<
  Type,
  Options extends { Depth: 1|2|3|4|5|6|7|8|9 } = { Depth: 1 },
> = (
  Type extends object ? (
      Options['Depth'] extends 9 ? { [k in keyof Type]?: DeepPartial<Type[k], { Depth: 8 }> } // stop
    : Options['Depth'] extends 8 ? { [k in keyof Type]?: DeepPartial<Type[k], { Depth: 7 }> } // looking
    : Options['Depth'] extends 7 ? { [k in keyof Type]?: DeepPartial<Type[k], { Depth: 6 }> } // so
    : Options['Depth'] extends 6 ? { [k in keyof Type]?: DeepPartial<Type[k], { Depth: 5 }> } // closely
    : Options['Depth'] extends 5 ? { [k in keyof Type]?: DeepPartial<Type[k], { Depth: 4 }> } // you
    : Options['Depth'] extends 4 ? { [k in keyof Type]?: DeepPartial<Type[k], { Depth: 3 }> } // should
    : Options['Depth'] extends 3 ? { [k in keyof Type]?: DeepPartial<Type[k], { Depth: 2 }> } // see
    : Options['Depth'] extends 2 ? { [k in keyof Type]?: DeepPartial<Type[k], { Depth: 1 }> } // C#
    : Options['Depth'] extends 1 ? { [k in keyof Type]?: Type[k] }
    : never
  ) : Type
)

// get the type of a path in a target type
type Get<
  Path extends Key[],
  Target,
  Options extends { Default: any, Debug: boolean } = { Default: never, Debug: false },
> = (
  // if the next key in path is a key of our target...
  Path extends [ keyof Target, ...infer Remainder ]
    // ... and our Remainder is not empty...
    ? Remainder extends Key[]
      // ... then go deeper
      ? Get< Remainder , Target[Path[0]], Options>
      // ... otherwise, just get the next key in our target
      : Target[Path[0]]
    // ... but if our next key was not present
    : Options['Debug'] extends false
      // ... and we did not turn on debugging, return the Default type
      ? Options['Default']
      // ... but if we did turn on debugging, dump some context
      : ({
          Error : 'next key of path is not present',
          Target: Target,
          Path  : Path,
        })
)

// get the values for all keys of an object
type Values<Target> = Target[keyof Target]
// }}}

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
        // if we specified ParserParameters for that parse function...
        A extends keyof Configuration['ParserParameters']
          ? B extends keyof Configuration['ParserParameters'][A]
            // then expect optional additional parameters accordingly
            // (for some reason the compiler makes us write this?)
            ? Configuration['ParserParameters'][A][B] extends any[]
              ? (
                  value  : Configuration['Types'][A],
                  ...rest: Configuration['ParserParameters'][A][B]
                ) => (Configuration['Types'][B])
          // otherwise, it's just a simple fn A -> B
          : (value: Configuration['Types'][A]) => (Configuration['Types'][B])
          : (value: Configuration['Types'][A]) => (Configuration['Types'][B])
          : (value: Configuration['Types'][A]) => (Configuration['Types'][B])
      )
    }
  }
)

/*
 * this is just here for the shock value
 */
function makeParser<Configuration extends ParserConfiguration>(
  { cases, getRepresentation }: {
    cases             : ExhaustiveParserCases<Configuration>,
    getRepresentation : (value : Values<Configuration['Types']>) => keyof Configuration['Types'],
  },
) {
  return function parse<
    // source, desired type representations inferred from parameters
    SourceRepr  extends keyof Configuration['Types'],
    DesiredRepr extends keyof Configuration['Types'],
  >(
    value           : Configuration['Types'][SourceRepr]|undefined,
    desiredTypeRepr : DesiredRepr,
    ...restParams   : (
      Parameters<ExhaustiveParserCases<Configuration>[SourceRepr][DesiredRepr]> extends (
        [ Configuration['Types'][SourceRepr], ... infer RestParams ]
      )
        ? Partial<RestParams> // all rest params are optional
        : []
    )
  ): (
    Fallible.Outcome<{
      Success: Configuration['Types'][DesiredRepr],
      Failure: null,
    }>
  ) {
    if (!value) {
      return Fallible.Outcome.Of.Failure(null)
    }
    /* We know that value is of SourceType and we know that typeof value
     * is SourceRepr, we just have to tell the compiler. In
     * other words: this is a safe, checked cast.
     */
    const sourceTypeRepr = getRepresentation(value)
    /*
     * If value is defined and it's already our desired type, return it
     */
    if (
      true
      && (sourceTypeRepr in cases)
      && (desiredTypeRepr in cases[sourceTypeRepr])
    ) {
      /*
       * Succeed with the parsed result
       *   NOTE we have to BANG this out since `in` checks are apparently
       *   not smart enough to narrow the type for us in this `if`
       */
      const parser = cases[sourceTypeRepr][desiredTypeRepr]!
      return Fallible.Outcome.Of.Success(parser(value, ...restParams))
    } else {
      /*
       * Otherwise, fail with null
       */
      return Fallible.Outcome.Of.Failure(null)
    }
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
