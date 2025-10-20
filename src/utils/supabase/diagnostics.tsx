/**
 * Supabase Connection Diagnostics
 * 
 * This utility helps diagnose connection issues with Supabase
 */

import { projectId, publicAnonKey } from './info';
import { supabase } from './client';

export async function testSupabaseConnection() {
  const results = {
    credentialsValid: false,
    networkConnected: false,
    supabaseReachable: false,
    authServiceWorking: false,
    databaseWorking: false,
    storageWorking: false,
    errorMessage: '',
    timestamp: new Date().toISOString(),
    responseTime: 0
  };

  const startTime = Date.now();

  try {
    // Test 1: Check credentials
    console.log('🔍 Test 1: Checking credentials...');
    if (projectId && publicAnonKey) {
      results.credentialsValid = true;
      console.log('✅ Credentials present');
    } else {
      results.errorMessage = 'Missing Supabase credentials';
      console.error('❌ Credentials missing');
      return results;
    }

    // Test 2: Check network connectivity
    console.log('🔍 Test 2: Testing network connectivity...');
    try {
      const networkTest = await fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      results.networkConnected = true;
      console.log('✅ Network connected');
    } catch (error) {
      results.errorMessage = 'No network connection';
      console.error('❌ Network check failed:', error);
      return results;
    }

    // Test 3: Check if Supabase project is reachable
    console.log('🔍 Test 3: Testing Supabase project reachability...');
    try {
      const supabaseUrl = `https://${projectId}.supabase.co`;
      const response = await fetch(supabaseUrl, {
        method: 'HEAD'
      });
      results.supabaseReachable = true;
      console.log('✅ Supabase project reachable');
    } catch (error: any) {
      results.errorMessage = `Supabase unreachable: ${error.message}`;
      console.error('❌ Supabase reachability check failed:', error);
      return results;
    }

    // Test 4: Test auth service
    console.log('🔍 Test 4: Testing auth service...');
    try {
      const authUrl = `https://${projectId}.supabase.co/auth/v1/health`;
      const response = await fetch(authUrl, {
        method: 'GET'
      });
      
      if (response.ok) {
        results.authServiceWorking = true;
        console.log('✅ Auth service working');
      } else {
        results.errorMessage = `Auth service returned status ${response.status}`;
        console.warn('⚠️ Auth service responded but not OK:', response.status);
      }
    } catch (error: any) {
      results.errorMessage = `Auth service error: ${error.message}`;
      console.error('❌ Auth service check failed:', error);
      return results;
    }

    // Test 5: Test database connectivity
    console.log('🔍 Test 5: Testing database connectivity...');
    try {
      if (supabase) {
        // Try a simple query - just check if we can connect
        const { data, error } = await supabase
          .from('events')
          .select('id')
          .limit(1);
        
        if (!error) {
          results.databaseWorking = true;
          console.log('✅ Database accessible');
        } else {
          // Check if it's a "relation does not exist" error (which means DB is working, just table missing)
          if (error.message.includes('relation') || error.message.includes('does not exist')) {
            results.databaseWorking = true;
            console.log('✅ Database accessible (tables may need setup)');
          } else {
            results.errorMessage = `Database error: ${error.message}`;
            console.error('❌ Database check failed:', error);
          }
        }
      }
    } catch (error: any) {
      results.errorMessage = `Database connection error: ${error.message}`;
      console.error('❌ Database check failed:', error);
    }

    // Test 6: Test storage service
    console.log('🔍 Test 6: Testing storage service...');
    try {
      if (supabase) {
        const { data, error } = await supabase.storage.listBuckets();
        if (!error) {
          results.storageWorking = true;
          console.log('✅ Storage service working');
        } else {
          console.warn('⚠️ Storage check failed:', error);
        }
      }
    } catch (error: any) {
      console.warn('⚠️ Storage check error:', error);
      // Don't fail overall test for storage issues
    }

    results.responseTime = Date.now() - startTime;
    console.log(`✅ All diagnostic tests completed in ${results.responseTime}ms`);
    return results;

  } catch (error: any) {
    results.errorMessage = `Diagnostic error: ${error.message}`;
    results.responseTime = Date.now() - startTime;
    console.error('❌ Diagnostic test failed:', error);
    return results;
  }
}

