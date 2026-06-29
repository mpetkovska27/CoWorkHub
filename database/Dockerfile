FROM postgres:16-alpine

COPY queries/coworkhub.sql    /docker-entrypoint-initdb.d/01_schema.sql
COPY queries/procedures.sql   /docker-entrypoint-initdb.d/02_procedures.sql
COPY queries/report_1.sql     /docker-entrypoint-initdb.d/03_report_1.sql
COPY queries/report_2.sql     /docker-entrypoint-initdb.d/04_report_2.sql
COPY queries/seed_data.sql    /docker-entrypoint-initdb.d/05_seed.sql
