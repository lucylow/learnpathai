-- =====================================================
-- API Integration Suite Database Schema
-- Supports caching, usage tracking, and cost management
-- =====================================================

-- API Cache Table
-- Stores API responses to reduce costs and improve performance
CREATE TABLE IF NOT EXISTS api_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key TEXT UNIQUE NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    access_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Usage Logs Table
-- Tracks all API calls for analytics and cost monitoring
CREATE TABLE IF NOT EXISTS api_usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider TEXT NOT NULL,
    cost DECIMAL(10,4) NOT NULL DEFAULT 0,
    success BOOLEAN NOT NULL,
    monthly_cost DECIMAL(10,4) NOT NULL DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Generation Logs Table
-- Tracks content generation requests from users
CREATE TABLE IF NOT EXISTS content_generation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('quiz_questions', 'explanation', 'flashcards', 'summary')),
    provider TEXT NOT NULL,
    cost DECIMAL(10,4) NOT NULL DEFAULT 0,
    cached BOOLEAN DEFAULT FALSE,
    input_text TEXT,
    output_preview TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    generation_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Provider Configuration Table
-- Stores provider settings and credentials (encrypted)
CREATE TABLE IF NOT EXISTS api_providers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    api_key_encrypted TEXT, -- Use Supabase Vault or environment variables in production
    enabled BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 1, -- Lower = higher priority
    monthly_budget DECIMAL(10,4) DEFAULT 50.00,
    rate_limit INTEGER DEFAULT 100, -- requests per minute
    rate_limit_window INTEGER DEFAULT 60000, -- milliseconds
    base_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Content Storage Table
-- Stores successfully generated content for reuse
CREATE TABLE IF NOT EXISTS generated_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_type TEXT NOT NULL,
    provider TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT,
    content JSONB NOT NULL,
    quality_score DECIMAL(3,2), -- 0.00 to 1.00
    usage_count INTEGER DEFAULT 0,
    positive_feedback INTEGER DEFAULT 0,
    negative_feedback INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Cache indexes
CREATE INDEX IF NOT EXISTS idx_api_cache_key ON api_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires ON api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_cache_access_count ON api_cache(access_count DESC);

-- Usage logs indexes
CREATE INDEX IF NOT EXISTS idx_api_usage_provider ON api_usage_logs(provider);
CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_success ON api_usage_logs(success);
CREATE INDEX IF NOT EXISTS idx_api_usage_cost ON api_usage_logs(cost DESC);

-- Content generation logs indexes
CREATE INDEX IF NOT EXISTS idx_content_gen_user ON content_generation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_content_gen_type ON content_generation_logs(content_type);
CREATE INDEX IF NOT EXISTS idx_content_gen_provider ON content_generation_logs(provider);
CREATE INDEX IF NOT EXISTS idx_content_gen_created ON content_generation_logs(created_at DESC);

