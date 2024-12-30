import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vhlhoymotkhuaccwysuo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZobGhveW1vdGtodWFjY3d5c3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxMjkyNjgsImV4cCI6MjA0ODcwNTI2OH0.QqExBarpYZVYUvtSBS9Qj9aQRHiAhc7T9TzRaMsmu5I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);