# Security policy

## Secrets

Never commit GitHub tokens, Supabase service-role keys, private URLs, or `.env.local` files.

- The browser may receive only the Supabase anon key protected by RLS.
- `SUPABASE_SERVICE_ROLE_KEY` belongs only in GitHub Actions secrets or a trusted server environment.
- The collector uses the automatically generated Actions `GITHUB_TOKEN` by default.
- Local GitHub CLI credentials remain in the operating-system keyring and are not deployment credentials.

## Reporting

Please open a private security advisory on the GitHub repository for vulnerabilities that could expose credentials, bypass RLS, or mutate ranking data without authorization.
