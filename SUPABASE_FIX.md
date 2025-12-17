# 🔧 Quick Supabase Fix

## The Issue
Your app was trying to use a service role key that wasn't in your environment variables.

## The Fix
I've updated your supabaseClient.ts to:
1. **Only use service role on server-side** - Prevents client-side errors
2. **Fallback to regular client** - Uses anon key on client-side
3. **Added placeholder service key** - You'll need to get the real one

## Next Steps

### Option 1: Get Your Real Service Role Key
1. Go to your Supabase project: https://supabase.com/dashboard/project/fqlfxtuqizekehdwlcns
2. Go to Settings → API
3. Copy the "service_role" secret key
4. Replace the placeholder in .env.local

### Option 2: Use Without Service Role (Recommended for now)
Your app will work fine with just the anon key for most features. The service role is only needed for:
- Admin operations
- Server-side data mutations
- Edge Functions

## Test Your App
Your app should now load properly at: **http://localhost:3004**

The error should be gone and you can test:
- ✅ MetaMask connection
- ✅ Presale creation UI
- ✅ Token locks UI
- ✅ Database reads (with anon key)