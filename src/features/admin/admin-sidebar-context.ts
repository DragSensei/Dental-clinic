"use client";

import { createContext, useContext } from "react";

export type AdminSidebarContextValue = {
  collapsed: boolean;
  onToggle: () => void;
  signedInEmail?: string | null;
  onSignOut?: () => void;
};

export const AdminSidebarContext = createContext<AdminSidebarContextValue | null>(null);

export function useAdminSidebar(): AdminSidebarContextValue | null {
  return useContext(AdminSidebarContext);
}
