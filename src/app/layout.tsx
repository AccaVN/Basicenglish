import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Học Vui English — Học tiếng Anh mỗi ngày",
  description: "Học cụm từ tiếng Anh, ôn tập thông minh và luyện nói từng bước.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
