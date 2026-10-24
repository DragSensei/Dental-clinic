import type { ReactNode } from "react";

export default function RouteTemplate({ children }: { children: ReactNode }) {
  return <div className="route-enter min-w-0 flex-1">{children}</div>;
}
