-- Run as postgres after every migration. Runtime credentials cannot run DDL.
REVOKE ALL ON DATABASE strikefirst FROM PUBLIC;
GRANT CONNECT ON DATABASE strikefirst TO strikefirst_app;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO strikefirst_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO strikefirst_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO strikefirst_app;
REVOKE ALL ON TABLE public._prisma_migrations FROM strikefirst_app;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO strikefirst_app;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO strikefirst_app;
