import type { LucideIcon } from "lucide-react";
import {
  Award,
  HeartHandshake,
  Microscope,
  ShieldCheck,
} from "lucide-react";

export interface AboutValue {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface AboutMilestone {
  number: string;
  label: string;
}

export const aboutValues: AboutValue[] = [
  {
    icon: HeartHandshake,
    title: "Patient-First Gentle Care",
    description:
      "We believe dental appointments should be calming and stress-free. Every treatment is conducted with gentle touch and clear communication at your pace.",
  },
  {
    icon: Microscope,
    title: "Cutting-Edge Technology",
    description:
      "From ultra-low dose 3D Cone Beam CT imaging to intraoral 3D scanners, we invest in modern equipment for pinpoint diagnostic accuracy.",
  },
  {
    icon: ShieldCheck,
    title: "Hospital-Grade Sterilization",
    description:
      "Your safety is non-negotiable. We adhere to rigorous Class-B autoclave sterilization and CDC/WHO bio-safety protocols.",
  },
  {
    icon: Award,
    title: "Clinical Excellence",
    description:
      "Our dentists hold advanced postgraduate qualifications and stay at the forefront of modern conservative and aesthetic dentistry.",
  },
];

export const aboutMilestones: AboutMilestone[] = [
  { number: "12+", label: "Years of Clinical Excellence" },
  { number: "12,500+", label: "Smiles Restored" },
  { number: "99.4%", label: "Patient Satisfaction" },
  { number: "100%", label: "Digital Workflow" },
];

export const aboutTechnologies: string[] = [
  "High-definition 3D Cone Beam Computed Tomography (CBCT)",
  "Intraoral digital scanners for putty-free impression taking",
  "Gentle dental lasers for minimally invasive gum treatments",
  "Computer-controlled local anesthesia delivery systems",
];

export const values = aboutValues;
export const milestones = aboutMilestones;
export const technologies = aboutTechnologies;
