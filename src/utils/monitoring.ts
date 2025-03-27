import { supabase } from '../lib/supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { logAuthEvent } from '../lib/supabase';

export const monitorAuthFlow = () => {
  if (import.meta.env.PROD) {
    // Monitor auth state changes
    supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      logAuthEvent(event, {
        userId: session?.user?.id,
        timestamp: new Date().toISOString()
      });
    });

    // Monitor navigation to key pages
    window.addEventListener('routechange', (e: CustomEvent) => {
      logAuthEvent('navigation', {
        path: e.detail.path,
        timestamp: new Date().toISOString()
      });
    });
  }
}; 