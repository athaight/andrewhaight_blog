-- Adds weighted full-text search vectors and search RPC for published posts.

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS fts tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(content, '')), 'C')
) STORED;

ALTER TABLE personal_posts
ADD COLUMN IF NOT EXISTS fts tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(content, '')), 'C')
) STORED;

CREATE INDEX IF NOT EXISTS posts_fts_idx ON posts USING gin(fts);
CREATE INDEX IF NOT EXISTS personal_posts_fts_idx ON personal_posts USING gin(fts);

CREATE OR REPLACE FUNCTION search_published_posts(
  search_query text,
  include_personal boolean DEFAULT false
)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  excerpt text,
  type text,
  tags text[],
  created_at timestamptz,
  rank real
) AS $$
DECLARE
  query tsquery;
BEGIN
  IF search_query IS NULL OR btrim(search_query) = '' THEN
    RETURN;
  END IF;

  query := websearch_to_tsquery('english', search_query);

  IF query = ''::tsquery THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.type,
    p.tags,
    p.created_at,
    ts_rank(p.fts, query) AS rank
  FROM posts p
  WHERE p.published = true
    AND p.fts @@ query

  UNION ALL

  SELECT
    pp.id,
    pp.title,
    pp.slug,
    pp.excerpt,
    pp.type,
    pp.tags,
    pp.created_at,
    ts_rank(pp.fts, query) AS rank
  FROM personal_posts pp
  WHERE include_personal
    AND pp.published = true
    AND pp.fts @@ query

  ORDER BY rank DESC, created_at DESC;
END;
$$ LANGUAGE plpgsql;
