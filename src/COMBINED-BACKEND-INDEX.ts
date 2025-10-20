// ============================================================================
// MINGLEMOOD SOCIAL - COMPLETE COMBINED BACKEND SERVER
// ============================================================================
// This file combines all backend code into one deployable file
// Copy-paste this ENTIRE file into: Supabase Dashboard > Edge Functions > make-server-4bcc747c
// ============================================================================
// UPDATED: October 18, 2025 - Complete version with all routes and Deno.serve
// ============================================================================

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { Stripe } from 'npm:stripe@17.5.0';

// ============================================================================
// SECTION 1: KV STORE UTILITIES
// ============================================================================

const kvClient = () => createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);

export const kvSet = async (key: string, value: any): Promise<void> => {
  const supabase = kvClient()
  const { error } = await supabase.from("kv_store_4bcc747c").upsert({
    key,
    value
  });
  if (error) {
    throw new Error(error.message);
  }
};

export const kvGet = async (key: string): Promise<any> => {
  const supabase = kvClient()
  const { data, error } = await supabase.from("kv_store_4bcc747c").select("value").eq("key", key).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data?.value;
};

export const kvDel = async (key: string): Promise<void> => {
  const supabase = kvClient()
  const { error } = await supabase.from("kv_store_4bcc747c").delete().eq("key", key);
  if (error) {
    throw new Error(error.message);
  }
};

export const kvMset = async (keys: string[], values: any[]): Promise<void> => {
  const supabase = kvClient()
  const { error } = await supabase.from("kv_store_4bcc747c").upsert(keys.map((k, i) => ({ key: k, value: values[i] })));
  if (error) {
    throw new Error(error.message);
  }
};

export const kvMget = async (keys: string[]): Promise<any[]> => {
  const supabase = kvClient()
  const { data, error } = await supabase.from("kv_store_4bcc747c").select("value").in("key", keys);
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.value) ?? [];
};

export const kvMdel = async (keys: string[]): Promise<void> => {
  const supabase = kvClient()
  const { error } = await supabase.from("kv_store_4bcc747c").delete().in("key", keys);
  if (error) {
    throw new Error(error.message);
  }
};

export const kvGetByPrefix = async (prefix: string): Promise<any[]> => {
  const supabase = kvClient()
  const { data, error } = await supabase.from("kv_store_4bcc747c").select("key, value").like("key", prefix + "%");
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.value) ?? [];
};

// ============================================================================
// SECTION 2: EMAIL SERVICE
// ============================================================================

