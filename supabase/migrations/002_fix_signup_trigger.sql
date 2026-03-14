-- Ensure seed school exists
insert into schools (name, slug) values ('AGBU MDS', 'agbu-mds') on conflict (slug) do nothing;

-- Replace trigger with defensive version
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, school_id)
  values (
    new.id,
    (coalesce(new.raw_user_meta_data->>'role', 'student'))::user_role,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    (select id from schools where slug = 'agbu-mds' limit 1)
  );
  return new;
exception when others then
  raise log 'handle_new_user error: %', sqlerrm;
  return new;
end;
$$ language plpgsql security definer;
