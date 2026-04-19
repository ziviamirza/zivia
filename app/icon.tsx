import { ImageResponse } from "next/og";

/** Brauzer tab + Google nəticələri üçün; 96px aydınlıq üçün daha yaxşıdır. */
export const size = { width: 96, height: 96 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 28% 22%, #fffdf8 0%, #f0e4d0 38%, #d4bc8c 72%, #a8843e 100%)",
          borderRadius: 22,
          boxShadow: "inset 0 0 28px rgba(255,255,255,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 76,
            height: 76,
            borderRadius: 18,
            border: "2px solid rgba(90, 68, 28, 0.35)",
            background: "linear-gradient(165deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 55%)",
          }}
        >
          <span
            style={{
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1,
              color: "#3d2f12",
              fontFamily: 'Georgia, "Times New Roman", "Noto Serif", serif',
              letterSpacing: -4,
              textShadow:
                "0 1px 0 rgba(255,255,255,0.55), 0 3px 10px rgba(61, 47, 18, 0.28)",
            }}
          >
            Z
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
