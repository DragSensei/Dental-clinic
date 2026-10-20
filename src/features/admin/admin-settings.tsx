"use client";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { useClinic } from "@/shared/data/use-clinic";
import { PageTitle, Panel } from "@/features/admin/admin-ui";
export function AdminSettings({ clinic }: { clinic: ReturnType<typeof useClinic> }) {
  const [notice, setNotice] = useState("");
  return <><PageTitle title="Settings" description="Demo controls for the current browser session."/><Panel><h2 className="text-lg font-semibold">Reset sample data</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Clear session appointments and restore the original demo doctors and services. This does not affect a clinic account or any external data.</p><p className="mt-3 text-sm text-muted-foreground">Sidebar styling follows the supplied reference; the light and dark clinic variants are available from the sidebar theme control.</p>{notice && <p className="mt-4 rounded-lg bg-brand-subtle p-3 text-sm" aria-live="polite">{notice}</p>}<Button type="button" className="mt-5 min-h-11" variant="outline" onClick={() => { clinic.resetDemo(); setNotice("The demo session has been reset."); }}>Reset demo session</Button></Panel></>;
}





