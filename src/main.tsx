import React from 'react';
import type { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { DesignGallery } from './mockups/DesignGallery';
import './styles.css';
import './mockups/design-gallery.css';

class AppErrorBoundary extends React.Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="aoe-backdrop grid min-h-screen place-items-center p-6 text-stone-100">
          <div className="max-w-xl rounded border border-ember/40 bg-[#100d0a]/90 p-6 shadow-keep">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">AoE2 Coach hit a display error</p>
            <h1 className="mt-2 font-display text-3xl text-parchment">The app recovered instead of going blank.</h1>
            <p className="mt-3 text-sm text-vellum">{this.state.error.message}</p>
            <button className="action mt-5" type="button" onClick={() => window.location.reload()}>
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const showDesignGallery = new URLSearchParams(window.location.search).has('mockups');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      {showDesignGallery ? <DesignGallery /> : <App />}
    </AppErrorBoundary>
  </React.StrictMode>,
);

