// Stage-advance gating for decisions ([DEC-8]).
//
// A transition to proposed/accepted/staged dispatches a workflow that must
// finish before the next stage is valid. Rather than track "did I just click",
// we derive "a workflow is running" from the decision state itself — the section
// the workflow populates hasn't landed yet — so it holds across reloads. While a
// running workflow is returned, the UI replaces the action bar with a running
// box and polls until the output appears.

const hasContent = (x) => (Array.isArray(x) ? x.length > 0 : x != null && x !== '')

// Returns { status, label } when a stage workflow is still in flight, else null.
export function inferRunningWorkflow(decision) {
  if (!decision) return null
  const s = decision.status
  if (s === 'proposed' && !hasContent(decision['challenger-analysis'])) {
    return { status: s, label: 'running the seven analysis streams over your decision' }
  }
  if (s === 'accepted' && !hasContent(decision['architecture-changes'])) {
    return { status: s, label: 'working out the architecture changes' }
  }
  if (s === 'staged' && !hasContent(decision['pr-number'])) {
    return { status: s, label: 'applying the accepted changes and opening the pull request' }
  }
  return null
}
