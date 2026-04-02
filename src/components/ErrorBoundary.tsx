import { Component } from 'react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          color: 'white',
          backgroundColor: '#0a0a0a',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <h1 style={{ color: '#d4af37', marginBottom: '1rem' }}>Erreur de chargement</h1>
          <p style={{ marginBottom: '1rem' }}>Une erreur est survenue. Veuillez rafraîchir la page.</p>
          {this.state.error && (
            <details style={{ marginTop: '1rem', maxWidth: '600px' }}>
              <summary style={{ cursor: 'pointer', color: '#d4af37' }}>Détails de l'erreur</summary>
              <pre style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                overflow: 'auto',
              }}>
                {this.state.error.toString()}
                {this.state.error.stack && (
                  <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
                    {this.state.error.stack}
                  </div>
                )}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#d4af37',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Rafraîchir la page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

