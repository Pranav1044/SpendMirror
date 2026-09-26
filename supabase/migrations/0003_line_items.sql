alter table public.transactions
  add column if not exists line_items jsonb;

comment on column public.transactions.line_items is
  'Array of {item_name, price, quantity} extracted from itemized order emails. Null for non-itemized transactions (bank/UPI alerts).';