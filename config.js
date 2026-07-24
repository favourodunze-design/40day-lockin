// Vercel serverless function — GET /api/config
// Reads Supabase connection details from environment variables set in the
// Vercel dashboard (Project Settings -> Environment Variables) so every
// device that opens the site auto-connects, with no manual "Set up sync"
// step required.
//
// Required env vars:
//   SUPABASE_URL       - your Supabase Project URL
//   SUPABASE_ANON_KEY  - your Supabase anon public key
//   SUPABASE_SYNC_ID   - the shared sync code (reuse the one your app
//                        already generated so existing data carries over)

module.exports = (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  const syncId = process.env.SUPABASE_SYNC_ID;

  res.setHeader('Cache-Control', 'no-store');

  if (!supabaseUrl || !supabaseKey || !syncId) {
    res.status(200).json({ configured: false });
    return;
  }

  res.status(200).json({ configured: true, supabaseUrl, supabaseKey, syncId });
};
