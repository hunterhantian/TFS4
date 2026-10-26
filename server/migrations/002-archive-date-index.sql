CREATE INDEX reports_owner_submitted_at ON reports(owner_id,json_extract(payload,'$.submittedAt'));
CREATE INDEX reports_submitted_at ON reports(json_extract(payload,'$.submittedAt'));
