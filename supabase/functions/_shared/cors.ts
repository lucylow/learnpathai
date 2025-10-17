// Shared CORS headers for all Edge Functions
// Allows frontend to call these functions from any origin

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

