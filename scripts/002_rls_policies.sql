-- RLS Policies para profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS Policies para service_providers
create policy "Anyone can view active providers"
  on public.service_providers for select
  using (is_active = true);

create policy "Providers can update their own info"
  on public.service_providers for update
  using (auth.uid() = user_id);

-- RLS Policies para service_categories
create policy "Anyone can view active categories"
  on public.service_categories for select
  using (is_active = true);

-- RLS Policies para services
create policy "Anyone can view active services"
  on public.services for select
  using (is_active = true);

create policy "Providers can manage their services"
  on public.services for all
  using (provider_id in (select id from public.service_providers where user_id = auth.uid()));

-- RLS Policies para service_requests
create policy "Customers can view their own requests"
  on public.service_requests for select
  using (auth.uid() = customer_id);

create policy "Providers can view requests assigned to them"
  on public.service_requests for select
  using (provider_id in (select id from public.service_providers where user_id = auth.uid()));

create policy "Customers can create requests"
  on public.service_requests for insert
  with check (auth.uid() = customer_id);

create policy "Customers can update their requests"
  on public.service_requests for update
  using (auth.uid() = customer_id);

create policy "Providers can update assigned requests"
  on public.service_requests for update
  using (provider_id in (select id from public.service_providers where user_id = auth.uid()));

-- RLS Policies para messages
create policy "Users can view messages from their requests"
  on public.messages for select
  using (
    request_id in (
      select id from public.service_requests 
      where customer_id = auth.uid()
      or provider_id in (select id from public.service_providers where user_id = auth.uid())
    )
  );

create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "Users can mark their messages as read"
  on public.messages for update
  using (
    request_id in (
      select id from public.service_requests 
      where customer_id = auth.uid()
      or provider_id in (select id from public.service_providers where user_id = auth.uid())
    )
  );

-- RLS Policies para reviews
create policy "Anyone can view reviews"
  on public.reviews for select
  using (true);

create policy "Customers can create reviews for completed requests"
  on public.reviews for insert
  with check (
    auth.uid() = customer_id
    and request_id in (select id from public.service_requests where status = 'completed' and customer_id = auth.uid())
  );

-- Enable RLS on monetization tables
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.transactions enable row level security;
alter table public.highlights enable row level security;
alter table public.maintenance_contracts enable row level security;

-- RLS Policies for plans
create policy "Anyone can view active plans"
  on public.plans for select
  using (is_active = true);

-- RLS Policies for subscriptions
create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can manage their own subscriptions"
  on public.subscriptions for all
  using (auth.uid() = user_id);

-- RLS Policies for transactions
create policy "Providers can view transactions for their services"
  on public.transactions for select
  using (provider_id in (select id from public.service_providers where user_id = auth.uid()));

create policy "Clients can view their own transactions"
  on public.transactions for select
  using (auth.uid() = client_id);

-- RLS Policies for highlights
create policy "Providers can view their own highlights"
  on public.highlights for select
  using (provider_id in (select id from public.service_providers where user_id = auth.uid()));

create policy "Providers can manage their own highlights"
  on public.highlights for all
  using (provider_id in (select id from public.service_providers where user_id = auth.uid()));

-- RLS Policies for maintenance_contracts
create policy "Clients can view their own maintenance contracts"
  on public.maintenance_contracts for select
  using (auth.uid() = client_id);

create policy "Providers can view maintenance contracts assigned to them"
  on public.maintenance_contracts for select
  using (provider_id in (select id from public.service_providers where user_id = auth.uid()));

create policy "Clients can manage their own maintenance contracts"
  on public.maintenance_contracts for all
  using (auth.uid() = client_id);
