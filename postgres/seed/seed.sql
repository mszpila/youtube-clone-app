BEGIN TRANSACTION;

INSERT into users (name, email, entries, joined_at) values ('test', 'test@example.com', 4, '2020-01-01')

COMMIT;