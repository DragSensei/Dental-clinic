"use client";

import { createContext, useContext } from "react";

export type PatientSidebarContextValue = {
  collapsed: boolean;
  onToggle: () => void;
  signedInEmail?: string | null;
  userDisplayName?: string | null;
  onSignOut?: () => void;
};

export const PatientSidebarContext = createContext<PatientSidebarContextValue | null>(null);

export function usePatientSidebar(): PatientSidebarContextValue | null {
  return useContext(PatientSidebarContext);
}
