-- User content approval is independent from AI association review/publication.
CREATE TABLE bank_content_state(import_id TEXT PRIMARY KEY REFERENCES bank_imports(id),revision INTEGER NOT NULL DEFAULT 0);
CREATE TABLE bank_content_reviews(import_id TEXT NOT NULL REFERENCES bank_imports(id),question_id TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('approved','returned')),reason TEXT NOT NULL,actor TEXT NOT NULL REFERENCES users(id),reviewed_at TEXT NOT NULL,PRIMARY KEY(import_id,question_id));
CREATE TABLE bank_content_audit(id INTEGER PRIMARY KEY,import_id TEXT NOT NULL REFERENCES bank_imports(id),payload TEXT NOT NULL,actor TEXT NOT NULL REFERENCES users(id),created_at TEXT NOT NULL);
