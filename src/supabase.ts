import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://haixofmqptipzqvmonzg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhaXhvZm1xcHRpcHpxdm1vbnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDA1NjAsImV4cCI6MjA4Nzc3NjU2MH0.K2T7wZJVKdVxwuCoPQykFd5fVZ6U9ozogqsSB7zu-oU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});