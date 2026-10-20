"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck2, CalendarDays, House, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Settings, Stethoscope, Users, Wrench } from "lucide-react";
import { ThemeToggle } from "@/shared/components/theme-toggle";

const items = [
  ["Overview", "/admin", LayoutDashboard],
  ["Appointments", "/admin/appointments", CalendarCheck2],
  ["Calendar", "/admin/calendar", CalendarDays],
  ["Doctors", "/admin/doctors", Stethoscope],
  ["Services", "/admin/services", Wrench],
  ["Patients", "/admin/patients", Users],
  ["Settings", "/admin/settings", Settings],
] as const;

export function AdminNavigation({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const links = (mobile = false) => items.map(([label, href, Icon]) => {
    const active = href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
    return <Link key={href} href={href} aria-current={active ? "page" : undefined} title={collapsed && !mobile ? label : undefined} className={`group flex min-h-11 items-center rounded-full text-sm font-medium transition-[background-color,color] duration-300 ease-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${mobile ? "shrink-0 gap-3 px-3" : collapsed ? "h-12 w-12 justify-center gap-0 px-0" : "mx-1 w-[calc(100%-0.5rem)] gap-3 px-3"} ${active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
      <span className={`grid size-11 shrink-0 place-items-center rounded-full transition-[background-color,color,transform] duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${active ? "bg-primary text-primary-foreground" : "group-hover:bg-muted"}`}><Icon aria-hidden="true" className="size-5"/></span>
      <span className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 motion-reduce:transition-none ${collapsed && !mobile ? "max-w-0 opacity-0" : "max-w-40 opacity-100"}`}>{label}</span>
    </Link>;
  });
  return <>
    <div className="flex items-center gap-2 border-b border-border px-3 py-2 md:hidden"><nav aria-label="Admin navigation" className="flex min-w-0 flex-1 gap-1 overflow-x-auto">{links(true)}</nav><ThemeToggle/></div>
    <aside className={`hidden self-start p-3 transition-[width] duration-300 motion-reduce:transition-none md:sticky md:top-[69px] md:block md:h-[calc(100vh-8.5rem)] ${collapsed ? "md:w-[88px]" : "md:w-[272px]"}`}>
      <div className={`flex h-full min-h-0 flex-col rounded-[2rem] border border-border bg-card shadow-sm ${collapsed ? "p-1" : "p-2"}`}>
        <div className={`mb-4 flex h-12 items-center ${collapsed ? "justify-center" : "justify-between px-2"}`}>
          {!collapsed && <span className="truncate text-sm font-semibold">Clinic workspace</span>}
          <button type="button" onClick={onToggle} aria-expanded={!collapsed} aria-label={collapsed ? "Expand admin sidebar" : "Collapse admin sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><span className="sr-only">{collapsed ? "Expand admin sidebar" : "Collapse admin sidebar"}</span>{collapsed ? <PanelLeftOpen aria-hidden="true" className="size-5"/> : <PanelLeftClose aria-hidden="true" className="size-5"/>}</button>
        </div>
        <nav aria-label="Admin navigation" className={`grid min-h-0 flex-1 content-start justify-items-center overflow-y-auto py-2 ${collapsed ? "gap-5" : "gap-2"}`}>{links()}</nav>
        <div className="my-2 border-t border-border"/>
        <Link href="/" title={collapsed ? "Public booking preview" : undefined} className={`flex min-h-11 items-center rounded-full text-sm text-muted-foreground transition-[gap] duration-200 motion-reduce:transition-none hover:bg-muted hover:text-foreground ${collapsed ? "h-12 w-12 justify-center gap-0 px-0" : "gap-3 px-3"}`}><span className="grid size-11 shrink-0 place-items-center rounded-full"><House aria-hidden="true" className="size-5"/></span><span className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 motion-reduce:transition-none ${collapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100"}`}>Public preview</span></Link>
        <div className={`mt-2 flex items-center gap-3 px-2 py-2 ${collapsed ? "justify-center px-0" : ""}`}><ThemeToggle/>{!collapsed && <span className="text-sm text-muted-foreground">Theme</span>}</div>
      </div>
    </aside>
  </>;
}