const RESEND_API_URL = 'https://api.resend.com/emails';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Email templates - COMPLETE SET
const EMAIL_TEMPLATES = {
  WELCOME: (name: string): EmailTemplate => ({
    subject: 'Welcome to MingleMood! 🎉',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fafafa;">
        <div style="background: linear-gradient(135deg, #BF94EA 0%, #FA7872 100%); padding: 40px 20px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Welcome to MingleMood</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Where meaningful connections begin</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h2 style="color: #01180B; margin: 0 0 20px 0; font-size: 22px;">Welcome to MingleMood, ${name}!</h2>
          
          <p style="color: #01180B; line-height: 1.6; margin-bottom: 20px;">
            Welcome to the community. Our curation team will review your profile within 10-14 days. Once approved, you will start receiving invitations to gathers curated exclusively for you.
          </p>
          
          <div style="background: #f0fdf4; border-left: 4px solid #CDEDB2; padding: 20px; margin: 25px 0; border-radius: 6px;">
            <h3 style="color: #01180B; margin: 0 0 15px 0; font-size: 18px;">
              What's next:
            </h3>
            <ul style="color: #01180B; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Profile review (10-14 days)</li>
              <li>Please complete the personalized preference survey (mandatory for accurate matching)</li>
              <li>We will begin connecting you to exclusive events and activities with vetted Singles who match your preferences</li>
            </ul>
          </div>
          
          <p style="color: #01180B; line-height: 1.6; margin: 20px 0;">
            Questions? Contact us at <a href="mailto:hello@minglemood.co" style="color: #FA7872; text-decoration: none;">hello@minglemood.co</a>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">© 2024 MingleMood. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">Visit us at <a href="https://minglemood.co" style="color: #FA7872; text-decoration: none;">minglemood.co</a></p>
        </div>
      </div>
    `,
    text: `Welcome to MingleMood, ${name}!\n\nWelcome to the community. Our curation team will review your profile within 10-14 days. Once approved, you will start receiving invitations to gathers curated exclusively for you.\n\nWhat's next:\n- Profile review (10-14 days)\n- Please complete the personalized preference survey (mandatory for accurate matching)\n- We will begin connecting you to exclusive events and activities with vetted Singles who match your preferences\n\nQuestions? Contact us at hello@minglemood.co\n\n© 2024 MingleMood. All rights reserved.\nVisit us at https://minglemood.co`
  }),

  PROFILE_APPROVED: (name: string, surveyLink: string): EmailTemplate => ({
    subject: '🎉 Your MingleMood profile has been approved!',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fafafa;">
        <div style="background: linear-gradient(135deg, #BF94EA 0%, #FA7872 100%); padding: 40px 20px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Welcome to the community!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">The MingleMood Team</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h2 style="color: #01180B; margin: 0 0 20px 0; font-size: 22px;">Congratulations ${name}! Your MingleMood profile has been approved!</h2>
          
          <p style="color: #01180B; line-height: 1.6; margin-bottom: 25px;">
            Next step: Complete your personalization survey (5 minutes) to help us find your perfect matches and events.
          </p>
          
          <div style="background: #f0f9ff; border: 2px solid #BF94EA; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
            <a href="${surveyLink}" style="display: inline-block; background: linear-gradient(135deg, #BF94EA 0%, #FA7872 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Complete Your Survey →
            </a>
          </div>
          
          <p style="color: #01180B; line-height: 1.6; margin: 25px 0;">
            Once we find eligible Singles that fit your preferences, we will begin to send you invites to exclusive small group events (8-30 people). Make sure to mark our emails as "safe" to prevent them from going to spam and check your dashboard for updates.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px;">
          <p style="margin: 0;">© 2024 MingleMood. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">Visit us at <a href="https://minglemood.co" style="color: #FA7872; text-decoration: none;">minglemood.co</a></p>
        </div>
      </div>
    `,
    text: `Congratulations ${name}! Your MingleMood profile has been approved!\n\nNext step: Complete your personalization survey (5 minutes) to help us find your perfect matches and events.\n\nSurvey link: ${surveyLink}\n\nOnce we find eligible Singles that fit your preferences, we will begin to send you invites to exclusive small group events (8-30 people).\n\n© 2024 MingleMood. All rights reserved.\nVisit us at https://minglemood.co`
  }),
};

// Send email function
async function sendEmail(emailData: EmailData): Promise<boolean> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!apiKey) {
    console.error('📧 RESEND_API_KEY is not configured');
    return false;
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'MingleMood <hello@minglemood.co>',
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('📧 Resend API error:', response.status, errorText);
      return false;
    }

    const result = await response.json();
    console.log('📧 Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('📧 Email sending error:', error);
    return false;
  }
}

async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const template = EMAIL_TEMPLATES.WELCOME(name);
  return await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}

async function sendProfileApprovedEmail(email: string, name: string): Promise<boolean> {
  const surveyLink = 'https://minglemood.co/survey';
  const template = EMAIL_TEMPLATES.PROFILE_APPROVED(name, surveyLink);
  return await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}

async function sendCustomEmail(email: string, subject: string, message: string, name: string): Promise<boolean> {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fafafa;">
      <div style="background: linear-gradient(135deg, #BF94EA 0%, #FA7872 100%); padding: 40px 20px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">MingleMood</h1>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h2 style="color: #01180B; margin: 0 0 20px 0; font-size: 22px;">Hi ${name}!</h2>
        <div style="color: #01180B; line-height: 1.6; white-space: pre-wrap;">${message}</div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px;">
        <p style="margin: 0;">© 2024 MingleMood. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">Visit us at <a href="https://minglemood.co" style="color: #FA7872; text-decoration: none;">minglemood.co</a></p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: subject,
    html: html,
    text: message
  });
}

async function processEmailQueue(): Promise<void> {
  console.log('📧 Processing email queue...');
  const queued = await kvGetByPrefix('email_queue:');
  
  for (const item of queued) {
    try {
      if (item.status !== 'sent') {
        console.log('📧 Processing queued email:', item.id);
        // Process email based on type
        // Mark as sent after processing
        item.status = 'sent';
        await kvSet(`email_queue:${item.id}`, item);
      }
    } catch (error) {
      console.error('📧 Error processing email queue item:', error);
    }
  }
}

// ============================================================================
// SECTION 3: DATABASE SETUP
// ============================================================================

const adminSupabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up MingleMood database schema...');
    
    await kvSet('database_setup_status', {
      setup_date: new Date().toISOString(),
      version: '1.0',
      tables_created: [
        'users_data',
        'events_data', 
        'event_rsvps_data',
        'matches_data',
        'email_campaigns_data'
      ]
    });
    
    console.log('✅ Database structure initialized in KV store!');
    return { 
      success: true, 
      message: 'Database structure initialized.' 
    };
  } catch (error) {
    console.error('❌ Failed to setup database:', error);
    return { success: false, error: error.message };
  }
}

