import Logo from '../ui/Logo'

// Centred card shell shared by the login and registration pages.
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo align="center" size="lg" to="/" />
        </div>

        <div className="bg-white border border-gray-200 shadow-xl p-6 sm:p-8">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-4 text-center text-sm text-gray-500">{footer}</div>}
      </div>
    </div>
  )
}

// Shared labelled input used by both auth forms.
export function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-500 mb-1">{label}</span>
      <input
        className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white disabled:bg-gray-50"
        {...props}
      />
    </label>
  )
}
