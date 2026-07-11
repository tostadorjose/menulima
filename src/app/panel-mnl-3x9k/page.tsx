import { cookies } from "next/headers";
import type { Metadata } from "next";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/adminAuth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PanelPage() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  const user = await verifyAdminSessionToken(token).catch(() => null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {user ? <AdminDashboard adminUser={user} /> : <AdminLoginForm />}
    </div>
  );
}
