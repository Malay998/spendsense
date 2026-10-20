-- Run only after you have signed up and verified your own account.
-- Replace UUID with your own auth.users ID. Never make this a public form.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where id = 'YOUR-USER-UUID';
