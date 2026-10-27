-- Stage2 candidate storage is separate from immutable Stage1 sources/snapshots.
CREATE TABLE bank_imports (
 id TEXT PRIMARY KEY,
 source_id TEXT,
 source_version INTEGER,
 fingerprint TEXT NOT NULL UNIQUE,
 status TEXT NOT NULL CHECK(status IN ('invalid','candidate')),
 payload TEXT NOT NULL,
 diagnostics TEXT NOT NULL,
 created_by TEXT NOT NULL REFERENCES users(id),
 created_at TEXT NOT NULL,
 UNIQUE(source_id,source_version)
);
