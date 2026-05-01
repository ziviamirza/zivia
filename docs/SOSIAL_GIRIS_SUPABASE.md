# Sosial giriş (Google / Facebook / Apple) — checklist

## 1. `.env.local`

- Lokal: `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- Production: `NEXT_PUBLIC_SITE_URL=https://sizin-domen.az`

## 2. Supabase → Authentication → URL Configuration

- **Redirect URLs** (hər biri ayrıca):
  - `https://sizin-domen.az/auth/callback`
  - `http://localhost:3000/auth/callback`

## 3. Hər provayder

Supabase → **Authentication** → **Providers** → provayderi **Enable** et.  
**Callback URL** (Google/Meta/Apple konsollarında redirect kimi):  
`https://<project-ref>.supabase.co/auth/v1/callback` — Supabase həmin səhifədə göstərir.

| Provayder | Harada ID/secret | Redirect URI |
|-----------|------------------|--------------|
| Google    | Google Cloud Console → Credentials → OAuth client (Web) | Supabase `auth/v1/callback` |
| Facebook| Meta for Developers → Facebook Login → Valid OAuth Redirect URIs | Eyni |
| Apple   | Apple Developer → Services ID (Sign in with Apple) → Return URLs | Eyni |

## 4. Test

Login səhifəsində düymə → provayder pəncərəsi → qayıdış `/auth/callback` ilə.  
Xəta: Supabase **Authentication** → **Logs**.
