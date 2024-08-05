CREATE TABLE feeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  last_check DATETIME
);

CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feed_id INTEGER,
  guid TEXT NOT NULL,
  title TEXT,
  link TEXT,
  pub_date DATETIME,
  FOREIGN KEY (feed_id) REFERENCES feeds(id)
);
