import { login } from './actions'

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 md:px-0">
      <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] w-full max-w-md p-8 md:p-10 shadow-sm">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3 text-[var(--color-foreground)] tracking-tight">Welcome Back</h1>
          <p className="text-[var(--color-muted)] text-sm">
            Sign in with your @srmist.edu.in email to buy and sell on campus.
          </p>
        </div>

        <form className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-[var(--color-muted)]">
              SRM Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              pattern="^[a-zA-Z0-9._%+-]+@srmist\.edu\.in$"
              title="Must be an @srmist.edu.in email address"
              placeholder="ab1234@srmist.edu.in"
              className="px-4 py-3.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors placeholder:text-[var(--color-muted)]"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-[var(--color-muted)]">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="px-4 py-3.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-colors placeholder:text-[var(--color-muted)]"
            />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              formAction={login}
              className="w-full py-4 rounded-xl font-semibold bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-accent)]"
            >
              Sign In
            </button>
          </div>
        </form>

        <div className="mt-10 text-center text-sm text-[var(--color-muted)]">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-[var(--color-foreground)] font-semibold hover:underline">
            Create Account
          </a>
        </div>
      </div>
    </div>
  )
}
