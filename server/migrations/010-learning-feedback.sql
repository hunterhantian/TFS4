CREATE TABLE learning_feedback (
 id TEXT PRIMARY KEY,
 owner_id TEXT NOT NULL REFERENCES users(id),
 node_id TEXT NOT NULL,
 comment TEXT NOT NULL,
 created_at TEXT NOT NULL
);
CREATE INDEX learning_feedback_owner ON learning_feedback(owner_id,created_at);
