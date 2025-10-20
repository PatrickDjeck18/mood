import React, { useState, useEffect } from 'react';
import { Users, Calendar, MessageSquare, TrendingUp, Mail, Phone, Plus, Edit, Trash2, Send, CheckCircle, Clock, AlertCircle, Settings, UserX, RefreshCw, AlertTriangle, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { EmailTemplateEditor } from './email-template-editor';
import { ProfileDeactivationManager } from './profile-deactivation-manager';
import { DatabaseMigrationTool } from './database-migration-tool';
import { RealDataSummary } from './real-data-summary';
import { ProfileViewer } from './profile-viewer';
import { AllProfileResponses } from './all-profile-responses';
import { SecurityChecker } from './security-checker';
import { UserManagement } from './user-management';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalMatches: number;
  revenue: number;
}

interface EmailStats {
  totalSent: number;
  invitationsSent: number;
  confirmedRSVPs: number;
  declinedRSVPs: number;
  pendingRSVPs: number;
}

interface AdminDashboardProps {
  user: any;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    maxAttendees: '',
    category: ''
  });
  const [notificationForm, setNotificationForm] = useState({
    type: 'email',
    subject: '',
    message: '',
    targetAudience: 'all'
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      console.log('🔄 Loading real-time admin data from server...');
      
      // Get the current user's access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        throw new Error('No valid session found');
      }

      // Try to load real data from admin API endpoints with better error handling
      const [statsResponse, usersResponse, eventsResponse, emailLogsResponse] = await Promise.allSettled([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }).catch(err => {
          console.error('❌ Stats fetch failed:', err);
          return { ok: false, status: 500, statusText: err.message };
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/admin/users`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }).catch(err => {
          console.error('❌ Users fetch failed:', err);
          return { ok: false, status: 500, statusText: err.message };
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/admin/events`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }).catch(err => {
          console.error('❌ Events fetch failed:', err);
          return { ok: false, status: 500, statusText: err.message };
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/admin/email-logs`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }).catch(err => {
          console.error('❌ Email logs fetch failed:', err);
          return { ok: false, status: 500, statusText: err.message };
        })
      ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : r.reason));

      console.log('API Responses:', {
        stats: statsResponse.status,
        users: usersResponse.status,
        events: eventsResponse.status,
        emailLogs: emailLogsResponse.status
      });

      // Load real user data
      if (usersResponse.ok) {
        const realUsers = await usersResponse.json();
        console.log('✅ Loaded real users:', realUsers.length);
        
        // Transform for display
        const transformedUsers = realUsers.map(user => ({
          id: user.id,
          name: user.name || 'Profile Incomplete',
          email: user.email,
          plan: user.subscription_plan || 'basic',
          status: user.is_active ? 'Active' : 'Inactive',
          joinDate: new Date(user.created_at).toLocaleDateString(),
          profileComplete: user.profile_complete
        }));
        
        setUsers(transformedUsers);

        // Calculate real statistics from actual user data
        const totalUsers = realUsers.length;
        const activeUsers = realUsers.filter(u => u.is_active).length;
        const completedProfiles = realUsers.filter(u => u.profile_complete).length;
        const recentUsers = realUsers.filter(u => 
          new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length;

        // Load real events data
        let totalEvents = 0, upcomingEvents = 0;
        if (eventsResponse.ok) {
          const realEvents = await eventsResponse.json();
          console.log('✅ Loaded real events:', realEvents.length);
          
          totalEvents = realEvents.length;
          upcomingEvents = realEvents.filter(event => 
            new Date(event.date) >= new Date()
          ).length;

          // Transform events for display
          const transformedEvents = realEvents.map(event => ({
            id: event.id,
            title: event.title,
            date: event.date,
            attendees: event.current_attendees || 0,
            maxAttendees: event.max_attendees || 0,
            status: event.status || 'Open'
          }));
          
          setEvents(transformedEvents);
        }

        // Load email logs and calculate real email stats
        let realEmailStats = {
          totalSent: 0,
          invitationsSent: 0,
          confirmedRSVPs: 0,
          declinedRSVPs: 0,
          pendingRSVPs: 0
        };

        if (emailLogsResponse.ok) {
          const realEmailLogs = await emailLogsResponse.json();
          console.log('✅ Loaded email logs:', realEmailLogs.length);
          setEmailLogs(realEmailLogs);
          
          // Calculate real email stats from logs
          realEmailStats.totalSent = realEmailLogs.length;
          realEmailStats.invitationsSent = realEmailLogs.filter(log => 
            log.template_type?.includes('invitation') || log.subject?.includes('invitation')
          ).length;
        }

        // Try to get real RSVP stats from server
        try {
          const rsvpResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/admin/rsvps`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          
          if (rsvpResponse.ok) {
            const rsvpData = await rsvpResponse.json();
            realEmailStats.confirmedRSVPs = rsvpData.filter(r => r.status === 'confirmed').length;
            realEmailStats.declinedRSVPs = rsvpData.filter(r => r.status === 'declined').length;
            realEmailStats.pendingRSVPs = rsvpData.filter(r => r.status === 'pending').length;
          }
        } catch (error) {
          console.log('No RSVP data available yet');
        }

        // Calculate real revenue based on actual paid RSVPs, or zero if no payment data
        let realRevenue = 0;
        try {
          const paymentResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/admin/payments`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          
          if (paymentResponse.ok) {
            const paymentData = await paymentResponse.json();
            realRevenue = paymentData.reduce((total, payment) => {
              return total + (payment.status === 'completed' ? (payment.amount / 100) : 0);
            }, 0);
          }
        } catch (error) {
          console.log('No payment data available yet');
        }

        // Set real statistics - no more fictitious calculations
        setStats({
          totalUsers,
          activeUsers: recentUsers,
          totalEvents,
          upcomingEvents,
          totalMatches: 0, // Will be calculated when actual matching is implemented
          revenue: realRevenue
        });

        setEmailStats(realEmailStats);

        console.log('✅ Real admin data loaded successfully:', {
          totalUsers,
          activeUsers: recentUsers,
          completedProfiles,
          totalEvents,
          upcomingEvents
        });
        
      } else {
        throw new Error(`Users API error: ${usersResponse.status}`);
      }

    } catch (error: any) {
      console.error('❌ Error loading real admin data:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // Only use empty state if real data fails - no more demo data
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalEvents: 0,
        upcomingEvents: 0,
        totalMatches: 0,
        revenue: 0
      });
      setEmailStats({
        totalSent: 0,
        invitationsSent: 0,
        confirmedRSVPs: 0,
        declinedRSVPs: 0,
        pendingRSVPs: 0
      });
      setUsers([]);
      setEvents([]);
      setEmailLogs([]);
      
      // Show detailed error message to help debug
      const errorMsg = error.message || 'Unknown error';
      console.error('💥 Admin data load failed with error:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get the current user's access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        throw new Error('No valid session found');
      }

      // Create event via API
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/admin/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newEventForm.title,
          description: newEventForm.description,
          date: newEventForm.date,
          time: newEventForm.time,
          location: newEventForm.location,
          price: parseFloat(newEventForm.price),
          max_attendees: parseInt(newEventForm.maxAttendees),
          category: newEventForm.category,
          status: 'Open'
        })
      });

      if (response.ok) {
        const createdEvent = await response.json();
        console.log('✅ Event created successfully:', createdEvent);
        alert('Event created successfully!');
        
        // Reset form
        setNewEventForm({
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          price: '',
          maxAttendees: '',
          category: ''
        });

        // Reload admin data to show new event
        loadAdminData();
      } else {
        const errorData = await response.text();
        console.error('❌ Error creating event:', errorData);
        alert('Error creating event. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error creating event:', error);
      alert('Error creating event. Please check your connection and try again.');
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get the current user's access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        throw new Error('No valid session found');
      }

      // Send notification via API
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/admin/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: notificationForm.type,
          subject: notificationForm.subject,
          message: notificationForm.message,
          target_audience: notificationForm.targetAudience
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Notification sent successfully:', result);
        alert(`${notificationForm.type.toUpperCase()} notification sent successfully to ${notificationForm.targetAudience} users!`);
        
        // Reset form
        setNotificationForm({
          type: 'email',
          subject: '',
          message: '',
          targetAudience: 'all'
        });
      } else {
        const errorData = await response.text();
        console.error('❌ Error sending notification:', errorData);
        alert('Error sending notification. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      alert('Error sending notification. Please check your connection and try again.');
    }
  };



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/test-backend.html', '_blank')}
            className="border-purple-600 text-purple-700 hover:bg-purple-50"
          >
            🧪 Test Backend
          </Button>
          <Badge className="bg-purple-600 text-white">Administrator</Badge>
        </div>
      </div>

      {/* Email API Key Error Alert */}
      <EmailApiKeyDiagnostic user={user} />

      {/* Backend Connection Warning */}
      {!loading && stats?.totalUsers === 0 && users.length === 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 mb-1">Backend Connection Issue</h3>
            <p className="text-sm text-yellow-800 mb-2">
              Unable to load admin data from the server. This could mean:
            </p>
            <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1 mb-3">
              <li>The Supabase Edge Function is not deployed yet</li>
              <li>There's a network connectivity issue</li>
              <li>Your authentication token expired</li>
            </ul>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => loadAdminData()}
                className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
              >
                Open Supabase Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-12">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">🔒 Security</TabsTrigger>
          <TabsTrigger value="data-status">Data Status</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="profiles">Profile Mgmt</TabsTrigger>
          <TabsTrigger value="all-responses">All Responses</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="emails">Email Management</TabsTrigger>
          <TabsTrigger value="email-logs">Email Logs</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
        </TabsList>

        {/* Security Checker Tab */}
        <TabsContent value="security" className="space-y-6">
          <SecurityChecker user={user} />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          {/* Yesterday's Profile Responses */}
          <Card className="border-purple-200 bg-gradient-to-r from-[#BF94EA]/10 to-[#FA7872]/10">
            <CardHeader>
              <CardTitle className="text-[#01180B] flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>📋 Yesterday's Profile Responses</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const yesterdayUsers = users.filter(user => {
                  if (!user.joinDate && !user.created_at) return false;
                  const joinDate = new Date(user.joinDate || user.created_at);
                  const daysDiff = (new Date().getTime() - joinDate.getTime()) / (1000 * 3600 * 24);
                  return daysDiff >= 1 && daysDiff <= 2;
                });
                
                return yesterdayUsers.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-[#01180B] mb-4">
                      <strong>{yesterdayUsers.length} users signed up yesterday.</strong> Click "View Profile" to see their complete responses, photos, and preferences.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {yesterdayUsers.map((user) => (
                        <Card key={user.id} className="border-[#BF94EA]/30 bg-white">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              {user.user_metadata?.profile_data?.photos?.[0] ? (
                                <img 
                                  src={user.user_metadata.profile_data.photos[0]} 
                                  alt="Profile"
                                  className="h-12 w-12 rounded-full object-cover border-2 border-[#BF94EA]"
                                />
                              ) : (
                                <div className="h-12 w-12 bg-gradient-to-r from-[#BF94EA] to-[#FA7872] rounded-full flex items-center justify-center text-white font-medium">
                                  {user.user_metadata?.profile_data?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {user.user_metadata?.profile_data?.name || 'Profile Incomplete'}
                                </h4>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant={user.user_metadata?.profile_complete ? 'default' : 'secondary'} className="text-xs">
                                    {user.user_metadata?.profile_complete ? '✅ Complete' : '⏳ Incomplete'}
                                  </Badge>
                                  <Badge className="bg-red-100 text-red-700 text-xs">NEW!</Badge>
                                </div>
                              </div>
                            </div>
                            
                            {/* Quick Preview */}
                            <div className="text-sm text-gray-600 mb-3 space-y-1">
                              <p><strong>Age:</strong> {user.user_metadata?.profile_data?.age || 'Not provided'}</p>
                              <p><strong>Location:</strong> {user.user_metadata?.profile_data?.location || 'Not provided'}</p>
                              <p><strong>Photos:</strong> {user.user_metadata?.profile_data?.photos?.length || 0} uploaded</p>
                              <p><strong>Survey:</strong> {user.user_metadata?.survey_completed ? '✅ Done' : '⏳ Pending'}</p>
                            </div>
                            
                            <ProfileViewer 
                              user={user} 
                              trigger={
                                <Button className="w-full bg-gradient-to-r from-[#BF94EA] to-[#FA7872] hover:from-[#BF94EA]/90 hover:to-[#FA7872]/90 text-white">
                                  📋 View Full Profile Response
                                </Button>
                              }
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Sign-ups from Yesterday</h3>
                    <p className="text-gray-500 mb-4">
                      There were no new user registrations yesterday. Check the debug tools below if you expected to see users here.
                    </p>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Debug Panel for Finding Recent Sign-ups */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">🔍 Debug: Find Your Sign-ups</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 mb-4">
                Can't find your sign-ups from yesterday? Use these tools to diagnose and find your users.
              </p>
              <div className="flex space-x-2">
                <Button
                  onClick={async () => {
                    try {
                      console.log('🌐 Testing server connection...');
                      
                      // First test basic connectivity
                      const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/health`;
                      console.log('🏥 Health check URL:', healthUrl);
                      
                      const healthResponse = await fetch(healthUrl, {
                        headers: {
                          'Authorization': `Bearer ${publicAnonKey}`,
                        }
                      });
                      console.log('🏥 Health response status:', healthResponse.status);
                      
                      if (!healthResponse.ok) {
                        throw new Error(`Health check failed: ${healthResponse.status}`);
                      }
                      
                      const healthData = await healthResponse.json();
                      console.log('🏥 Health data:', healthData);
                      
                      // Then test debug endpoint
                      const debugUrl = `https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/admin/debug-users`;
                      console.log('🌐 Debug URL:', debugUrl);
                      
                      const debugResponse = await fetch(debugUrl, {
                        headers: {
                          'Authorization': `Bearer ${session.access_token}`,
                          'Content-Type': 'application/json'
                        }
                      });
                      
                      console.log('📡 Response status:', debugResponse.status);
                      
                      if (!debugResponse.ok) {
                        const errorText = await debugResponse.text();
                        console.error('❌ Response error:', errorText);
                        alert(`❌ API Error (${debugResponse.status}): ${errorText}`);
                        return;
                      }
                      
                      const debugData = await debugResponse.json();
                      console.log('🔍 DEBUG INFO:', debugData);
                      
                      if (debugData.error) {
                        alert(`❌ Server Error: ${debugData.error}`);
                        return;
                      }
                      
                      alert(`✅ Debug Results Found!
📊 Total Users: ${debugData.total_users || 0}
📅 Last 7 Days: ${debugData.users_last_7_days || 0}
🌟 Yesterday: ${debugData.users_yesterday || 0}

👀 Check browser console (F12) for detailed user list with emails!`);
                      
                    } catch (error) {
                      console.error('💥 Connection test failed:', error);
                      alert(`💥 Server Connection Failed!

Error: ${error.message}

This means either:
1. The Supabase Edge Function isn't deployed
2. There's a network connectivity issue
3. The projectId is incorrect

Check console (F12) for full error details.`);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  🔍 Debug Recent Sign-ups
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Real Data Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-green-900">📊 Real Data Dashboard</h3>
            </div>
            <p className="text-green-800 mt-2 text-sm">
              All statistics below reflect actual platform data from your Supabase database. 
              Revenue shows real payments, user counts are from auth registrations, and email stats track actual sent messages.
              <span className="block mt-1 text-green-700">
                <strong>No more demo/prototype data!</strong> This dashboard is now connected to your live system.
              </span>
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeUsers} active this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalEvents}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.upcomingEvents} upcoming
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMatches}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalMatches === 0 ? 'Matching algorithm coming soon' : 'Successful connections made'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.revenue === 0 ? 'From paid event registrations' : 'This month'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.length > 0 ? (
                  users.slice(0, 3).map((user, index) => (
                    <div key={user.id} className="flex items-center space-x-4">
                      <div className={`w-2 h-2 ${index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-purple-500'} rounded-full`}></div>
                      <div className="flex-1">
                        <p className="text-sm">
                          {index === 0 && 'New user registration: '}
                          {index === 1 && 'Profile completed: '}
                          {index === 2 && 'Recent activity: '}
                          {user.name !== 'Profile Incomplete' ? user.name : user.email}
                        </p>
                        <p className="text-xs text-gray-500">{user.joinDate}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No recent activity to display</p>
                    <p className="text-sm text-gray-400 mt-1">Activity will appear as users sign up and engage with the platform</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-status" className="space-y-6">
          <RealDataSummary />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <DatabaseMigrationTool 
            user={user} 
            onMigrationComplete={() => {
              // Reload admin data after migration
              loadAdminData();
            }} 
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* User Deletion Tool for Testing */}
          <UserManagement user={user} />
          
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Users</h2>
            <div className="flex space-x-2">
              <Button onClick={() => loadAdminData()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Users
              </Button>
            </div>
          </div>

          {/* User Count Info */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-green-800">
                  <strong>👥 Total Users Found:</strong> {users.length}
                  {users.length === 0 && (
                    <span className="text-red-600 ml-2">⚠️ No users found - this may indicate a data loading issue</span>
                  )}
                </p>
                
                {users.length > 0 && (
                  <>
                    <p className="text-sm text-green-600">
                      Recent sign-ups should appear in the table below. Users created yesterday will show recent join dates.
                    </p>
                    
                    {/* Quick Stats */}
                    <div className="bg-white p-3 rounded border mt-3">
                      <h4 className="font-medium text-gray-900 mb-2">📊 Quick User Analysis:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-blue-600">Recent Users (Last 7 days):</span>
                          <br />
                          <span className="text-lg font-bold text-blue-800">
                            {users.filter(user => {
                              if (!user.joinDate && !user.created_at) return false;
                              const joinDate = new Date(user.joinDate || user.created_at);
                              const daysDiff = (new Date().getTime() - joinDate.getTime()) / (1000 * 3600 * 24);
                              return daysDiff <= 7;
                            }).length}
                          </span>
                        </div>
                        
                        <div>
                          <span className="font-medium text-purple-600">Yesterday's Sign-ups:</span>
                          <br />
                          <span className="text-lg font-bold text-purple-800">
                            {users.filter(user => {
                              if (!user.joinDate && !user.created_at) return false;
                              const joinDate = new Date(user.joinDate || user.created_at);
                              const daysDiff = (new Date().getTime() - joinDate.getTime()) / (1000 * 3600 * 24);
                              return daysDiff >= 1 && daysDiff <= 2;
                            }).length}
                          </span>
                        </div>
                        
                        <div>
                          <span className="font-medium text-green-600">Profile Complete:</span>
                          <br />
                          <span className="text-lg font-bold text-green-800">
                            {users.filter(user => user.profile_complete).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              {users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Profile Status</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Days Ago</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      .sort((a, b) => new Date(b.created_at || b.joinDate || 0).getTime() - new Date(a.created_at || a.joinDate || 0).getTime())
                      .map((user) => {
                        const joinDate = new Date(user.created_at || user.joinDate);
                        const daysAgo = Math.floor((new Date().getTime() - joinDate.getTime()) / (1000 * 3600 * 24));
                        
                        return (
                          <TableRow key={user.id} className={daysAgo <= 2 ? 'bg-yellow-50' : ''}>
                            <TableCell className="font-medium">
                              {user.name || 'Profile Incomplete'}
                              {daysAgo <= 1 && <span className="ml-2 text-xs bg-red-100 text-red-600 px-1 rounded">NEW!</span>}
                            </TableCell>
                            <TableCell className="font-mono text-sm">{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.profile_complete ? 'default' : 'secondary'}>
                                {user.profile_complete ? '✅ Complete' : '⏳ Incomplete'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.subscription_plan === 'platinum' ? 'default' : 'secondary'}>
                                {(user.subscription_plan || 'basic').charAt(0).toUpperCase() + (user.subscription_plan || 'basic').slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {joinDate.toLocaleDateString()} {joinDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </TableCell>
                            <TableCell>
                              <span className={`text-sm px-2 py-1 rounded ${
                                daysAgo === 0 ? 'bg-green-100 text-green-700' :
                                daysAgo === 1 ? 'bg-yellow-100 text-yellow-700' :
                                daysAgo <= 7 ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {daysAgo === 0 ? 'Today' : 
                                 daysAgo === 1 ? 'Yesterday' : 
                                 `${daysAgo} days ago`}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <ProfileViewer user={user} />
                                <Button variant="outline" size="sm" title="Manage User" className="text-red-600">
                                  <Settings className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                  <p className="text-gray-500 mb-4">
                    This could mean either no users have signed up, or there's a data loading issue.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Troubleshooting:</strong></p>
                    <p>1. Try the "🔍 Debug Recent Sign-ups" button above</p>
                    <p>2. Check if you're logged in as hello@minglemood.co</p>
                    <p>3. Refresh this page</p>
                    <p>4. Check the Email Logs tab for sign-up activity</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-6">
          <ProfileDeactivationManager user={user} />
        </TabsContent>

        <TabsContent value="all-responses" className="space-y-6">
          <AllProfileResponses />
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Event Management</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>
                    Create a new exclusive event for MingleMood Social members.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        value={newEventForm.title}
                        onChange={(e) => setNewEventForm(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={newEventForm.category} onValueChange={(value) => setNewEventForm(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="networking">Networking</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                          <SelectItem value="culinary">Culinary</SelectItem>
                          <SelectItem value="cultural">Cultural</SelectItem>
                          <SelectItem value="outdoor">Outdoor</SelectItem>
                          <SelectItem value="dating">Dating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newEventForm.description}
                      onChange={(e) => setNewEventForm(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEventForm.date}
                        onChange={(e) => setNewEventForm(prev => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newEventForm.time}
                        onChange={(e) => setNewEventForm(prev => ({ ...prev, time: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newEventForm.location}
                      onChange={(e) => setNewEventForm(prev => ({ ...prev, location: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newEventForm.price}
                        onChange={(e) => setNewEventForm(prev => ({ ...prev, price: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxAttendees">Max Attendees</Label>
                      <Input
                        id="maxAttendees"
                        type="number"
                        value={newEventForm.maxAttendees}
                        onChange={(e) => setNewEventForm(prev => ({ ...prev, maxAttendees: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Create Event
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Attendees</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell>{event.attendees}/{event.maxAttendees}</TableCell>
                      <TableCell>
                        <Badge variant={event.status === 'Open' ? 'default' : 'secondary'}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <h2 className="text-xl font-semibold">Send Notifications</h2>

          <Card>
            <CardHeader>
              <CardTitle>Create Notification</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Notification Type</Label>
                    <Select value={notificationForm.type} onValueChange={(value) => setNotificationForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Select value={notificationForm.targetAudience} onValueChange={(value) => setNotificationForm(prev => ({ ...prev, targetAudience: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="premium">Premium Members</SelectItem>
                        <SelectItem value="platinum">Platinum Members</SelectItem>
                        <SelectItem value="basic">Basic Members</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={notificationForm.subject}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter notification subject"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter your message"
                    rows={4}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="space-y-6">
          <h2 className="text-xl font-semibold">Email Management</h2>
          
          {/* Email Stats Cards */}
          {emailStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{emailStats.totalSent}</div>
                  <p className="text-xs text-muted-foreground">
                    {emailStats.totalSent === 0 ? 'No emails sent yet' : 'All automated emails'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Event Invitations</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{emailStats.invitationsSent}</div>
                  <p className="text-xs text-muted-foreground">
                    {emailStats.invitationsSent === 0 ? 'No invitations sent yet' : 'Sent to members'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">RSVP Response Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {emailStats.invitationsSent > 0 
                      ? Math.round(((emailStats.confirmedRSVPs + emailStats.declinedRSVPs) / emailStats.invitationsSent) * 100)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {emailStats.invitationsSent === 0 ? 'No invitations sent yet' : 
                     `${emailStats.confirmedRSVPs + emailStats.declinedRSVPs} of ${emailStats.invitationsSent} responded`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confirmed RSVPs</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{emailStats.confirmedRSVPs}</div>
                  <p className="text-xs text-muted-foreground">
                    Attending events
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending RSVPs</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{emailStats.pendingRSVPs}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting response
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Declined RSVPs</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{emailStats.declinedRSVPs}</div>
                  <p className="text-xs text-muted-foreground">
                    Cannot attend
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Email Management Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Approval</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">Approve user profiles and send welcome emails</p>
                <div className="flex space-x-2">
                  <Input placeholder="User ID or Email" />
                  <Button onClick={async () => {
                    try {
                      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/admin/approve-profile`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${publicAnonKey}`
                        },
                        body: JSON.stringify({ userId: 'demo-user-1' })
                      });
                      if (response.ok) {
                        alert('Profile approved and email sent!');
                      }
                    } catch (error) {
                      console.error('Error:', error);
                      alert('Demo: Profile would be approved and welcome email sent');
                    }
                  }}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Event Invitations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">Send event invitations to selected members</p>
                <div className="space-y-2">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="Member emails (one per line)" rows={3} />
                  <Button onClick={async () => {
                    try {
                      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/admin/send-event-invitations`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${publicAnonKey}`
                        },
                        body: JSON.stringify({ 
                          eventId: 'event-1', 
                          recipientEmails: ['demo@example.com'] 
                        })
                      });
                      if (response.ok) {
                        alert('Event invitations sent!');
                      }
                    } catch (error) {
                      console.error('Error:', error);
                      alert('Demo: Event invitations would be sent via Resend');
                    }
                  }} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitations
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>RSVP Reminders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">Send reminders to pending RSVPs</p>
                <div className="space-y-2">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={async () => {
                    try {
                      console.log('📧 Sending regular RSVP reminders...');
                      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/admin/send-rsvp-reminders`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${publicAnonKey}`
                        },
                        body: JSON.stringify({ eventId: 'event-1' })
                      });
                      if (response.ok) {
                        const result = await response.json();
                        console.log('✅ Regular reminder response:', result);
                        alert('📧 Regular RSVP reminders sent! Check email logs.');
                      } else {
                        const errorText = await response.text();
                        console.error('❌ Server error:', errorText);
                        alert(`Error: ${errorText}`);
                      }
                    } catch (error) {
                      console.error('❌ Request error:', error);
                      alert(`Failed to send reminders: ${error.message}`);
                    }
                  }} className="w-full">
                    <Clock className="h-4 w-4 mr-2" />
                    Send Reminders
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🚨 RSVP Final Reminders (24h)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">Send urgent final reminders for expiring invitations</p>
                <div className="space-y-2">
                  <Button 
                    onClick={async () => {
                      try {
                        console.log('🚨 Sending RSVP Final Reminders...');
                        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/admin/send-rsvp-final-reminders`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${publicAnonKey}`
                          }
                        });
                        
                        if (response.ok) {
                          const result = await response.json();
                          console.log('✅ Final reminder response:', result);
                          alert('🚨 Final RSVP reminders sent with updated template! Check email logs.');
                        } else {
                          const errorText = await response.text();
                          console.error('❌ Server error:', errorText);
                          alert(`Error: ${errorText}`);
                        }
                      } catch (error) {
                        console.error('❌ Request error:', error);
                        alert(`Failed to send final reminders: ${error.message}`);
                      }
                    }} 
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Send Final 24h Reminders
                  </Button>
                  <p className="text-xs text-gray-500">
                    Uses the new "Don't miss out. Your Invitation Expires Tomorrow." template
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Post-Event Surveys</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">Send surveys to event attendees</p>
                <div className="space-y-2">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Completed Event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={async () => {
                    try {
                      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/admin/send-post-event-surveys`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${publicAnonKey}`
                        },
                        body: JSON.stringify({ eventId: 'event-1' })
                      });
                      if (response.ok) {
                        alert('Post-event surveys sent!');
                      }
                    } catch (error) {
                      console.error('Error:', error);
                      alert('Demo: Post-event surveys would be sent to attendees');
                    }
                  }} className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Surveys
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Queue Management */}
          <Card>
            <CardHeader>
              <CardTitle>Email Queue Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">Process queued emails and view email logs</p>
              <div className="flex space-x-2">
                <Button onClick={async () => {
                  try {
                    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/admin/process-email-queue`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${publicAnonKey}`
                      }
                    });
                    if (response.ok) {
                      alert('Email queue processed!');
                      loadAdminData(); // Reload stats
                    }
                  } catch (error) {
                    console.error('Error:', error);
                    alert('Demo: Email queue would be processed');
                  }
                }}>
                  <Send className="h-4 w-4 mr-2" />
                  Process Queue
                </Button>
                <Button variant="outline" onClick={() => loadAdminData()}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Refresh Stats
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email-logs" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Email Delivery Logs</h2>
            <Button onClick={() => loadAdminData()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Logs
            </Button>
          </div>

          {/* Email Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailLogs.length}</div>
                <p className="text-xs text-muted-foreground">All email attempts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successfully Sent</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {emailLogs.filter(log => log.status === 'sent').length}
                </div>
                <p className="text-xs text-muted-foreground">Delivered emails</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {emailLogs.filter(log => log.status === 'failed').length}
                </div>
                <p className="text-xs text-muted-foreground">Failed deliveries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {emailLogs.length > 0 
                    ? Math.round((emailLogs.filter(log => log.status === 'sent').length / emailLogs.length) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Delivery success rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Email Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Email Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {emailLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailLogs.slice(0, 50).map((log, index) => (
                      <TableRow key={`${log.user_id}-${log.type}-${index}`}>
                        <TableCell className="font-medium">{log.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={log.type === 'welcome' ? 'default' : 
                                   log.type === 'profile_approved' ? 'secondary' : 'outline'}
                          >
                            {log.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={log.status === 'sent' ? 'default' : 'destructive'}
                          >
                            {log.status === 'sent' ? 'Delivered' : 'Failed'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.sent_at ? new Date(log.sent_at).toLocaleString() : 
                           log.attempted_at ? new Date(log.attempted_at).toLocaleString() : 'Unknown'}
                        </TableCell>
                        <TableCell>
                          {log.error && (
                            <span className="text-sm text-red-600 truncate max-w-xs" title={log.error}>
                              {log.error}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No email logs found</p>
                  <p className="text-sm text-gray-400 mt-1">Email activity will appear here as users sign up and complete actions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <EmailTemplateEditor user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Email API Key Diagnostic Component
function EmailApiKeyDiagnostic({ user }: { user: any }) {
  const [checking, setChecking] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const checkApiKey = async () => {
    console.log('🔍 Re-check API Key button clicked!');
    setChecking(true);
    try {
      console.log('🔑 Getting session...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('❌ No valid session found');
        alert('❌ No valid session found. Please sign in again.');
        setChecking(false);
        return;
      }

      console.log('✅ Session found, checking API key...');
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-4bcc747c/check-api-key`;
      console.log('📡 Calling:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ API Key check result:', result);
      setApiKeyStatus(result);
      setShowDetails(true);
    } catch (error: any) {
      console.error('❌ Error checking API key:', error);
      setApiKeyStatus({
        success: false,
        valid: false,
        error: error.message || 'Failed to check API key'
      });
      setShowDetails(true);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setChecking(false);
      console.log('✅ Check complete');
    }
  };

  // Auto-check on mount
  useEffect(() => {
    checkApiKey();
  }, []);

  if (!showDetails) return null;

  // Show error alert if API key is invalid
  if (apiKeyStatus && !apiKeyStatus.valid) {
    return (
      <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-1">🔑 Email Service Issue: Invalid API Key</h3>
          <p className="text-sm text-red-800 mb-2">
            {apiKeyStatus.error || 'Your RESEND_API_KEY is invalid or missing. Emails cannot be sent.'}
          </p>
          
          <div className="bg-white border border-red-200 rounded-lg p-3 mb-3">
            <h4 className="font-semibold text-red-900 text-sm mb-2">✅ How to fix:</h4>
            <ol className="text-sm text-red-800 list-decimal list-inside space-y-1">
              <li>Go to <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline font-semibold">resend.com/api-keys</a></li>
              <li>Create a new API key (it should start with "re_")</li>
              <li>Go to your <a href={`https://supabase.com/dashboard/project/${projectId}/settings/functions`} target="_blank" rel="noopener noreferrer" className="underline font-semibold">Supabase Functions Settings</a></li>
              <li>Update the RESEND_API_KEY secret with your new key</li>
              <li>Verify your domain at <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline font-semibold">resend.com/domains</a></li>
            </ol>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={checkApiKey}
              disabled={checking}
              className="border-red-600 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
              {checking ? 'Checking...' : 'Re-check API Key'}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open('https://resend.com/api-keys', '_blank')}
              className="border-red-600 text-red-700 hover:bg-red-100"
            >
              Get New API Key
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowDetails(false)}
              className="border-red-600 text-red-700 hover:bg-red-100"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show success message if API key is valid
  if (apiKeyStatus && apiKeyStatus.valid) {
    return (
      <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 flex items-start space-x-3">
        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-green-900 mb-1">✅ Email Service: Connected</h3>
          <p className="text-sm text-green-800">
            Your RESEND_API_KEY is valid and emails are working correctly.
          </p>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => setShowDetails(false)}
            className="mt-2 text-green-700 hover:bg-green-100"
          >
            Dismiss
          </Button>
        </div>
      </div>
    );
  }

  return null;
}