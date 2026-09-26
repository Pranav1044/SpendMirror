-- Automatically create a profiles row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, default_currency)
  values (new.id, 'INR')
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Attach the function to run after every new signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: create profiles for anyone who already signed up before this trigger existed
insert into public.profiles (id, default_currency)
select id, 'INR'
from auth.users
on conflict (id) do nothing;