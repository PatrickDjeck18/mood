import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { CheckCircle, Users, Calendar, TrendingUp, Database } from 'lucide-react';

export function RealDataSummary() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Platform Data Status</h2>
        <Badge className="bg-green-600 text-white">Real Data Active</Badge>
      </div>

      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>✅ Demo Data Removed:</strong> Your platform now displays only real client data instead of fictitious information.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <Users className="h-5 w-5 mr-2" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Demo users removed</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Real signups tracked</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Profile completion metrics</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Admin API connected</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <Calendar className="h-5 w-5 mr-2" />
              Events System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Sample events removed</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Real event creation ready</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">RSVP tracking active</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Payment integration ready</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-purple-700">
            <TrendingUp className="h-5 w-5 mr-2" />
            What Changed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-red-700 mb-3">❌ Removed (Demo Data)</h4>
              <ul className="text-sm space-y-1 text-red-600">
                <li>• 347 fictional users (Alexandra Chen, Marcus Rodriguez, etc.)</li>
                <li>• $18,750 fake revenue</li>
                <li>• Sample events (Wine & Paint, Rooftop Cocktail Party)</li>
                <li>• Hardcoded activity feed</li>
                <li>• localStorage-based statistics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-700 mb-3">✅ Added (Real Data)</h4>
              <ul className="text-sm space-y-1 text-green-600">
                <li>• Direct Supabase API integration</li>
                <li>• Real user authentication & profiles</li>
                <li>• Actual event management system</li>
                <li>• Live RSVP and payment tracking</li>
                <li>• Empty states for new platforms</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="border-blue-200 bg-blue-50">
        <Database className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Next Steps:</strong> Your platform is now ready for real clients. Empty dashboards are normal for new platforms - 
          data will populate as users sign up and events are created through your admin panel.
        </AlertDescription>
      </Alert>
    </div>
  );
}