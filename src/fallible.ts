/*
 * A Fallible is a computation that may fail.
 * A Fallible.Outcome represents the success or failure of a computation.
 *
 * Outcome is similar to Result<T, E> from Rust.
 *
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
   * An Outcome.OrJust<T> is either "just" T or an Outcome.Of<T, any>.
   *
   * An OrJust can also also optionally express the failure type of the
   * outcome:
   *
   * Outcome.OrJust<T, F> is either "just" T or an Outcome.Of<T, F>.
   *
   * Using OrJust as a return type allows us to write functions that
   * cannot fail as Fallibles without them needing to wrap their results
   * in a Fallible.Outcome. It also allows those functions to be gradually
   * refactored to express their failures with Fallible.Outcomes in the
   * future, because in reality functions that "cannot fail" eventually
   * realize that they do fail.
   */
  export type OrJust<Success, Failure = any> = (
    OrJust.Generic<Success, Failure>
  )
  export namespace OrJust {
    export type Generic<Success = any, Failure = any> = (
      | Success
      | Outcome.Of<Success, Failure>
    )
    /*
     * OrJust.Extract types extract interesting component types from an
     * OrJust, such as the Outcome type and its component unwrapped
     * Success and Failure types.
     */
    export namespace Extract {
      /*
       * OrJust.Extract.Outcome<OrJust<S, F>> -> Outcome.Of<S, F>
       */
      export type Outcome<Just extends OrJust.Generic> = (
        Extract<Just, Outcome.Generic>
      )
      /*
       * OrJust.Extract.Failure<OrJust<S, F>> -> F
       */
      export type Failure<Just extends OrJust.Generic> = (
        Outcome.Extract.Failure<OrJust.Extract.Outcome<Just>>
      )
      /*
       * OrJust.Extract.Success<OrJust<S, F>> -> S
       */
      export type Success<Just extends OrJust.Generic> = (
        Outcome.Extract.Success<OrJust.Extract.Outcome<Just>>
      )
    }
    /*
     * Type guards narrow an OrJust<Success, Failure> to an
     * Outcome<Success, Failure> or just a Success within if-blocks.
     */
    /*
     * isOutcome(orJust) determines whether an OrJust is an Outcome and
     * not 'just' a success.
     *
     * isOutcome<OrJust<Success, Failure>>(orJust) narrows an OrJust to
     * its Outcome<Success, Failure> case when it is not 'just' a Success.
     */
    export function isOutcome<Just extends OrJust.Generic>(value: Just)
      : value is OrJust.Extract.Outcome<Just>
    {
      return (true
        && value instanceof Array
        && value.length === 2
        && (typeof value[0]) === 'boolean'
      )
    }
    /*
     * isJust(just) determine whether an OrJust is 'just' a Success.
     *
     * isJust<OrJust<Success, Failure>>(just) narrows an OrJust to its
     * 'just' Success case when it is not an Outcome<Success, Failure>.
     */
    export function isJust<Outcome extends Outcome.Generic>(value: Outcome): value is never
    export function isJust<Success>(value: OrJust<Success>): value is Success
    export function isJust(value: OrJust.Generic) {
      return !isOutcome(value)
    }
    /*
     * EnsureWrapped makes sure an OrJust of 'just' a Success is wrapped
     * in an Outcome.Of<Success>.
     */
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
