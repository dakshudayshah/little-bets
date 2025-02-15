import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sagibocqjyjeuzxhrfoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZ2lib2NxanlqZXV6eGhyZm9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MzIzMDQsImV4cCI6MjA1NTIwODMwNH0.rtD4QH74va0T1HxpQcBxVAQutQAXoIfMVM8mQTcSjwk';

export const supabase = createClient(supabaseUrl, supabaseKey); 