-- Função para criar perfil automaticamente ao registrar usuário
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Usuário'),
    coalesce(new.raw_user_meta_data ->> 'phone', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger para criar perfil automaticamente
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Função para atualizar updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Triggers para atualizar updated_at
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

drop trigger if exists service_providers_updated_at on public.service_providers;
create trigger service_providers_updated_at
  before update on public.service_providers
  for each row
  execute function public.handle_updated_at();

drop trigger if exists services_updated_at on public.services;
create trigger services_updated_at
  before update on public.services
  for each row
  execute function public.handle_updated_at();

drop trigger if exists service_requests_updated_at on public.service_requests;
create trigger service_requests_updated_at
  before update on public.service_requests
  for each row
  execute function public.handle_updated_at();

-- Função para atualizar rating do prestador após nova avaliação
create or replace function public.update_provider_rating()
returns trigger
language plpgsql
as $$
begin
  update public.service_providers
  set 
    rating = (
      select avg(rating)::numeric(3, 2)
      from public.reviews
      where provider_id = new.provider_id
    ),
    total_reviews = (
      select count(*)
      from public.reviews
      where provider_id = new.provider_id
    )
  where id = new.provider_id;
  return new;
end;
$$;

-- Trigger para atualizar rating do prestador
drop trigger if exists reviews_update_rating on public.reviews;
create trigger reviews_update_rating
  after insert on public.reviews
  for each row
  execute function public.update_provider_rating();
