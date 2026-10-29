import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Học Vui English — Học tiếng Anh mỗi ngày",
  description: "Học cụm từ tiếng Anh, ôn tập thông minh và luyện nói từng bước.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body className={`${beVietnamPro.variable} ${beVietnamPro.className}`}>{children}</body></html>;
}
