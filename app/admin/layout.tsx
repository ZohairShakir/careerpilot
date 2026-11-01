import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Career Pilot Admin", template: "%s | Career Pilot" },
  robots: { index: false, follow: false, noarchive: true },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
