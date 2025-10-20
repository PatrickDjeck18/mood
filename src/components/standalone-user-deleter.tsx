import React, { useState } from 'react';
import { Trash2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';

export function StandaloneUserDeleter() {
  const [emailToDelete, setEmailToDelete] = useState('stevonne408@hotmail.com');
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const deleteUserDirectly = async () => {
    if (!emailToDelete) {
      setMessage({ type: 'error', text: 'Please enter an email address' });
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete the account for ${emailToDelete}?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      setMessage(null);
      setDebugInfo('');

      console.log('🔑 Getting authentication session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        throw new Error('Not authenticated. Please log in as admin first.');
      }

      console.log('✅ Session found, user:', session.user.email);
      setDebugInfo(prev => prev + `\n✅ Authenticated as: ${session.user.email}`);

      // Check if user is admin
      if (session.user.email !== 'hello@minglemood.co') {
        throw new Error(`You must be logged in as hello@minglemood.co to delete users. Currently logged in as: ${session.user.email}`);
      }

      setDebugInfo(prev => prev + `\n🔑 Admin verified`);
      console.log('🗑️ Attempting to delete user:', emailToDelete);

      const deleteUrl = `https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/admin/users/${encodeURIComponent(emailToDelete)}`;
      console.log('📡 DELETE URL:', deleteUrl);
      setDebugInfo(prev => prev + `\n📡 Calling: ${deleteUrl}`);

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);
      setDebugInfo(prev => prev + `\n📡 Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Delete failed:', errorText);
        setDebugInfo(prev => prev + `\n❌ Error response: ${errorText}`);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        throw new Error(errorData.error || `Delete failed with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ User deleted successfully:', result);
      setDebugInfo(prev => prev + `\n✅ User deleted: ${JSON.stringify(result)}`);

      setMessage({ 
        type: 'success', 
        text: `✅ Successfully deleted account for ${emailToDelete}!\n\nYou can now sign up again with this email address.` 
      });
      
      // Clear the input after successful deletion
      setTimeout(() => setEmailToDelete(''), 2000);

    } catch (error) {
      console.error('❌ Delete operation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setDebugInfo(prev => prev + `\n❌ Error: ${errorMessage}`);
      
      setMessage({ 
        type: 'error', 
        text: `Failed to delete user: ${errorMessage}` 
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MingleMood User Deleter</h1>
          <p className="text-gray-600">Standalone tool to delete user accounts for testing</p>
        </div>

        <Card className="border-orange-200 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <Trash2 className="h-6 w-6" />
              Delete User Account
            </CardTitle>
            <CardDescription className="text-orange-800">
              Remove a user account from Supabase Auth so you can re-use the email for testing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <Alert className={
                message.type === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : message.type === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
              }>
                <AlertDescription className={
                  message.type === 'success' 
                    ? 'text-green-800' 
                    : message.type === 'error'
                    ? 'text-red-800'
                    : 'text-blue-800'
                }>
                  {message.type === 'success' && <CheckCircle className="h-4 w-4 inline mr-2" />}
                  {message.type === 'error' && <AlertCircle className="h-4 w-4 inline mr-2" />}
                  <span className="whitespace-pre-line">{message.text}</span>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="emailToDelete" className="text-lg">Email Address to Delete</Label>
              <Input
                id="emailToDelete"
                type="email"
                placeholder="user@example.com"
                value={emailToDelete}
                onChange={(e) => setEmailToDelete(e.target.value)}
                disabled={deleting}
                className="text-lg p-6"
              />
            </div>

            <Button
              onClick={deleteUserDirectly}
              disabled={!emailToDelete || deleting}
              variant="destructive"
              className="w-full text-lg py-6"
              size="lg"
            >
              {deleting ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Deleting User...
                </>
              ) : (
                <>
                  <Trash2 className="h-5 w-5 mr-2" />
                  Delete User Account
                </>
              )}
            </Button>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
              <p className="text-yellow-800 font-medium mb-2">⚠️ Important Notes:</p>
              <ul className="text-yellow-700 space-y-1 list-disc list-inside">
                <li>You must be logged in as <strong>hello@minglemood.co</strong> (admin account)</li>
                <li>This permanently deletes the user from Supabase Auth</li>
                <li>All user data and profile information will be removed</li>
                <li>The email address will be available for immediate re-use</li>
              </ul>
            </div>

            {debugInfo && (
              <Card className="bg-gray-50 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-sm">Debug Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs font-mono whitespace-pre-wrap text-gray-700">
                    {debugInfo}
                  </pre>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-medium text-blue-900 mb-2">🔧 How to Use This Tool:</h3>
            <ol className="text-blue-800 space-y-2 list-decimal list-inside">
              <li>Make sure you're logged in as <strong>hello@minglemood.co</strong></li>
              <li>Enter the email address you want to delete (pre-filled: stevonne408@hotmail.com)</li>
              <li>Click "Delete User Account"</li>
              <li>Confirm the deletion</li>
              <li>Wait for the success message</li>
              <li>You can now sign up with that email again!</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
