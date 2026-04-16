"use client";

type Props = {
  href: string;
  productSlug: string;
  className?: string;
  children: React.ReactNode;
};

export default function TrackWhatsAppProductClick({
  href,
  productSlug,
  className,
  children,
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        void fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "whatsapp_click", productSlug }),
          keepalive: true,
        }).catch(() => {});
      }}
    >
      {children}
    </a>
  );
}
