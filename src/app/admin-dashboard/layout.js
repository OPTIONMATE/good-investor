"use client";

import AdminShell from "../components/admin/layout/AdminShell";

export default function AdminDashboardLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}