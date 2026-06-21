import os
import re

file_path = 'src/lib/mockApi.ts'
with open(file_path, 'r') as f:
    code = f.read()

# 1. Update API_URL logic to handle localhost on production
api_url_old = r"let rawApiUrl = \(import\.meta\.env\.VITE_API_URL \|\| '/api'\)\.trim\(\);"
api_url_new = """let rawApiUrl = (import.meta.env.VITE_API_URL || '/api').trim();
if (import.meta.env.MODE === 'production' && rawApiUrl.includes('localhost')) {
  rawApiUrl = '/api';
}"""
code = re.sub(api_url_old, api_url_new, code)

# 2. Add isProd and forceDemo and update isDemoMode
demo_old = r"function isDemoMode\(session: unknown\): boolean \{"
demo_new = """const isProd = import.meta.env.MODE === 'production';
const forceDemo = import.meta.env.VITE_FORCE_DEMO === 'true';

function isDemoMode(session: unknown): boolean {
  if (isProd && !forceDemo) return false;"""
code = re.sub(demo_old, demo_new, code)

# 3. Update catch blocks
replacements = [
    (r"console\.warn\('API discovery failed, falling back to local simulation:', err\);", 
     r"console.warn('API discovery failed:', err);\n    if (isProd && !forceDemo) throw err;"),
    
    (r"console\.warn\('getDashboardStats API failed, using mock stats:', err\);",
     r"console.warn('getDashboardStats API failed:', err);\n    if (isProd && !forceDemo) throw err;"),
    
    (r"console\.warn\('generateOutreach API failed, using mock generation:', err\);",
     r"console.warn('generateOutreach API failed:', err);\n    if (isProd && !forceDemo) throw err;"),
    
    (r"console\.warn\('\[scoreLeadApi\] failed:', err\);",
     r"console.warn('[scoreLeadApi] failed:', err);\n    if (isProd && !forceDemo) throw err;"),
    
    (r"console\.warn\('getProposals failed:', err\);",
     r"console.warn('getProposals failed:', err);\n    if (isProd && !forceDemo) throw err;"),
    
    (r"console\.warn\('generateProposalApi failed:', err\);",
     r"console.warn('generateProposalApi failed:', err);\n    if (isProd && !forceDemo) throw err;")
]

for old, new in replacements:
    code = re.sub(old, new, code)

with open(file_path, 'w') as f:
    f.write(code)

print('mockApi.ts patched successfully')
