import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Browser client (singleton)
let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

// Server client (new instance per request)
export function getSupabaseServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}

// Admin client — bypasses RLS, server-side only
export function getSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Type definitions matching our schema
export interface ScheduleRow {
  id: string;
  show_name: string;
  dj_name: string | null;
  day_of_week: number; // 0=Mon, 6=Sun
  start_time: string;
  end_time: string;
  show_type: "live" | "replay" | "guest" | "special";
  created_at: string;
}

export interface DJRow {
  id: string;
  name: string;
  bio: string | null;
  photo_url: string | null;
  socials: {
    soundcloud?: string;
    instagram?: string;
    mixcloud?: string;
  } | null;
  is_resident: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  created_at: string;
  username: string;
  message: string;
  color: string;
}

export interface ShowRow {
  id: string;
  youtube_id: string;
  title: string;
  lineup: string | null;
  duration_min: number | null;
  lufs: number | null;
  clipping_status: string | null;
  azuracast_id: number | null;
  azuracast_path: string | null;
  uploaded_at: string;
  created_at: string;
}

export interface EventRow {
  id: string;
  name: string;
  description: string | null;
  date: string;
  venue: string | null;
  flyer_url: string | null;
  ticket_url: string | null;
  tags: string[];
  created_at: string;
}
