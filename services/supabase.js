import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const webStorage = {
  getItem: (key) => Promise.resolve(globalThis.localStorage?.getItem(key) ?? null),
  setItem: (key, value) => {
    globalThis.localStorage?.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    globalThis.localStorage?.removeItem(key);
    return Promise.resolve();
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? webStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
