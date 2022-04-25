/*
 * type MyOutcome = Outcome<{
 *   Success: MySuccessResult,
 *   Failure: MyFailureResult,
 * }>
 */
export type Outcome<Configuration extends {
  Success: any,
  Failure: any,
}> = Outcome.Generic<
  Configuration['Success'],
  Configuration['Failure']
>
/*
 * module namespace for `Fallible.Outcome`s
 */
namespace Outcome {
  /*
   * Outcome.Generic          -> types all possible outcomes
   * Outcome.Generic<S>       -> types any outcome that can succeed with S
   * Outcome.Generic<any, F>  -> types any outcome that can fail    with F
   * Outcome.Generic<S, F>    -> types a fully-instantiated Outcome type
   *
   * particularly useful as `extends` constraints in generics.
   */
  export type Generic<Success = any, Failure = any> = (
    | Outcome.Of.Success<Success>
    | Outcome.Of.Failure<Failure>
  )
  /*
   * shorthand
   * Outcome.Of<S, F> <=> Outcome<{ Success: S, Failure: F }>
   */
  export type Of<Success, Failure> = Outcome.Generic<Success, Failure>
  /*
   * parallel type and value constructors for Outcome cases
   *
   * Outcome.Of.Success<S> -> success case type for Outcome.Of<S, any>
   * Outcome.Of.Failure<F> -> failure case type for Outcome.Of<any, F>
   *
   * Outcome.Of.Success(s) -> success case for Outcome.Of<(typeof s), any>
   * Outcome.Of.Failure(f) -> failure case for Outcome.Of<any, (typeof f)>
   */
  export namespace Of {
    export type Success<Success> = ([ true,  Success ])
    export type Failure<Failure> = ([ false, Failure ])
    export const Success = <S>(value: S): Success<S> => [ true,  value ]
    export const Failure = <F>(value: F): Failure<F> => [ false, value ]
  }
  /*
   * Outcome.Extract types extract interesting component types from an
   * Outcome, such as the wrapped Success and Failure types from the
   * different outcome cases.
   */
  export namespace Extract {
    /*
     * Outcome.Extract.Success<O extends Outcome<S     >> -> S
     */
    export type Success<Outcome extends Outcome.Generic> = (
      Extract<Outcome, [ true, any ]>[1]
    )
    /*
     * Outcome.Extract.Failure<O extends Outcome<any, F>> -> F
     */
    export type Failure<Outcome extends Outcome.Generic> = (
      Extract<Outcome, [ false, any ]>[1]
    )
  }
  export type OrJust<Success = any, Failure = any> = (
    | Success
    | Outcome.Of<Success, Failure>
  )
  /*
   * Outcome.must(outcome)
   * unwraps Success value or throws if failed
   */
  export function must<Outcome extends Outcome.Generic>(outcome: Outcome): Outcome.Extract.Success<Outcome> {
    if (outcome[0]) {
      return outcome[1]
    }
    throw new Error(`Fallible.must(..): outcome was unexpected failure!`)
  }
}

export {
  Outcome,
}
