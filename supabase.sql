-- À exécuter une fois dans Supabase : SQL Editor > New query > coller > Run.
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  canal text not null,
  auteur_id text not null,
  auteur text not null,
  grade text,
  service text,
  texte text not null,
  modifie boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists messages_canal_id on public.messages (canal, id);

create table if not exists public.suspensions (
  matricule text primary key,
  raison text,
  par text,
  ts timestamptz not null default now()
);

alter table public.messages enable row level security;
alter table public.suspensions enable row level security;

-- Le site est statique : la clé publique doit pouvoir lire et écrire.
-- La protection est donc au niveau de l'interface (voir les limites dans le message de livraison).
create policy "msg_all" on public.messages for all to anon using (true) with check (true);
create policy "susp_all" on public.suspensions for all to anon using (true) with check (true);
