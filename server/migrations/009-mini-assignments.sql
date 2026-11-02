CREATE TABLE mini_assignments (
 owner_id TEXT NOT NULL REFERENCES users(id),
 sitting TEXT NOT NULL,
 revision TEXT NOT NULL,
 payload TEXT NOT NULL,
 created_at TEXT NOT NULL,
 PRIMARY KEY(owner_id,sitting)
);
