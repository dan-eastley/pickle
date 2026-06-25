// Build a decision/discovery scope object from the scope-selector fields,
// omitting empty levels. Returns null when no domain is chosen (the change
// applies to the whole architecture). Shared by the create modals and the full
// editor pages so the scope shape is defined in exactly one place.
export function buildScope(domain, abstraction, artefact) {
  if (!domain) return null
  return {
    domain,
    ...(abstraction && { abstraction }),
    ...(artefact && { artefact }),
  }
}
