import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Você também pode registrar o erro em um serviço de relatório de erros
    console.error("Caught error in ErrorBoundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // Você pode renderizar qualquer UI de fallback
      return (
        <div className="error-boundary-container p-4 rounded shadow-sm bg-light">
          <h2 className="text-danger">Something went wrong</h2>
          <p>
            We apologize for the inconvenience. Please try refreshing the page
            or navigate back.
          </p>
          <div className="d-flex mt-3">
            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-4">
              <summary className="text-muted">Error Details</summary>
              <pre className="mt-2 p-3 bg-dark text-light rounded">
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