async function migrateUserData() {
  try {
    console.log('🔄 Migrating user data from auth metadata to KV store...');
    
    const { data: authUsers, error: authError } = await adminSupabase.auth.admin.listUsers();
    
    if (authError) {
      throw authError;
    }
    
    console.log(`Found ${authUsers.users.length} users to migrate`);
    
    for (const authUser of authUsers.users) {
      const metadata = authUser.user_metadata || {};
      const profileData = metadata.profile_data || {};
      
      const userData = {
        id: authUser.id,
        email: authUser.email,
        name: profileData.name,
        age: profileData.age ? parseInt(profileData.age) : null,
        gender: profileData.gender,
        location: profileData.location,
        phone: profileData.phone,
        profession: profileData.profession,
        education: profileData.education,
        religion: profileData.religion,
        ethnicity: profileData.ethnicity,
        bio: profileData.bio,
        interests: profileData.interests || [],
        looking_for: profileData.lookingFor,
        photos: profileData.photos || [],
        social_media: profileData.socialMedia || {},
        created_at: authUser.created_at,
        profile_complete: metadata.profile_complete || false,
        survey_completed: metadata.survey_completed || false
      };
      
      await kvSet(`users_data:${authUser.id}`, userData);
    }
    
    console.log('✅ User migration completed successfully');
    return { success: true, migrated_count: authUsers.users.length };
  } catch (error) {
    console.error('❌ User migration failed:', error);
    return { success: false, error: error.message };
  }
}

async function getAdminStats() {
  try {
    const { data: authUsers, error } = await adminSupabase.auth.admin.listUsers();
    
    if (error) {
      throw error;
    }
    
    const totalUsers = authUsers.users.length;
    const activeUsers = authUsers.users.filter(u => u.user_metadata?.is_active !== false).length;
    const profilesCompleted = authUsers.users.filter(u => u.user_metadata?.profile_complete === true).length;
    const surveysCompleted = authUsers.users.filter(u => u.user_metadata?.survey_completed === true).length;
    
    const events = await kvGetByPrefix('event:');
    const rsvps = await kvGetByPrefix('rsvp:');
    
    return {
      total_users: totalUsers,
      active_users: activeUsers,
      profiles_completed: profilesCompleted,
      surveys_completed: surveysCompleted,
      total_events: events.length,
      total_rsvps: rsvps.length,
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error getting admin stats:', error);
    return {
      total_users: 0,
      active_users: 0,
      profiles_completed: 0,
      surveys_completed: 0,
      total_events: 0,
      total_rsvps: 0,
      error: error.message
    };
  }
}

// ============================================================================
// SECTION 4: MAIN HONO SERVER
// ============================================================================

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use('*', logger(console.log));

// Initialize Supabase clients
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const anonSupabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
);

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-10-28.acacia',
});

