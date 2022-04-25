import * as Fallible from './fallible'

type X = Fallible.Outcome.OrJust<number, null>
type O = Fallible.Outcome.OrJust.Extract.Outcome<X>
type S = Fallible.Outcome.OrJust.Extract.Success<X>

const v1: Fallible.Outcome.OrJust<number, null> = 5
const v2: Fallible.Outcome.OrJust<number, null> = Fallible.Outcome.Of.Success(5)
const v3: Fallible.Outcome.OrJust<number, null> = Fallible.Outcome.Of.Failure(null)
if (Fallible.Outcome.OrJust.isJust(v1)) { v1 }
if (Fallible.Outcome.OrJust.isJust(v2)) { v2 }
if (Fallible.Outcome.OrJust.isOutcome(v1)) { v1 }
if (Fallible.Outcome.OrJust.isOutcome(v2)) { v2 }
if (Fallible.Outcome.OrJust.isOutcome(v3)) { v3 }
const v4: Fallible.Outcome.OrJust<number> = Fallible.Outcome.Of.Success(5)
function z(v4: Fallible.Outcome.OrJust<number>) {
  if (Fallible.Outcome.OrJust.isOutcome(v4)) {
    v4
  }
}

const v5 = Fallible.Outcome.OrJust.EnsureWrapped(v1)

