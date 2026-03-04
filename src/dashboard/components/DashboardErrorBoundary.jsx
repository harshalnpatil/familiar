import React from 'react'

export function DashboardErrorBoundary({ children }) {
  return (
    <DashboardErrorBoundaryInner children={children} />
  )
}

class DashboardErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: 'unknown error', stack: '' }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error && typeof error.message === 'string' ? error.message : 'unknown error',
      stack: error && typeof error.stack === 'string' ? error.stack : ''
    }
  }

  componentDidCatch(error, info) {
    console.error('React dashboard render error', error, info)
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }
    return (
      <div className="react-fallback">
        <h1>Familiar</h1>
        <p>Unable to initialize the React dashboard.</p>
        <p>{toDisplayText(this.state.message)}</p>
      </div>
    )
  }
}

function toDisplayText(value) {
  if (typeof value === 'string') {
    return value
  }
  return ''
}