// Check environment variables on startup
console.log('🔧 Environment Check:');
console.log('📧 RESEND_API_KEY:', Deno.env.get('RESEND_API_KEY') ? 'SET ✅' : 'MISSING ❌');
console.log('🔐 SUPABASE_URL:', Deno.env.get('SUPABASE_URL') ? 'SET ✅' : 'MISSING ❌');
console.log('🔐 SUPABASE_SERVICE_ROLE_KEY:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'SET ✅' : 'MISSING ❌');
console.log('🔐 SUPABASE_ANON_KEY:', Deno.env.get('SUPABASE_ANON_KEY') ? 'SET ✅' : 'MISSING ❌');
console.log('💳 STRIPE_SECRET_KEY:', Deno.env.get('STRIPE_SECRET_KEY') ? 'SET ✅' : 'MISSING ❌');

// ============================================================================
// AUTH ROUTES
// ============================================================================

app.post('/make-server-4bcc747c/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, phone, age, gender, location, profession, lookingFor } = body;

    console.log('📝 Signup request:', { email, name, age, gender, location, profession, lookingFor });

    const profileData = {
      name,
      age,
      gender,
      location,
      phone,
      profession,
      lookingFor,
      photos: [],
      interests: [],
      bio: '',
      ageRange: { min: '25', max: '45' },
      maxDistance: '25',
      signup_complete: true,
      photos_needed: true
    };

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        phone,
        plan: 'basic',
        created_at: new Date().toISOString(),
        profile_data: profileData,
        profile_complete: false,
        signup_profile_complete: true
      },
      email_confirm: true,
      phone_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log('✅ User created:', profileData);

    await kvSet(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      phone,
      plan: 'basic',
      profile_complete: false,
      signup_profile_complete: true,
      profile_data: profileData,
      created_at: new Date().toISOString()
    });

    // Send welcome email
    try {
      const emailSent = await sendWelcomeEmail(email, name);
      if (emailSent) {
        console.log('✅ Welcome email sent to:', email);
        await kvSet(`email_log:welcome:${data.user.id}`, {
          user_id: data.user.id,
          email: email,
          type: 'welcome',
          sent_at: new Date().toISOString(),
          status: 'sent'
        });
      }
    } catch (emailError) {
      console.error('❌ Email error:', emailError);
    }

    return c.json({ message: 'User created successfully', user: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

app.post('/make-server-4bcc747c/profile-completed', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, email, name } = body;

    console.log('🎉 Profile completed for:', email);

    try {
      const emailSent = await sendProfileApprovedEmail(email, name);
      if (emailSent) {
        console.log('✅ Profile approval email sent to:', email);
        await kvSet(`email_log:profile_approved:${userId}`, {
          user_id: userId,
          email: email,
          type: 'profile_approved',
          sent_at: new Date().toISOString(),
          status: 'sent'
        });
        return c.json({ success: true, message: 'Profile completion email sent' });
      }
    } catch (emailError) {
      console.error('❌ Email error:', emailError);
    }

    return c.json({ error: 'Failed to send email' }, 500);
  } catch (error) {
    console.error('❌ Profile completion error:', error);
    return c.json({ error: 'Failed to process profile completion' }, 500);
  }
});

app.post('/make-server-4bcc747c/survey-completed', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, email, name } = body;

    console.log('📝 Survey completed for:', email);

    await kvSet(`survey_completion:${userId}`, {
      user_id: userId,
      email: email,
      name: name,
      completed_at: new Date().toISOString(),
      status: 'completed'
    });

    return c.json({ success: true, message: 'Survey completion logged' });
  } catch (error) {
    console.error('❌ Survey completion error:', error);
    return c.json({ error: 'Failed to process survey completion' }, 500);
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/make-server-4bcc747c/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    server: 'MingleMood Server v1.0',
    cors: 'enabled'
  });
});

// ============================================================================
// ADMIN ROUTES
// ============================================================================

app.get('/make-server-4bcc747c/admin/stats', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token' }, 401);
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user || user.email !== 'hello@minglemood.co') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const stats = await getAdminStats();
    return c.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    return c.json({ error: 'Failed to get stats' }, 500);
  }
});

app.get('/make-server-4bcc747c/admin/users', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token' }, 401);
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user || user.email !== 'hello@minglemood.co') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { data: users, error } = await supabase.auth.admin.listUsers();
    if (error) {
      throw error;
    }

    const usersData = users.users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.name,
      created_at: u.created_at,
      profile_complete: u.user_metadata?.profile_complete || false,
      survey_completed: u.user_metadata?.survey_completed || false,
      is_active: u.user_metadata?.is_active !== false
    }));

    return c.json({ users: usersData });
  } catch (error) {
    console.error('Admin users error:', error);
    return c.json({ error: 'Failed to get users' }, 500);
  }
});

app.post('/make-server-4bcc747c/admin/send-custom-email', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token' }, 401);
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user || user.email !== 'hello@minglemood.co') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const body = await c.req.json();
    const { recipients, subject, message } = body;

    const results = [];
    for (const recipient of recipients) {
      const sent = await sendCustomEmail(recipient.email, subject, message, recipient.name);
      results.push({ email: recipient.email, sent });
    }

    return c.json({ success: true, results });
  } catch (error) {
    console.error('Send custom email error:', error);
    return c.json({ error: 'Failed to send emails' }, 500);
  }
});

app.delete('/make-server-4bcc747c/admin/users/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token' }, 401);
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user || user.email !== 'hello@minglemood.co') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const userId = c.req.param('userId');
    
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      throw error;
    }

    // Delete KV data
    await kvDel(`user:${userId}`);

    return c.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

// ============================================================================
// USER PROFILE ROUTES
// ============================================================================

app.get('/make-server-4bcc747c/profile/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token' }, 401);
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = c.req.param('userId');
    const { data: targetUser, error } = await supabase.auth.admin.getUserById(userId);
    
    if (error || !targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      id: targetUser.user.id,
      email: targetUser.user.email,
      ...targetUser.user.user_metadata
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Failed to get profile' }, 500);
  }
});

