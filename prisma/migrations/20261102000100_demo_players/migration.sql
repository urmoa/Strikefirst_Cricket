-- Demo player profiles for game search; these are not login accounts.
-- Keep existing profiles unchanged if a demo slug already exists.
INSERT INTO "Player" ("displayName", "slug", "joinedAt", "createdAt", "updatedAt")
VALUES
  ('Martin Tamm', 'demo-martin-tamm', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Anna Kask', 'demo-anna-kask', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Marko Saar', 'demo-marko-saar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Laura Sepp', 'demo-laura-sepp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Jaan Oja', 'demo-jaan-oja', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Mari Mets', 'demo-mari-mets', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Karl Ilves', 'demo-karl-ilves', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Liisa Kivi', 'demo-liisa-kivi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Andres Paju', 'demo-andres-paju', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Kati Kuusk', 'demo-kati-kuusk', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Robert Lepp', 'demo-robert-lepp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Sandra Aas', 'demo-sandra-aas', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
