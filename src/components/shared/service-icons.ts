import {
  Activity,
  Baby,
  CircleDot,
  CircleHelp,
  Gem,
  HeartPulse,
  Layers,
  ScanLine,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

const serviceIcons: Readonly<Record<string, LucideIcon>> = {
  "service-1": ShieldCheck,
  "service-2": CircleDot,
  "service-3": Activity,
  "service-4": Smile,
  "service-5": HeartPulse,
  "service-6": Stethoscope,
  "service-7": Baby,
  "service-8": Sparkles,
  "service-9": ScanLine,
  "service-10": Layers,
  "service-11": CircleHelp,
  "service-12": Gem,
};

export function getServiceIcon(serviceId: string): LucideIcon {
  return serviceIcons[serviceId] ?? CircleHelp;
}
