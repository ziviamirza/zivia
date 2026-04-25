type NewSellerApplicationEmailInput = {
  sellerName: string;
  sellerEmail: string;
  sellerId: number | string;
};

function env(name: string): string {
  return String(process.env[name] ?? "").trim();
}

export async function sendNewSellerApplicationEmail(input: NewSellerApplicationEmailInput): Promise<void> {
  const host = env("SMTP_HOST");
  const user = env("SMTP_USER");
  const pass = env("SMTP_PASS");
  const portRaw = env("SMTP_PORT");
  const secureRaw = env("SMTP_SECURE");
  const alertTo = env("ADMIN_ALERT_EMAIL") || env("ADMIN_EMAIL");

  if (!host || !user || !pass || !alertTo) {
    return;
  }

  const port = Number(portRaw || "465");
  const secure = secureRaw ? secureRaw === "1" || secureRaw.toLowerCase() === "true" : port === 465;
  const { default: nodemailer } = await import("nodemailer");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  const subject = "Zivia: Yeni satıcı müraciəti";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
      <h2 style="margin:0 0 12px">Yeni satıcı müraciəti daxil oldu</h2>
      <p style="margin:0 0 10px"><strong>Satıcı adı:</strong> ${escapeHtml(input.sellerName)}</p>
      <p style="margin:0 0 10px"><strong>E-poçt:</strong> ${escapeHtml(input.sellerEmail)}</p>
      <p style="margin:0 0 16px"><strong>Seller ID:</strong> ${escapeHtml(String(input.sellerId))}</p>
      <p style="margin:0 0 16px">Müraciəti yoxlamaq üçün admin panelə daxil olun: <a href="https://zivia.az/admin/sellers">/admin/sellers</a></p>
      <p style="margin:0;color:#6b7280;font-size:12px">Bu məktub Zivia sistem bildirişidir.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Zivia" <${user}>`,
    to: alertTo,
    subject,
    html,
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
