-- À exécuter une fois dans Supabase : SQL Editor > New query > Run.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  description text not null default '',
  priority text not null default 'moyenne'
    check (priority in ('faible', 'moyenne', 'elevee')),
  status text not null default 'a_faire'
    check (status in ('a_faire', 'terminee')),
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

grant select, insert, update, delete on public.tasks to anon;

-- Application sans connexion : toute personne possédant la clé publique
-- peut lire et modifier les tâches. Acceptable pour une démo uniquement.
drop policy if exists "Acces public aux taches" on public.tasks;
create policy "Acces public aux taches"
  on public.tasks
  for all
  to anon
  using (true)
  with check (true);
