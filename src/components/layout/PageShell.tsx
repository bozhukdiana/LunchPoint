import type { PropsWithChildren } from 'react'

interface PageShellProps extends PropsWithChildren {
  title: string
}

export const PageShell = ({ title, children }: PageShellProps) => (
  <main className="page-shell">
    <section className="card">
      <h1>{title}</h1>
      {children}
    </section>
  </main>
)
