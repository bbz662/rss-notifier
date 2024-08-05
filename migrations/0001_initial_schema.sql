-- Migration 0001: Initial schema

-- Create feeds table
CREATE TABLE IF NOT EXISTS feeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  last_check DATETIME
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feed_id INTEGER,
  guid TEXT NOT NULL,
  title TEXT,
  link TEXT,
  pub_date DATETIME,
  FOREIGN KEY (feed_id) REFERENCES feeds(id),
  UNIQUE (feed_id, guid)
);

-- Create index on feeds table
CREATE INDEX IF NOT EXISTS idx_feeds_url ON feeds(url);

-- Create index on items table
CREATE INDEX IF NOT EXISTS idx_items_feed_id ON items(feed_id);
CREATE INDEX IF NOT EXISTS idx_items_pub_date ON items(pub_date);