-- Generated content indexes
CREATE INDEX IF NOT EXISTS idx_generated_content_topic ON generated_content(topic);
CREATE INDEX IF NOT EXISTS idx_generated_content_type ON generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_generated_content_quality ON generated_content(quality_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_generated_content_tags ON generated_content USING GIN (tags);

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_api_cache_updated_at
    BEFORE UPDATE ON api_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_providers_updated_at
    BEFORE UPDATE ON api_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_content_updated_at
    BEFORE UPDATE ON generated_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM api_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get monthly API cost for a provider
CREATE OR REPLACE FUNCTION get_monthly_cost(provider_name TEXT DEFAULT NULL)
RETURNS DECIMAL AS $$
DECLARE
    total DECIMAL;
    start_of_month TIMESTAMPTZ;
BEGIN
    start_of_month := DATE_TRUNC('month', CURRENT_DATE);
    
    IF provider_name IS NULL THEN
        SELECT COALESCE(SUM(cost), 0) INTO total
        FROM api_usage_logs
        WHERE created_at >= start_of_month;
    ELSE
        SELECT COALESCE(SUM(cost), 0) INTO total
        FROM api_usage_logs
        WHERE created_at >= start_of_month
        AND provider = provider_name;
    END IF;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Function to get provider statistics
CREATE OR REPLACE FUNCTION get_provider_stats(
    provider_name TEXT,
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    provider TEXT,
    total_requests BIGINT,
    successful_requests BIGINT,
    failed_requests BIGINT,
    success_rate DECIMAL,
    total_cost DECIMAL,
    average_response_time DECIMAL,
    cache_hit_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        provider_name,
        COUNT(*)::BIGINT as total_requests,
        COUNT(*) FILTER (WHERE success = true)::BIGINT as successful_requests,
        COUNT(*) FILTER (WHERE success = false)::BIGINT as failed_requests,
        ROUND(
            (COUNT(*) FILTER (WHERE success = true)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 
            2
        ) as success_rate,
        COALESCE(SUM(cost), 0) as total_cost,
        ROUND(
            AVG((metadata->>'generationTime')::DECIMAL) FILTER (WHERE metadata->>'generationTime' IS NOT NULL),
            2
        ) as average_response_time,
        -- Calculate cache hit rate from content generation logs
        (
            SELECT ROUND(
                (COUNT(*) FILTER (WHERE cached = true)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
                2
            )
            FROM content_generation_logs
            WHERE content_generation_logs.provider = provider_name
            AND created_at >= NOW() - INTERVAL '1 day' * days_back
        ) as cache_hit_rate
    FROM api_usage_logs
    WHERE api_usage_logs.provider = provider_name
    AND created_at >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY provider_name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on tables
ALTER TABLE content_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

-- Users can view their own content generation logs
CREATE POLICY "Users can view own content logs"
    ON content_generation_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can do anything
CREATE POLICY "Service role full access to content logs"
    ON content_generation_logs
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Anyone can read generated content (public knowledge base)
CREATE POLICY "Anyone can read generated content"
    ON generated_content
    FOR SELECT
    USING (true);

-- Only service role can insert/update generated content
CREATE POLICY "Service role can modify generated content"
    ON generated_content
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- Initial Provider Configuration
-- =====================================================

INSERT INTO api_providers (name, enabled, priority, monthly_budget, rate_limit, base_url) VALUES
    ('openai', true, 1, 50.00, 1000, 'https://api.openai.com/v1'),
    ('questgen', true, 2, 20.00, 100, 'https://api.questgen.ai'),
    ('quizgecko', true, 3, 15.00, 200, 'https://api.quizgecko.com'),
    ('quillionz', true, 4, 10.00, 50, 'https://api.quillionz.com'),
    ('opexams', true, 5, 5.00, 100, 'https://api.opexams.com')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- Scheduled Jobs (requires pg_cron extension)
-- =====================================================

-- Clean up expired cache entries daily at 2 AM
-- Uncomment if pg_cron is available:
-- SELECT cron.schedule('cleanup-expired-cache', '0 2 * * *', 'SELECT cleanup_expired_cache();');

-- =====================================================
-- Views for Analytics
-- =====================================================

-- View for daily API usage summary
CREATE OR REPLACE VIEW daily_api_usage AS
SELECT 
    DATE(created_at) as date,
    provider,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE success = true) as successful_requests,
    ROUND(SUM(cost), 2) as total_cost,
    ROUND(AVG((metadata->>'generationTime')::DECIMAL), 2) as avg_response_time_ms
FROM api_usage_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), provider
ORDER BY date DESC, provider;

-- View for content generation statistics
CREATE OR REPLACE VIEW content_generation_stats AS
SELECT 
    content_type,
    provider,
    COUNT(*) as total_generated,
    COUNT(*) FILTER (WHERE cached = true) as from_cache,
    COUNT(*) FILTER (WHERE success = true) as successful,
    ROUND(AVG(generation_time_ms), 2) as avg_generation_time_ms,
    ROUND(SUM(cost), 2) as total_cost
FROM content_generation_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY content_type, provider;

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE api_cache IS 'Caches API responses to reduce costs and improve performance';
COMMENT ON TABLE api_usage_logs IS 'Tracks all API calls for analytics and cost monitoring';
COMMENT ON TABLE content_generation_logs IS 'Logs content generation requests from users';
COMMENT ON TABLE api_providers IS 'Configuration and settings for API providers';
COMMENT ON TABLE generated_content IS 'Stores successfully generated content for reuse';

COMMENT ON FUNCTION get_monthly_cost IS 'Calculates total API cost for current month, optionally filtered by provider';
COMMENT ON FUNCTION get_provider_stats IS 'Returns comprehensive statistics for a provider over specified time period';
COMMENT ON FUNCTION cleanup_expired_cache IS 'Removes expired entries from the cache table';

