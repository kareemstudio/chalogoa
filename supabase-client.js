// Initializes the Supabase client when configured.
// Exposes window.SB = { client, mode }  (mode: "live" | "local")
(function () {
  const SB = { client: null, mode: "local" };
  try {
    const cfg = window.SUPABASE_CONFIG || {};
    const ready = cfg.url && cfg.anonKey && !String(cfg.anonKey).includes("PASTE");
    if (ready && window.supabase && window.supabase.createClient) {
      SB.client = window.supabase.createClient(cfg.url, cfg.anonKey, {
        realtime: { params: { eventsPerSecond: 20 } }
      });
      SB.mode = "live";
    }
  } catch (e) {
    SB.client = null;
    SB.mode = "local";
  }
  window.SB = SB;
})();
