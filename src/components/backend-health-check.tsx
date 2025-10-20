import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function BackendHealthCheck() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [healthData, setHealthData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setStatus('loading');
    setError(null);
    setHealthData(null);

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/health`;
      
      console.log('🔍 Testing backend health:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Health check successful:', data);
      
      setHealthData(data);
      setStatus('success');
    } catch (err: any) {
      console.error('❌ Health check failed:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Backend Health Check</h2>
          <Badge variant={
            status === 'success' ? 'default' : 
            status === 'error' ? 'destructive' : 
            'secondary'
          }>
            {status === 'success' ? '✅ Healthy' : 
             status === 'error' ? '❌ Error' : 
             status === 'loading' ? '⏳ Checking...' :
             '⚪ Not Tested'}
          </Badge>
        </div>

        <Button 
          onClick={checkHealth} 
          disabled={status === 'loading'}
          className="w-full"
        >
          {status === 'loading' ? 'Checking Backend...' : 'Test Backend Connection'}
        </Button>

        {healthData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">✅ Backend is Healthy!</h3>
            <pre className="text-sm text-green-800 overflow-auto">
              {JSON.stringify(healthData, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">❌ Connection Failed</h3>
            <p className="text-sm text-red-800">{error}</p>
            
            <div className="mt-3 p-3 bg-red-100 rounded">
              <p className="text-xs text-red-900 font-semibold mb-1">Troubleshooting:</p>
              <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
                <li>Check that Supabase Edge Function is deployed</li>
                <li>Verify SUPABASE_URL and SUPABASE_ANON_KEY in /utils/supabase/info.tsx</li>
                <li>Check browser console for detailed errors</li>
                <li>Check Supabase Edge Function logs</li>
              </ul>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Backend URL:</strong> https://{projectId}.supabase.co</p>
          <p><strong>Endpoint:</strong> /functions/v1/make-server-4bcc747c/health</p>
        </div>
      </div>
    </Card>
  );
}
