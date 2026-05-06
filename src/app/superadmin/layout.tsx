import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Klasszy – Super Admin",
  description: "Super Admin portal for managing all Klasszy schools.",
  robots: { index: false, follow: false },
};

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
