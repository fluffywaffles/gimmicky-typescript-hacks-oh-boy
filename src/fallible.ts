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
   * Outcome, such as the unwrapped Success and Failure types from the
   * different outcome cases.
   */
  export namespace Extract {
    /*
     * Outcome.Extract.Success<O extends Outcome<S     >> -> S
     */
    export type Success<Outcome extends Outcome.Generic> = (
      Outcome.Case.Success<Outcome>[1]
    )
    /*
     * Outcome.Extract.Failure<O extends Outcome<any, F>> -> F
     */
    export type Failure<Outcome extends Outcome.Generic> = (
      Outcome.Case.Failure<Outcome>[1]
    )
  }
  /*
   * Outcome.Case selects individual cases out of an Outcome, namely the
   * wrapped up Success and Failure cases.
   */
  export namespace Case {
    /*
     * Outcome.Case.Success<O extends Outcome<S, F>> -> Outcome.Of.Success<S>
     */
    export type Success<Outcome extends Outcome.Generic> = (
      Extract<Outcome, [ true, any ]>
    )
    /*
     * Outcome.Case.Failure<O extends Outcome<S, F>> -> Outcome.Of.Failure<F>
     */
    export type Failure<Outcome extends Outcome.Generic> = (
      Extract<Outcome, [ false, any ]>
    )
  }
  /*
   * Type guards narrow an outcome to success or failure within if-blocks.
   */
  /*
   * isSuccess(outcome) narrows an outcome to its success case.
   *
   * for example:
   *   if (isSuccess(outcome)) { // outcome is Outcome.Of<S, F>
   *     outcome // outcome is Outcome.Of.Success<S>
   *   } else {
   *     outcome // outcome is Outcome.Of.Failure<F>
   *   }
   */
  export function isSuccess<Outcome extends Outcome.Generic>
    (outcome: Outcome)
    : outcome is Outcome.Case.Success<Outcome>
  {
    return outcome[0] === true
  }
  /*
   * isFailure(outcome) narrows an outcome to its failure case.
   * (Dual of isSuccess(outcome))
   *
   */
  export function isFailure<Outcome extends Outcome.Generic>
    (outcome: Outcome)
    : outcome is Outcome.Case.Failure<Outcome>
  {
    return !isSuccess(outcome)
  }
  /*
   * 'Just' types
   */
  export type OrJust<Success, Failure = any> = (
    OrJust.Generic<Success, Failure>
  )
  export namespace OrJust {
    export type Generic<Success = any, Failure = any> = (
      | Success
      | Outcome.Of<Success, Failure>
    )
    // helpers
    export namespace Extract {
      export type Outcome<Just extends OrJust.Generic> = (
        Extract<Just, Outcome.Generic>
      )
      export type Failure<Just extends OrJust.Generic> = (
        Outcome.Extract.Failure<OrJust.Extract.Outcome<Just>>
      )
      export type Success<Just extends OrJust.Generic> = (
        Outcome.Extract.Success<OrJust.Extract.Outcome<Just>>
      )
    }
    // type transformer, no-op
    export function Of<Just extends OrJust.Generic>(value: Just): Just {
      return value
    }
    // determine whether an OrJust is an Outcome and not 'just' a Success
    export function isOutcome<Just extends OrJust.Generic>(value: Just)
      : value is OrJust.Extract.Outcome<Just>
    {
      return (true
        && value instanceof Array
        && value.length === 2
        && (typeof value[0]) === 'boolean'
      )
    }
    // determine whether an OrJust is 'just' a Success
    export function isJust<Outcome extends Outcome.Generic>(value: Outcome): value is never
    export function isJust<Success>(value: OrJust<Success>): value is Success
    export function isJust(value: OrJust.Generic) {
      return !isOutcome(value)
    }
    // given an Outcome.OrJust, wrap just a success in an Outcome
    export function EnsureWrapped<Success, Failure>
      (value: OrJust<Success, Failure>)
      : Outcome.Of<Success, Failure>
    {
      if (OrJust.isOutcome(value)) {
        return value
      } else {
        return Outcome.Of.Success(value)
      }
    }
  }
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
