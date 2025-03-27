import { describe, it, expect, beforeEach } from 'vitest';
import { supabase } from '../lib/supabase';

describe('Authentication Flow', () => {
  beforeEach(async () => {
    // Sign out before each test
    await supabase.auth.signOut();
  });

  it('should handle Google sign-in redirect', async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173'
      }
    });
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should get current session', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current session:', session);
  });
}); 