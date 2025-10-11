'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class AuthErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[AuthErrorBoundary] Caught error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    // Clear any cached authentication data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('olmocr-supabase-auth-token')
      sessionStorage.clear()
      // Force page reload to reset auth state
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/80">
          <Card className="w-full max-w-md border-2 border-destructive/30">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Authentication Error</CardTitle>
              <CardDescription>
                Something went wrong with the authentication system. This is usually a temporary issue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                <strong>Error:</strong> {this.state.error?.message || 'Unknown authentication error'}
              </div>

              <Button
                className="w-full"
                onClick={this.handleRetry}
                variant="default"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset & Try Again
              </Button>

              <Button
                className="w-full"
                onClick={() => window.location.href = '/sign-in'}
                variant="outline"
              >
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}