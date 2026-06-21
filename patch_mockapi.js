const fs = require('fs');

let code = fs.readFileSync('src/lib/mockApi.ts', 'utf8');

// 1. Update API_URL logic
code = code.replace(
  /let rawApiUrl = \(import\.meta\.env\.VITE_API_URL \|\| '\/api'\)\.trim\(\);/,
  `let rawApiUrl = (import.meta.env.VITE_API_URL || '/api').trim();\nif (import.meta.env.MODE === 'production' && rawApiUrl.includes('localhost')) {\n  rawApiUrl = '/api';\n}`
);

// 2. Add isProd and forceDemo and update isDemoMode
code = code.replace(
  /function isDemoMode\(session: unknown\): boolean \{/,
  `const isProd = import.meta.env.MODE === 'production';
const forceDemo = import.meta.env.VITE_FORCE_DEMO === 'true';

function isDemoMode(session: unknown): boolean {
  if (isProd && !forceDemo) return false;`
);

// 3. Update catch blocks
// discoverLeads
code = code.replace(
  /console\.warn\('API discovery failed, falling back to local simulation:', err\);/,
  `console.warn('API discovery failed:', err);\n    if (isProd && !forceDemo) throw err;`
);

// getDashboardStats
code = code.replace(
  /console\.warn\('getDashboardStats API failed, using mock stats:', err\);/g,
  `console.warn('getDashboardStats API failed:', err);\n    if (isProd && !forceDemo) throw err;`
);

// generateOutreach
code = code.replace(
  /console\.warn\('generateOutreach API failed, using mock generation:', err\);/,
  `console.warn('generateOutreach API failed:', err);\n    if (isProd && !forceDemo) throw err;`
);

// scoreLeadApi
code = code.replace(
  /console\.warn\('\[scoreLeadApi\] failed:', err\);/,
  `console.warn('[scoreLeadApi] failed:', err);\n    if (isProd && !forceDemo) throw err;`
);

// getProposals
code = code.replace(
  /console\.warn\('getProposals failed:', err\);/,
  `console.warn('getProposals failed:', err);\n    if (isProd && !forceDemo) throw err;`
);

// generateProposalApi
code = code.replace(
  /console\.warn\('generateProposalApi failed:', err\);/,
  `console.warn('generateProposalApi failed:', err);\n    if (isProd && !forceDemo) throw err;`
);

fs.writeFileSync('src/lib/mockApi.ts', code);
console.log('mockApi.ts patched successfully');
