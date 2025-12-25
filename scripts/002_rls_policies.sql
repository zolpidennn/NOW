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
