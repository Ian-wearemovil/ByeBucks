create table bills (
  id serial primary key,
  owner text not null,
  name text not null,
  amount numeric(10, 2) not null,
  due_date date not null,
  month integer not null,
  year integer not null,
  is_recurring boolean not null default false,
  is_paid boolean not null default false,
  paid_at timestamptz,
  receipt_url text,
  notification_days integer not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bills_owner_idx on bills(owner);
create index bills_due_date_idx on bills(due_date);
create index bills_month_year_idx on bills(month, year);
