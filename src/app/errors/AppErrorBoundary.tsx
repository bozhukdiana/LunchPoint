import { Component, type PropsWithChildren, type ReactNode } from 'react';

type State = { error: Error | null };

export class AppErrorBoundary extends Component<PropsWithChildren, State> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <main className="grid min-h-screen place-items-center bg-slate-50 px-6 py-12 text-slate-900">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              LunchPoint
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-red-700">
              Помилка запуску застосунку
            </h1>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
              {this.state.error.message}
            </p>
            <button
              className="mt-6 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => location.reload()}
              type="button"
            >
              Оновити сторінку
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
