import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { testSupabaseConnection, checkSecurityIssues, getSupabaseDashboardLinks } from '../utils/supabase/diagnostics';
import { projectId } from '../utils/supabase/info';

interface SecurityCheckerProps {
  user: any;
}

export function SecurityChecker({ user }: SecurityCheckerProps) {
  const [loading, setLoading] = useState(false);
  const [connectionResults, setConnectionResults] = useState<any>(null);
  const [securityIssues, setSecurityIssues] = useState<any[]>([]);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  const dashboardLinks = getSupabaseDashboardLinks(projectId);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      console.log('🔍 Running comprehensive diagnostics...');
      
      // Run connection tests
      const connResults = await testSupabaseConnection();
      setConnectionResults(connResults);
      
      // Run security checks
      const secIssues = await checkSecurityIssues();
      setSecurityIssues(secIssues);
      
      setLastCheck(new Date().toLocaleString());
      console.log('✅ Diagnostics complete');
    } catch (error) {
      console.error('❌ Diagnostics failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run diagnostics on mount
    runDiagnostics();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'performance':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Performance Checker
              </CardTitle>
              <CardDescription>
                Monitor your Supabase project's health, security, and performance
              </CardDescription>
            </div>
            <Button
              onClick={runDiagnostics}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
          {lastCheck && (
            <p className="text-xs text-muted-foreground mt-2">
              Last checked: {lastCheck}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Connection Status */}
      {connectionResults && (
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>
              Real-time status of your Supabase services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Credentials */}
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                {connectionResults.credentialsValid ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
                <div>
                  <p className="text-sm font-medium">Credentials</p>
                  <p className="text-xs text-muted-foreground">
                    {connectionResults.credentialsValid ? 'Valid' : 'Invalid'}
                  </p>
                </div>
              </div>

              {/* Network */}
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                {connectionResults.networkConnected ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
                <div>
                  <p className="text-sm font-medium">Network</p>
                  <p className="text-xs text-muted-foreground">
                    {connectionResults.networkConnected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>

              {/* Supabase Project */}
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                {connectionResults.supabaseReachable ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
                <div>
                  <p className="text-sm font-medium">Supabase Project</p>
                  <p className="text-xs text-muted-foreground">
                    {connectionResults.supabaseReachable ? 'Reachable' : 'Unreachable'}
                  </p>
                </div>
              </div>

              {/* Auth Service */}
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                {connectionResults.authServiceWorking ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
                <div>
                  <p className="text-sm font-medium">Auth Service</p>
                  <p className="text-xs text-muted-foreground">
                    {connectionResults.authServiceWorking ? 'Working' : 'Down'}
                  </p>
                </div>
              </div>

              {/* Database */}
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                {connectionResults.databaseWorking ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
                <div>
                  <p className="text-sm font-medium">Database</p>
                  <p className="text-xs text-muted-foreground">
                    {connectionResults.databaseWorking ? 'Accessible' : 'Inaccessible'}
                  </p>
                </div>
              </div>

              {/* Storage */}
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                {connectionResults.storageWorking ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                )}
                <div>
                  <p className="text-sm font-medium">Storage</p>
                  <p className="text-xs text-muted-foreground">
                    {connectionResults.storageWorking ? 'Working' : 'Not checked'}
                  </p>
                </div>
              </div>
            </div>

            {/* Response Time */}
            {connectionResults.responseTime && (
              <div className="mt-4 p-3 bg-secondary rounded-lg">
                <p className="text-sm">
                  <strong>Response Time:</strong> {connectionResults.responseTime}ms
                  {connectionResults.responseTime > 3000 && (
                    <span className="ml-2 text-amber-600">⚠️ Slow response - database may be warming up</span>
                  )}
                </p>
              </div>
            )}

            {/* Error Message */}
            {connectionResults.errorMessage && (
              <Alert className="mt-4 border-destructive bg-destructive/10">
                <AlertDescription className="text-destructive">
                  <strong>Error:</strong> {connectionResults.errorMessage}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security & Performance Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Security & Performance Checklist</CardTitle>
          <CardDescription>
            Review these items in your Supabase dashboard to ensure optimal security and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityIssues.map((issue, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-3 bg-card hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getTypeIcon(issue.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium">{issue.title}</h4>
                        <Badge variant={getSeverityColor(issue.severity) as any}>
                          {issue.severity} priority
                        </Badge>
                        <Badge variant="outline">
                          {issue.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {issue.description}
                      </p>
                      <div className="bg-secondary/50 rounded p-3 border">
                        <p className="text-sm">
                          <strong className="text-foreground">How to fix:</strong>
                          <br />
                          <span className="text-muted-foreground">{issue.fix}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links to Supabase Dashboard</CardTitle>
          <CardDescription>
            Direct links to resolve issues in your Supabase project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open(dashboardLinks.performanceAdvisor, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Performance Advisor
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open(dashboardLinks.securityAdvisor, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Security Advisor
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open(dashboardLinks.database, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Database Tables
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open(dashboardLinks.auth, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Authentication
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open(dashboardLinks.authPolicies, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Auth Policies
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open(dashboardLinks.sqlEditor, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              SQL Editor
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open(dashboardLinks.apiKeys, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              API Settings
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.open(dashboardLinks.overview, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Project Overview
            </Button>
          </div>

          {/* Project Info */}
          <div className="mt-6 p-4 bg-secondary rounded-lg">
            <p className="text-sm">
              <strong>Project ID:</strong>{' '}
              <code className="bg-background px-2 py-1 rounded">{projectId}</code>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Items Summary */}
      <Alert className="border-primary bg-primary/5">
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium text-foreground">
              📋 Recommended Actions:
            </p>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Click "Performance Advisor" above to check for duplicate indexes</li>
              <li>Click "Security Advisor" to review security warnings</li>
              <li>Enable Row Level Security (RLS) on all database tables</li>
              <li>Set up strong password policies in Authentication settings</li>
              <li>Review and test all auth policies before going to production</li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
