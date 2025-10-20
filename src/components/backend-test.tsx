import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import { CheckCircle, XCircle, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

interface TestResult {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
  data?: any;
}

export function BackendTest() {
  const [healthCheck, setHealthCheck] = useState<TestResult>({ status: 'idle', message: '' });
  const [statsCheck, setStatsCheck] = useState<TestResult>({ status: 'idle', message: '' });
  const [eventsCheck, setEventsCheck] = useState<TestResult>({ status: 'idle', message: '' });
  const [dbSetupCheck, setDbSetupCheck] = useState<TestResult>({ status: 'idle', message: '' });

  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c`;

  // Auto-run health check on mount
  useEffect(() => {
    testHealth();
  }, []);

  const getAccessToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const testHealth = async () => {
    setHealthCheck({ status: 'loading', message: 'Testing...' });
    
    try {
      const response = await fetch(`${serverUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setHealthCheck({
          status: 'success',
          message: `Server is healthy! Status: ${data.status}`,
          data
        });
      } else {
        setHealthCheck({
          status: 'error',
          message: `HTTP ${response.status}: ${JSON.stringify(data)}`,
          data
        });
      }
    } catch (error: any) {
      setHealthCheck({
        status: 'error',
        message: `Connection error: ${error.message}. Check if Edge Function is deployed.`,
      });
    }
  };

  const testStats = async () => {
    setStatsCheck({ status: 'loading', message: 'Testing...' });
    
    try {
      const token = await getAccessToken();
      
      if (!token) {
        setStatsCheck({
          status: 'error',
          message: 'Not logged in. Sign in as admin (hello@minglemood.co) first.',
        });
        return;
      }

      const response = await fetch(`${serverUrl}/admin/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatsCheck({
          status: 'success',
          message: 'Admin stats retrieved successfully!',
          data
        });
      } else {
        setStatsCheck({
          status: 'error',
          message: `HTTP ${response.status}: ${JSON.stringify(data)}`,
          data
        });
      }
    } catch (error: any) {
      setStatsCheck({
        status: 'error',
        message: `Error: ${error.message}`,
      });
    }
  };

  const testEvents = async () => {
    setEventsCheck({ status: 'loading', message: 'Testing...' });
    
    try {
      const response = await fetch(`${serverUrl}/events`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setEventsCheck({
          status: 'success',
          message: `Found ${data.events?.length || 0} events`,
          data
        });
      } else {
        setEventsCheck({
          status: 'error',
          message: `HTTP ${response.status}: ${JSON.stringify(data)}`,
          data
        });
      }
    } catch (error: any) {
      setEventsCheck({
        status: 'error',
        message: `Error: ${error.message}`,
      });
    }
  };

  const testDatabaseSetup = async () => {
    setDbSetupCheck({ status: 'loading', message: 'Testing...' });
    
    try {
      const token = await getAccessToken();
      
      if (!token) {
        setDbSetupCheck({
          status: 'error',
          message: 'Not logged in. Sign in as admin first.',
        });
        return;
      }

      const response = await fetch(`${serverUrl}/setup-database`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setDbSetupCheck({
          status: 'success',
          message: 'Database setup completed!',
          data
        });
      } else {
        setDbSetupCheck({
          status: 'error',
          message: `HTTP ${response.status}: ${JSON.stringify(data)}`,
          data
        });
      }
    } catch (error: any) {
      setDbSetupCheck({
        status: 'error',
        message: `Error: ${error.message}`,
      });
    }
  };

  const runAllTests = async () => {
    await testHealth();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testEvents();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testStats();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testDatabaseSetup();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const TestSection = ({ title, result, onTest }: { title: string; result: TestResult; onTest: () => void }) => (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(result.status)}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={onTest}
          disabled={result.status === 'loading'}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
        >
          {result.status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            `Run ${title}`
          )}
        </Button>

        {result.status !== 'idle' && (
          <Alert className={
            result.status === 'success' 
              ? 'bg-green-50 border-green-200' 
              : result.status === 'error'
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
          }>
            <AlertDescription className="font-mono text-sm whitespace-pre-wrap break-all">
              {result.message}
              {result.data && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs opacity-70 hover:opacity-100">
                    View Raw Response
                  </summary>
                  <pre className="mt-2 text-xs bg-white p-2 rounded border">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-10">
          <div className="mb-8">
            <h1 className="text-3xl mb-2">🚀 MingleMood Backend Test</h1>
            <p className="text-gray-600 mb-6">Testing your Supabase Edge Function deployment</p>

            <Alert className="bg-blue-50 border-blue-200 mb-6">
              <AlertDescription>
                <div className="space-y-1">
                  <div><strong>📍 Project ID:</strong> <code className="bg-blue-100 px-2 py-1 rounded text-sm">{projectId}</code></div>
                  <div><strong>🔗 Server URL:</strong> <code className="bg-blue-100 px-2 py-1 rounded text-sm break-all">{serverUrl}</code></div>
                </div>
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-6">
            <TestSection 
              title="Health Check" 
              result={healthCheck} 
              onTest={testHealth}
            />

            <TestSection 
              title="Admin Stats (Requires Login)" 
              result={statsCheck} 
              onTest={testStats}
            />

            <TestSection 
              title="Get Events" 
              result={eventsCheck} 
              onTest={testEvents}
            />

            <TestSection 
              title="Database Setup (Admin Only)" 
              result={dbSetupCheck} 
              onTest={testDatabaseSetup}
            />
          </div>

          <div className="mt-10 pt-6 border-t-2 space-y-4">
            <h3 className="text-lg mb-3">Quick Actions:</h3>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={runAllTests}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                🧪 Run All Tests
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                🏠 Go to Dashboard
              </Button>

              <Button 
                onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}/functions`, '_blank')}
                variant="outline"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                📊 View Edge Functions
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>

              <Button 
                onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}/logs/edge-functions`, '_blank')}
                variant="outline"
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                📜 View Logs
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
