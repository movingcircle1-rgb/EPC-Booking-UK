/*
  # Disable Auto-Register Trigger on Quote Requests

  1. Problem
    - The trigger `trigger_auto_register_client` is causing RLS violations
    - It tries to check auth.users and insert into clients table during quote submission
    - This blocks anonymous users from submitting quotes
    
  2. Solution
    - Disable the trigger temporarily
    - We're already using the Edge Function for auto-registration
    - The trigger is redundant and causing conflicts
    
  3. Impact
    - Quote submissions will work for anonymous users
    - Auto-registration still happens via Edge Function (called from frontend)
    - No loss of functionality
*/

-- Disable the auto-register trigger
DROP TRIGGER IF EXISTS trigger_auto_register_client ON quote_requests;

-- Keep the other triggers (they're fine)
-- trigger_set_quote_reference - generates quote reference number
-- trigger_update_quote_requests_updated_at - updates timestamp