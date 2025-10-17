-- Migration: AI Features
-- Add tables for embeddings, explanations, and AI-generated content

-- Enable pgvector extension for embeddings (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Embeddings table for semantic search
CREATE TABLE IF NOT EXISTS embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL,
  embedding TEXT NOT NULL, -- Store as JSON string for now, migrate to vector type later
  model VARCHAR(100) DEFAULT 'gte-small',
  dimensions INTEGER DEFAULT 384,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resource_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_embeddings_resource_id ON embeddings(resource_id);

-- Explanations table to track AI-generated explanations
CREATE TABLE IF NOT EXISTS explanations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  node_id VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100) NOT NULL,
  explanation TEXT NOT NULL,
  confidence FLOAT DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_explanations_user_id ON explanations(user_id);
CREATE INDEX IF NOT EXISTS idx_explanations_created_at ON explanations(created_at DESC);

-- Quiz generations table to track AI-generated quizzes
CREATE TABLE IF NOT EXISTS quiz_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  concept VARCHAR(200) NOT NULL,
  difficulty VARCHAR(20) DEFAULT 'medium',
  num_questions INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_quiz_generations_user_id ON quiz_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_generations_created_at ON quiz_generations(created_at DESC);

-- Resources table (if not exists)
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  type VARCHAR(50),
  difficulty VARCHAR(20),
  url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nodes table (if not exists)
CREATE TABLE IF NOT EXISTS nodes (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  concept VARCHAR(200),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for embeddings
DROP TRIGGER IF EXISTS update_embeddings_updated_at ON embeddings;
CREATE TRIGGER update_embeddings_updated_at
  BEFORE UPDATE ON embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for resources
DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for nodes
DROP TRIGGER IF EXISTS update_nodes_updated_at ON nodes;
CREATE TRIGGER update_nodes_updated_at
  BEFORE UPDATE ON nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE embeddings IS 'Stores vector embeddings for semantic search of resources';
COMMENT ON TABLE explanations IS 'Tracks AI-generated explanations for recommendations';
COMMENT ON TABLE quiz_generations IS 'Tracks AI-generated quiz requests';
COMMENT ON TABLE resources IS 'Learning resources (videos, articles, etc.)';
COMMENT ON TABLE nodes IS 'Learning path nodes (concepts)';


