/**
 * Mobile Debug Utilities
 * Helps diagnose issues on mobile devices where console access is limited
 */

// Store logs in memory for mobile debugging
const logs: string[] = [];
const MAX_LOGS = 100;

export function mobileLog(message: string, ...args: any[]) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const logMessage = `[${timestamp}] ${message} ${args.length > 0 ? JSON.stringify(args) : ''}`;
  
  // Add to in-memory log
  logs.push(logMessage);
  if (logs.length > MAX_LOGS) {
    logs.shift(); // Remove oldest log
  }
  
  // Also log to console
  console.log(message, ...args);
}

export function mobileError(message: string, error: any) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const errorMessage = error instanceof Error ? error.message : String(error);
  const logMessage = `[${timestamp}] ❌ ${message}: ${errorMessage}`;
  
  logs.push(logMessage);
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }
  
  console.error(message, error);
}

export function getMobileLogs(): string[] {
  return [...logs];
}

export function clearMobileLogs() {
  logs.length = 0;
}

export function downloadMobileLogs() {
  const logText = logs.join('\n');
  const blob = new Blob([logText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `minglemood-logs-${new Date().toISOString()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Show logs in an alert (for mobile debugging)
export function showMobileLogs() {
  const recentLogs = logs.slice(-20); // Last 20 logs
  alert('Recent logs:\n\n' + recentLogs.join('\n'));
}

// Add a global error handler for unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    mobileError('Unhandled error', event.error || event.message);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    mobileError('Unhandled promise rejection', event.reason);
  });
}
