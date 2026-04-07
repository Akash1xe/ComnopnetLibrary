import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled React error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#080808] px-6">
          <div className="w-full max-w-lg rounded-3xl border border-[#1e1e1e] bg-[#111] p-8 text-center shadow-2xl">
            <h1 className="text-2xl font-semibold text-white">Something went wrong</h1>
            <p className="mt-3 text-sm text-[#888]">Reload the page to try again.</p>
            {import.meta.env.DEV && this.state.error ? (
              <pre className="mt-6 overflow-auto rounded-2xl bg-[#0a0a0a] p-4 text-left text-xs text-red-300">
                {this.state.error.message}
              </pre>
            ) : null}
            <button
              className="mt-6 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-black"
              onClick={() => window.location.reload()}
              type="button"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
