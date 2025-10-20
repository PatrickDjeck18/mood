import React from 'react';
import { AlertCircle, Server, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

export function ServerErrorBanner() {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <Alert className="border-red-300 bg-red-50 mb-6">
      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
      <AlertDescription className="text-red-800">
        <div className="space-y-3">
          <div>
            <strong className="text-base sm:text-lg">⚠️ Server Connection Error</strong>
            <p className="text-sm sm:text-base mt-1">
              Cannot connect to the Supabase Edge Function server. Your backend server needs to be deployed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full sm:w-auto"
            >
              {showDetails ? 'Hide' : 'Show'} Deployment Instructions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto border-red-300 hover:bg-red-100"
            >
              Retry Connection
            </Button>
          </div>

          {showDetails && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-red-200 space-y-3 text-sm">
              <div>
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Why am I seeing this error?
                </h4>
                <p className="text-gray-700">
                  Your MingleMood application requires a Supabase Edge Function server to handle backend operations like:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-600">
                  <li>User authentication and profile management</li>
                  <li>Admin dashboard data</li>
                  <li>Email sending and notifications</li>
                  <li>Event RSVPs and payment processing</li>
                </ul>
              </div>

              <div className="border-t border-red-200 pt-3">
                <h4 className="font-semibold text-red-900 mb-2">🚀 Quick Fix - Deploy Your Server:</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>
                    <strong>Install Supabase CLI:</strong>
                    <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                      brew install supabase/tap/supabase
                    </code>
                  </li>
                  <li>
                    <strong>Login to Supabase:</strong>
                    <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                      supabase login
                    </code>
                  </li>
                  <li>
                    <strong>Link your project:</strong>
                    <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                      supabase link --project-ref YOUR_PROJECT_ID
                    </code>
                  </li>
                  <li>
                    <strong>Deploy the Edge Function:</strong>
                    <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                      supabase functions deploy make-server-4bcc747c
                    </code>
                  </li>
                  <li>
                    <strong>Set environment variables:</strong>
                    <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                      supabase secrets set RESEND_API_KEY=your_key
                    </code>
                  </li>
                </ol>
              </div>

              <div className="border-t border-red-200 pt-3">
                <p className="text-gray-700 mb-2">
                  <strong>📖 Complete deployment guide:</strong>
                </p>
                <p className="text-xs text-gray-600">
                  Check the file <code className="px-2 py-1 bg-gray-100 rounded">SUPABASE_EDGE_FUNCTION_DEPLOY.md</code> in your project root for detailed instructions.
                </p>
              </div>

              <div className="border-t border-red-200 pt-3">
                <p className="text-xs text-gray-500">
                  <strong>💡 Pro Tip:</strong> After deploying, verify your server is working by visiting:
                  <br />
                  <code className="px-2 py-1 bg-gray-100 rounded text-xs mt-1 inline-block">
                    https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-4bcc747c/health
                  </code>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <a
                  href="https://supabase.com/docs/guides/functions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
                >
                  Supabase Edge Functions Docs
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md text-sm transition-colors"
                >
                  Open Supabase Dashboard
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
