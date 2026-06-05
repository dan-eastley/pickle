// VITE_ prefixed env vars are baked into the client build by Vite.
// Add VITE_GITHUB_OWNER and VITE_GITHUB_REPO as environment variables in
// Vercel (alongside the server-side GITHUB_OWNER / GITHUB_REPO used by the API).

const OWNER = import.meta.env.VITE_GITHUB_OWNER
const REPO  = import.meta.env.VITE_GITHUB_REPO

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-auto px-6 py-3 flex items-center gap-4">
      <span className="text-xs text-gray-400 font-mono">
        {OWNER && REPO
          ? `${OWNER} / ${REPO}`
          : 'VITE_GITHUB_OWNER / VITE_GITHUB_REPO not set'}
      </span>
    </footer>
  )
}