export function getDiagnosticSummary(results: any): string {
  const issues: string[] = [];

  if (!results.credentialsValid) {
    issues.push('Missing or invalid Supabase credentials');
  }
  if (!results.networkConnected) {
    issues.push('No network connection detected');
  }
  if (!results.supabaseReachable) {
    issues.push('Supabase project is not reachable (may be paused or having issues)');
  }
  if (!results.authServiceWorking) {
    issues.push('Authentication service is not responding');
  }
  if (!results.databaseWorking) {
    issues.push('Database connection failed');
  }

  if (issues.length === 0) {
    return 'All systems operational';
  }

  return issues.join('. ');
}

/**
 * Check for common security and performance issues
 */
export async function checkSecurityIssues() {
  const issues: Array<{
    type: 'security' | 'performance' | 'warning';
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    fix: string;
  }> = [];

  console.log('🔐 Running security and performance checks...');

  // Check 1: RLS (Row Level Security) - Can only be checked from dashboard
  issues.push({
    type: 'security',
    title: 'Row Level Security (RLS)',
    description: 'Check if RLS is enabled on all tables to prevent unauthorized data access',
    severity: 'high',
    fix: 'Go to Database > Tables in your Supabase dashboard and enable RLS for each table. Then create appropriate policies.'
  });

  // Check 2: API Key exposure
  if (typeof window !== 'undefined' && publicAnonKey) {
    console.log('✅ Using public anon key (correct for frontend)');
  }

  // Check 3: Password policy
  issues.push({
    type: 'security',
    title: 'Password Strength Policy',
    description: 'Ensure strong password requirements are enforced',
    severity: 'medium',
    fix: 'Go to Authentication > Policies in Supabase dashboard and enable strong password requirements (min 8 chars, uppercase, lowercase, numbers, special chars)'
  });

  // Check 4: MFA
  issues.push({
    type: 'security',
    title: 'Multi-Factor Authentication (MFA)',
    description: 'Enable MFA for admin accounts to add an extra security layer',
    severity: 'medium',
    fix: 'Go to Authentication > Providers in Supabase dashboard and enable MFA options'
  });

  // Check 5: Database indexes
  issues.push({
    type: 'performance',
    title: 'Database Indexes',
    description: 'Check for duplicate or missing indexes that affect query performance',
    severity: 'medium',
    fix: 'Go to Database > Performance Advisor in Supabase dashboard and follow recommendations to remove duplicate indexes and add missing ones'
  });

  // Check 6: Connection pooling
  issues.push({
    type: 'performance',
    title: 'Connection Pooling',
    description: 'Ensure connection pooling is properly configured to handle multiple concurrent users',
    severity: 'low',
    fix: 'Check Project Settings > Database in Supabase dashboard for connection pool settings'
  });

  // Check 7: Email verification
  issues.push({
    type: 'security',
    title: 'Email Verification',
    description: 'Verify that email confirmation is enabled for new signups',
    severity: 'medium',
    fix: 'Go to Authentication > Email Templates and ensure "Confirm signup" is enabled'
  });

  console.log(`🔍 Found ${issues.length} items to check`);
  return issues;
}

/**
 * Get direct links to fix common issues in Supabase dashboard
 */
export function getSupabaseDashboardLinks(projectId: string) {
  const baseUrl = `https://supabase.com/dashboard/project/${projectId}`;
  
  return {
    overview: baseUrl,
    database: `${baseUrl}/database/tables`,
    auth: `${baseUrl}/auth/users`,
    authPolicies: `${baseUrl}/auth/policies`,
    storage: `${baseUrl}/storage/buckets`,
    performanceAdvisor: `${baseUrl}/advisors/performance`,
    securityAdvisor: `${baseUrl}/advisors/security`,
    sqlEditor: `${baseUrl}/sql`,
    settings: `${baseUrl}/settings/general`,
    apiKeys: `${baseUrl}/settings/api`,
  };
}