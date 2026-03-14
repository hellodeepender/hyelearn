-- Enable UUID
create extension if not exists "uuid-ossp";

-- Schools table
create table schools (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  created_at timestamp with time zone default now()
);

-- Profiles table (extends Supabase auth.users)
create type user_role as enum ('teacher', 'student', 'admin');
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role user_role not null,
  school_id uuid references schools(id),
  full_name text not null,
  grade_level int,
  created_at timestamp with time zone default now()
);

-- Classes table
create table classes (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid references schools(id),
  teacher_id uuid references profiles(id),
  name text not null,
  grade_level int not null,
  join_code text unique not null,
  created_at timestamp with time zone default now()
);

-- Class students junction
create table class_students (
  class_id uuid references classes(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  joined_at timestamp with time zone default now(),
  primary key (class_id, student_id)
);

-- Exercise sessions (stores completed practice results)
create table exercise_sessions (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references profiles(id),
  class_id uuid references classes(id),
  subject text not null,
  topic text not null,
  exercise_type text not null,
  grade_level int not null,
  score int not null,
  total int not null,
  exercises_data jsonb,
  completed_at timestamp with time zone default now()
);

-- Seed default school for MVP
insert into schools (name, slug) values ('AGBU MDS', 'agbu-mds');

-- Row Level Security policies
alter table profiles enable row level security;
alter table classes enable row level security;
alter table class_students enable row level security;
alter table exercise_sessions enable row level security;

-- Profiles: users can read own profile, insert on signup
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Teachers can view students in their classes
create policy "Teachers can view class students" on profiles for select using (
  exists (
    select 1 from class_students cs
    join classes c on cs.class_id = c.id
    where cs.student_id = profiles.id and c.teacher_id = auth.uid()
  )
);

-- Classes: teachers can CRUD their own classes, students can view classes they're in
create policy "Teachers manage own classes" on classes for all using (teacher_id = auth.uid());
create policy "Students view joined classes" on classes for select using (
  exists (select 1 from class_students where class_id = classes.id and student_id = auth.uid())
);

-- Class students: teachers can manage, students can join
create policy "Teachers manage class roster" on class_students for all using (
  exists (select 1 from classes where id = class_id and teacher_id = auth.uid())
);
create policy "Students can join classes" on class_students for insert with check (student_id = auth.uid());
create policy "Students view own memberships" on class_students for select using (student_id = auth.uid());

-- Exercise sessions: students own their data, teachers can view their students' data
create policy "Students manage own sessions" on exercise_sessions for all using (student_id = auth.uid());
create policy "Teachers view student sessions" on exercise_sessions for select using (
  exists (
    select 1 from class_students cs
    join classes c on cs.class_id = c.id
    where cs.student_id = exercise_sessions.student_id and c.teacher_id = auth.uid()
  )
);

-- Auto-create profile on signup via trigger
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
