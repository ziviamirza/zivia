import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 30% 20%, #fffdf8 0%, #ebe0cc 42%, #c9a86a 88%)",
          borderRadius: 40,
          border: "3px solid rgba(122, 91, 36, 0.45)",
          boxShadow: "inset 0 0 36px rgba(255,255,255,0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 128,
            height: 128,
            borderRadius: 32,
            border: "2px solid rgba(61, 47, 18, 0.28)",
            background: "linear-gradient(160deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 50%)",
          }}
        >
          <span
            style={{
              fontSize: 86,
              fontWeight: 700,
              lineHeight: 1,
              color: "#352818",
              fontFamily: 'Georgia, "Times New Roman", "Noto Serif", serif',
              letterSpacing: -6,
              textShadow:
                "0 2px 0 rgba(255,255,255,0.45), 0 6px 18px rgba(53, 40, 24, 0.22)",
            }}
          >
            Z
          </span>
        </div>
        <span
          style={{
            marginTop: 6,
            fontSize: 20,
            fontWeight: 600,
            color: "#6b5220",
            letterSpacing: 5,
            textTransform: "uppercase",
            fontFamily: 'system-ui, "Segoe UI", sans-serif',
          }}
        >
          Zivia
        </span>
      </div>
    ),
    { ...size },
  );
}
