/**
 * Supabase Auth xətalarının ingilis mətnlərini istifadəçi üçün Azərbaycan dilinə yaxınlaşdırır.
 */
export function authErrorToAz(message: string | undefined | null): string {
  const raw = (message ?? "").trim();
  if (!raw) {
    return "Əməliyyat alınmadı. Bir az sonra yenidən cəhd edin.";
  }

  const m = raw.toLowerCase();

  if (m.includes("invalid login credentials") || m.includes("invalid credentials")) {
    return "E-poçt və ya şifrə yanlışdır.";
  }
  if (m.includes("email not confirmed")) {
    return "E-poçt təsdiqlənməyib. Gələn qovluğu və spamı yoxlayın.";
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "Bu e-poçt artıq qeydiyyatdadır. Giriş edin və ya şifrəni bərpa edin.";
  }
  if (m.includes("password") && (m.includes("at least") || m.includes("least 6"))) {
    return "Şifrə çox qısadır. Daha uzun və təhlükəsiz şifrə seçin.";
  }
  if (m.includes("signup") && m.includes("not allowed")) {
    return "Hazırda yeni qeydiyyat mümkün deyil.";
  }
  if (
    m.includes("rate limit") ||
    m.includes("too many requests") ||
    m.includes("email rate limit") ||
    m.includes("over_email_send_rate_limit") ||
    m.includes("email rate limit exceeded") ||
    m.includes("security purposes") && m.includes("seconds")
  ) {
    return "Çox tez-tez istək göndərilir. Bir neçə dəqiqə sonra yenidən cəhd edin.";
  }
  if (m.includes("invalid email")) {
    return "E-poçt ünvanı düzgün deyil.";
  }
  if (m.includes("jwt") || m.includes("session") && m.includes("expired")) {
    return "Sessiyanın müddəti bitib. Yenidən daxil olun.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Şəbəkə xətası. İnternet bağlantınızı yoxlayın.";
  }

  return "Əməliyyat alınmadı. Məlumatları yoxlayın və ya bir az sonra yenidən cəhd edin.";
}

type AuthLikeError = {
  message?: string | null;
  status?: number | null;
  code?: string | null;
};

/** Şifrə bərpası e-poçtu — 429 və Supabase kodları üçün aydın mesaj */
export function recoverPasswordErrorToAz(error: AuthLikeError): string {
  const status = error.status ?? undefined;
  const code = (error.code ?? "").toLowerCase();
  const msg = (error.message ?? "").toLowerCase();

  if (
    status === 429 ||
    code === "over_email_send_rate_limit" ||
    msg.includes("too many requests") ||
    msg.includes("rate limit")
  ) {
    return "Eyni e-poçt üçün link çox tez istənilib. Təhlükəsizlik limiti var — təxminən 1–2 dəqiqə gözləyin. Əvvəlki e-poçtda link varsa, gələn qovluğu və spamı yoxlayın.";
  }

  return authErrorToAz(error.message);
}
