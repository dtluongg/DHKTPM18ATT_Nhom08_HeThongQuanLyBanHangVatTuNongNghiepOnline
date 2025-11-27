-- Flyway migration: add total_pay column to orders
alter table orders
add column if not exists total_pay numeric not null default 0;
