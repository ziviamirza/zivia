# Zivia — Supabase auth e-poçtları

Bu qovluqdakı HTML faylları **Supabase Dashboard**-da əl ilə yapışdırılır (Authentication → Email templates). Kod layihəsindən avtomatik göndərilmir.

## Göndərici adı və domen (Supabase əvəzinə “Zivia”)

Supabase default olaraq öz göndərici domenindən istifadə edir. **“Zivia” / zivia.az** görünməsi üçün:

1. **Authentication → Emails → SMTP Settings** — xüsusi SMTP aktiv edin (məsələn: Resend, SendGrid, Amazon SES, Mailgun).
2. Göndərici: `Zivia <noreply@zivia.az>` (və ya domaininizdə təsdiqlənmiş ünvan).
3. DNS-də SPF / DKIM qeydlərini SMTP provayderinizin təlimatına uyğun əlavə edin.

SMTP olmadan məzmun Azərbaycan dilində ola bilər, amma “Kimdən” sahəsi çox vaxt Supabase ünvanı kimi qalır.

## Keçidlərin zivia.az olması

Layihədə `NEXT_PUBLIC_SITE_URL=https://zivia.az` təyin edin (Vercel / server env). Auth e-poçtundakı `emailRedirectTo` bu domenə qurulur.

Supabase: **Authentication → URL Configuration** — **Site URL**: `https://zivia.az`  
**Redirect URLs** siyahısına əlavə edin:

- `https://zivia.az/auth/callback`
- `http://localhost:3000/auth/callback` (inkişaf üçün)

## Şablonları yapışdırmaq

1. Dashboard → **Authentication** → **Email templates**.
2. Uyğun növü seçin (Confirm signup, Reset password və s.).
3. **Subject** üçün bu qovluqdakı `SUBJECTS.txt` dəyərlərindən istifadə edin.
4. **Body** üçün uyğun `.html` faylının məzmununu kopyalayın (`{{ .ConfirmationURL }}` dəyişənini silməyin).

Fayllar: `confirm_signup.html`, `recovery.html`, `magic_link.html`, `change_email.html`.