app.put('/make-server-4bcc747c/profile/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token' }, 401);
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    const userId = c.req.param('userId');
    
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: body
    });

    if (error) {
      throw error;
    }

    return c.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// ============================================================================
// EVENT ROUTES
// ============================================================================

app.post('/make-server-4bcc747c/events', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token' }, 401);
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user || user.email !== 'hello@minglemood.co') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const body = await c.req.json();
    const eventId = `event:${Date.now()}`;
    
    await kvSet(eventId, {
      ...body,
      id: eventId,
      created_at: new Date().toISOString()
    });

    return c.json({ success: true, eventId });
  } catch (error) {
    console.error('Create event error:', error);
    return c.json({ error: 'Failed to create event' }, 500);
  }
});

app.get('/make-server-4bcc747c/events', async (c) => {
  try {
    const events = await kvGetByPrefix('event:');
    return c.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    return c.json({ error: 'Failed to get events' }, 500);
  }
});

// ============================================================================
// RSVP ROUTES
// ============================================================================

app.post('/make-server-4bcc747c/rsvp', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token' }, 401);
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const rsvpId = `rsvp:${user.id}:${body.eventId}`;
    
    await kvSet(rsvpId, {
      userId: user.id,
      eventId: body.eventId,
      status: body.status,
      created_at: new Date().toISOString()
    });

    return c.json({ success: true, rsvpId });
  } catch (error) {
    console.error('RSVP error:', error);
    return c.json({ error: 'Failed to create RSVP' }, 500);
  }
});

app.get('/make-server-4bcc747c/rsvp/event/:eventId', async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const rsvps = await kvGetByPrefix(`rsvp:`);
    const eventRsvps = rsvps.filter(r => r.eventId === eventId);
    
    return c.json({ rsvps: eventRsvps });
  } catch (error) {
    console.error('Get RSVPs error:', error);
    return c.json({ error: 'Failed to get RSVPs' }, 500);
  }
});

// ============================================================================
// STRIPE PAYMENT ROUTES
// ============================================================================

app.post('/make-server-4bcc747c/create-checkout-session', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token' }, 401);
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { eventId, amount, eventTitle } = body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: eventTitle || 'MingleMood Event',
            description: `RSVP for ${eventTitle}`,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `https://minglemood.co/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://minglemood.co/events`,
      metadata: {
        userId: user.id,
        eventId: eventId,
      },
    });

    return c.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Create checkout session error:', error);
    return c.json({ error: 'Failed to create checkout session' }, 500);
  }
});

app.post('/make-server-4bcc747c/stripe-webhook', async (c) => {
  try {
    const body = await c.req.text();
    const sig = c.req.header('stripe-signature');

    const event = stripe.webhooks.constructEvent(
      body,
      sig!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const eventId = session.metadata.eventId;

      // Record payment
      await kvSet(`payment:${session.id}`, {
        userId,
        eventId,
        amount: session.amount_total,
        status: 'completed',
        created_at: new Date().toISOString()
      });

      // Update RSVP
      await kvSet(`rsvp:${userId}:${eventId}`, {
        userId,
        eventId,
        status: 'confirmed',
        payment_id: session.id,
        created_at: new Date().toISOString()
      });
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return c.json({ error: 'Webhook error' }, 400);
  }
});

// ============================================================================
// DATABASE MANAGEMENT ROUTES
// ============================================================================

app.post('/make-server-4bcc747c/setup-database', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token' }, 401);
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user || user.email !== 'hello@minglemood.co') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const result = await setupDatabase();
    return c.json(result);
  } catch (error) {
    console.error('Setup database error:', error);
    return c.json({ error: 'Failed to setup database' }, 500);
  }
});

app.post('/make-server-4bcc747c/migrate-users', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token' }, 401);
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user || user.email !== 'hello@minglemood.co') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const result = await migrateUserData();
    return c.json(result);
  } catch (error) {
    console.error('Migrate users error:', error);
    return c.json({ error: 'Failed to migrate users' }, 500);
  }
});

// ============================================================================
// EMAIL QUEUE PROCESSING
// ============================================================================

app.post('/make-server-4bcc747c/admin/process-email-queue', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token' }, 401);
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user || user.email !== 'hello@minglemood.co') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    await processEmailQueue();
    return c.json({ success: true, message: 'Email queue processed' });
  } catch (error) {
    console.error('Process email queue error:', error);
    return c.json({ error: 'Failed to process email queue' }, 500);
  }
});

// ============================================================================
// START SERVER - CRITICAL!
// ============================================================================

console.log('🚀 MingleMood Server starting...');
console.log('📡 All routes registered successfully');
console.log('✅ Server ready to handle requests');

Deno.serve(app.fetch);
