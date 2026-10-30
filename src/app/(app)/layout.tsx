import type { ReactNode } from "react";
import { AppTopBar } from "@/components/app-top-bar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppTopBar />
      {children}
    </>
  );
}
