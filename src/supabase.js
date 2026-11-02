import { createClient } from '@supabase/supabase-js';

// Default Supabase configuration (reads from Vite env vars, constants, or localStorage)
const DEFAULT_SUPABASE_URL = 'https://vlslbpagvytnifxfmofc.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsc2xicGFndnl0bmlmeGZtb2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTU5MTUsImV4cCI6MjEwODg3MTkxNX0.XgBA7QovQcthKqJ4QfqtcakukO62JIz-lfNbK-XM3b0';

const getSupabaseConfig = () => {
  const envUrl = import.meta.env?.VITE_SUPABASE_URL;
  const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
  const localUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('supabase_url') : null;
  const localKey = typeof localStorage !== 'undefined' ? localStorage.getItem('supabase_anon_key') : null;

  return {
    url: envUrl || localUrl || DEFAULT_SUPABASE_URL,
    key: envKey || localKey || DEFAULT_SUPABASE_ANON_KEY
  };
};

let _supabaseClient = null;
let _realtimeBroadcastChannel = null;

export function getSupabase() {
  if (_supabaseClient) return _supabaseClient;

  const config = getSupabaseConfig();
  if (config.url && config.key) {
    try {
      _supabaseClient = createClient(config.url, config.key, {
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });
      return _supabaseClient;
    } catch (err) {
      console.warn('Could not initialize Supabase client:', err);
    }
  }
  return null;
}

export function getRealtimeBroadcastChannel() {
  const supabase = getSupabase();
  if (!supabase) return null;
  if (!_realtimeBroadcastChannel) {
    _realtimeBroadcastChannel = supabase.channel('devcon_garden_realtime');
    _realtimeBroadcastChannel.subscribe((status) => {
      console.log('Supabase Realtime Channel Status:', status);
    });
  }
  return _realtimeBroadcastChannel;
}

export function isCloudConfigured() {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.key);
}

/**
 * Configure Supabase credentials dynamically (can be called from console or UI settings)
 */
export function setSupabaseCredentials(url, key) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('supabase_url', url.trim());
    localStorage.setItem('supabase_anon_key', key.trim());
  }
  _supabaseClient = null;
  return getSupabase();
}

/**
 * Uploads video recording blob to Supabase Storage bucket 'videos'
 */
export async function uploadVideoToCloud(videoBlob, filename) {
  const supabase = getSupabase();
  if (!supabase || !videoBlob) return null;

  try {
    const filePath = `devcon_2026/${filename}`;
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filePath, videoBlob, {
        cacheControl: '3600',
        upsert: true,
        contentType: videoBlob.type || 'video/webm'
      });

    if (error) {
      console.warn('Supabase video upload notice:', error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl || null;
  } catch (err) {
    console.warn('Video upload error:', err);
    return null;
  }
}

/**
 * Saves visitor choreography metadata and motion frames to Cloud Database
 * and broadcasts real-time event to iPad TV display
 */
export async function saveChoreographyToCloud(flowerData, videoBlob = null) {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, reason: 'unconfigured' };
  }

  try {
    let videoUrl = null;
    if (videoBlob) {
      const safeName = (flowerData.name || 'bloom').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${safeName}_${Date.now()}.webm`;
      videoUrl = await uploadVideoToCloud(videoBlob, filename);
    }

    const payload = {
      id: flowerData.id || `flower_${Date.now()}`,
      name: flowerData.name,
      choreographer: flowerData.choreographer || 'Devcon Gardener',
      species: flowerData.species || 'periwinkle',
      duration: flowerData.duration || 10.0,
      fps: flowerData.fps || 20,
      frames: flowerData.frames || [],
      video_url: videoUrl,
      created_at: new Date().toISOString()
    };

    // 1. Insert into persistent Postgres table
    const { error } = await supabase
      .from('choreographies')
      .insert([payload]);

    if (error) {
      console.warn('Supabase database insert warning:', error.message);
    }

    // 2. Broadcast real-time websocket ping directly to iPad / TV
    try {
      const channel = getRealtimeBroadcastChannel();
      if (channel) {
        channel.send({
          type: 'broadcast',
          event: 'NEW_BLOOM',
          payload: {
            ...payload,
            namasteBranchCount: flowerData.namasteBranchCount || 0,
            isPlanted: true
          }
        });
      }
    } catch (_) {}

    return { success: true, data: payload, videoUrl };
  } catch (err) {
    console.warn('Cloud save error:', err);
    return { success: false, error: err };
  }
}

/**
 * Fetches all visitor-planted choreographies stored in Cloud Database
 */
export async function fetchCloudChoreographies() {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('choreographies')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.warn('Error fetching cloud choreographies:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      choreographer: row.choreographer,
      species: row.species,
      duration: row.duration,
      fps: row.fps,
      frames: row.frames,
      namasteBranchCount: (row.namaste_branch_count !== undefined && row.namaste_branch_count !== null)
        ? Number(row.namaste_branch_count)
        : (Array.isArray(row.frames) && row.frames.length > 0
          ? Math.max(0, ...row.frames.map(f => Number(f.namasteBranchCount || 0)))
          : 0),
      videoUrl: row.video_url,
      timestamp: new Date(row.created_at).getTime(),
      isPlanted: true
    }));
  } catch (err) {
    console.warn('Could not fetch from cloud database:', err);
    return [];
  }
}

/**
 * Subscribes to real-time new flower creations across devices (Mac Laptop -> iPad / TV)
 */
export function subscribeToNewBlooms(onNewBloomCallback) {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const channel = supabase
      .channel('devcon_garden_realtime')
      // 1. Instant WebSocket broadcast for sub-50ms sync
      .on('broadcast', { event: 'NEW_BLOOM' }, (event) => {
        if (event.payload && typeof onNewBloomCallback === 'function') {
          onNewBloomCallback(event.payload);
        }
      })
      // 2. Postgres change listener for durability
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'choreographies' },
        (payload) => {
          if (payload.new && typeof onNewBloomCallback === 'function') {
            const extra = (payload.new.namaste_branch_count !== undefined && payload.new.namaste_branch_count !== null)
              ? Number(payload.new.namaste_branch_count)
              : (Array.isArray(payload.new.frames) && payload.new.frames.length > 0
                ? Math.max(0, ...payload.new.frames.map(f => Number(f.namasteBranchCount || 0)))
                : 0);
            onNewBloomCallback({
              ...payload.new,
              namasteBranchCount: extra,
              isPlanted: true
            });
          }
        }
      )
      .subscribe();

    return channel;
  } catch (err) {
    console.warn('Realtime subscription error:', err);
    return null;
  }
}

