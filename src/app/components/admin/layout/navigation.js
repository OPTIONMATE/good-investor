"use client";

import {
  LayoutDashboard,
  Users,
  FileSignature,
  ShieldAlert,
  FileCheck,
  ReceiptText,
  CreditCard,
  CalendarClock,
  Layers,
  Ticket,
  BarChart3,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";

/**
 * Single source of truth for the admin sidebar.
 * Category -> Feature (maximum two levels, as required).
 */
export const ADMIN_NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { label: "Overview", href: "/admin-dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Users",
    items: [
      { label: "Users", href: "/admin-dashboard/users", icon: Users },
      {
        label: "Signed Users",
        href: "/admin-dashboard/signed-users",
        icon: FileSignature,
      },
      {
        label: "Risk Profiles",
        href: "/admin-dashboard/risk-profiles",
        icon: ShieldAlert,
      },
    ],
  },
  {
    label: "Documents",
    items: [
      { label: "Agreements", href: "/admin-dashboard/agreements", icon: FileCheck },
      { label: "Invoices", href: "/admin-dashboard/invoices", icon: ReceiptText },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Payments", href: "/admin-dashboard/payments", icon: CreditCard },
      {
        label: "Subscriptions",
        href: "/admin-dashboard/subscriptions",
        icon: CalendarClock,
      },
      { label: "Plans", href: "/admin-dashboard/plans", icon: Layers },
      { label: "Coupons", href: "/admin-dashboard/coupons", icon: Ticket },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        label: "Analytics",
        href: "/admin-dashboard/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        label: "Messages",
        href: "/admin-dashboard/messages",
        icon: MessageSquare,
        badgeKey: "unread",
      },
      {
        label: "Complaints",
        href: "/admin-dashboard/complaints",
        icon: AlertTriangle,
      },
    ],
  },
];

export const flattenAdminNav = () =>
  ADMIN_NAV_GROUPS.flatMap((group) => group.items);

export const isAdminRouteActive = (href, pathname) =>
  href === "/admin-dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

export const getAdminSectionLabel = (pathname) => {
  const item = flattenAdminNav().find((i) => isAdminRouteActive(i.href, pathname));
  return item ? item.label : "Admin";
};