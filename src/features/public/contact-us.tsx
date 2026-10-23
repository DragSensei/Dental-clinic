"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Compass,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  Send,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { buttonVariants } from "@/shared/components/ui/button";

export function ContactUs() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "General Consultation",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="page-shell min-h-[70vh] py-12">
      {/* Header */}
      <header className="page-header max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3.5 py-1 text-xs font-semibold text-brand-primary border border-brand-border">
          <Sparkles className="size-3.5" />
          <span>Get in Touch</span>
        </div>
        <h1 className="page-title mt-4 text-3xl font-bold tracking-tight sm:text-5xl text-foreground">
          Contact BlueHaven Dental
        </h1>
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground">
          Have a question about a treatment, need directions, or want to schedule a visit? Our friendly team in Nasr City, Cairo is ready to assist you.
        </p>
      </header>

      {/* Main Grid: Location & Form */}
      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        {/* Left: Contact Info & Interactive Map (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Synapsys Office Google Location Card */}
          <div className="overflow-hidden rounded-3xl border border-brand-border bg-card shadow-xs">
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-primary">
                    <MapPin className="size-4" />
                    <span>Clinic Location</span>
                  </div>
                  <h2 className="mt-1 text-2xl font-bold text-foreground">
                    Synapsys Office, Nasr City
                  </h2>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Synapsys+Nasr+City+Cairo+Egypt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({
                    variant: "outline",
                    className: "min-h-10 text-xs font-semibold gap-1.5",
                  })}
                >
                  <Compass className="size-3.5" />
                  <span>Open in Google Maps</span>
                </a>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Makram Ebeid / Abbas El Akkad District, Nasr City, Cairo Governorate, Egypt. Convenient parking and wheelchair accessible.
              </p>
            </div>

            {/* Embedded Google Maps Frame */}
            <div className="relative h-80 sm:h-96 w-full border-t border-brand-border bg-muted">
              <iframe
                title="Synapsys Office Nasr City Location"
                src="https://maps.google.com/maps?q=Nasr+City,+Cairo,+Egypt&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-brand-border bg-card p-6 shadow-xs">
              <div className="flex size-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <Phone className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">Phone & WhatsApp</h3>
              <p className="mt-2 text-sm text-muted-foreground">Direct lines for consultations and bookings:</p>
              <div className="mt-3 space-y-1 text-sm font-medium text-brand-primary">
                <p>+20 2 2270 9988</p>
                <p>+20 100 456 7890</p>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-border bg-card p-6 shadow-xs">
              <div className="flex size-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <Clock className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">Clinic Hours</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li><strong className="text-foreground">Sat – Thu:</strong> 9:00 AM – 8:00 PM</li>
                <li><strong className="text-foreground">Friday:</strong> Emergency on-call only</li>
                <li className="text-xs text-brand-primary mt-2">Appointments prioritized</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-brand-border bg-card p-6 shadow-xs">
              <div className="flex size-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <Mail className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">Email Inquiries</h3>
              <p className="mt-2 text-sm text-muted-foreground">Send medical records or inquiries to:</p>
              <p className="mt-2 text-sm font-medium text-brand-primary break-all">
                contact@bluehavendental.com
              </p>
            </div>

            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 shadow-xs dark:bg-destructive/10">
              <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
                <ShieldAlert className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">Emergency Dental Care</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                For severe tooth pain, accidents, or knocked-out teeth, our on-call dental surgeon is available:
              </p>
              <p className="mt-2 text-sm font-bold text-destructive">
                +20 122 000 9988 (24/7)
              </p>
            </div>
          </div>
        </div>

        {/* Right: Message Form & Quick Booking (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-3xl border border-brand-border bg-card p-6 sm:p-8 shadow-xs">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Send us a message
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Fill out your details and our clinic coordinator will contact you promptly.
            </p>

            {submitted ? (
              <div className="mt-8 rounded-2xl border border-brand-primary/30 bg-brand-subtle p-6 text-center">
                <CheckCircle2 className="mx-auto size-12 text-brand-primary" />
                <h3 className="mt-4 text-lg font-bold text-foreground">Message Sent Successfully!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Thank you for reaching out. One of our dental care coordinators will contact you at <strong>{formData.phone || formData.email}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-primary px-6 text-sm font-semibold text-primary-foreground"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Youssef Mahmoud"
                    className="mt-1.5 w-full min-h-11 rounded-xl border border-brand-border bg-background px-4 py-2.5 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Phone Number
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+20 1XX XXX XXXX"
                    className="mt-1.5 w-full min-h-11 rounded-xl border border-brand-border bg-background px-4 py-2.5 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="patient@example.com"
                    className="mt-1.5 w-full min-h-11 rounded-xl border border-brand-border bg-background px-4 py-2.5 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Area of Interest / Service
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1.5 w-full min-h-11 rounded-xl border border-brand-border bg-background px-4 py-2.5 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-brand-primary"
                  >
                    <option value="General Consultation">General Check-up & Consultation</option>
                    <option value="Dental Implants">Dental Implants</option>
                    <option value="Teeth Whitening & Veneers">Cosmetic Dentistry & Whitening</option>
                    <option value="Orthodontics">Braces & Aligners</option>
                    <option value="Children Dentistry">Children Dentistry</option>
                    <option value="Emergency Care">Emergency Treatment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Your Message or Symptoms
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what you'd like to consult on or any specific scheduling preferences…"
                    className="mt-1.5 w-full rounded-xl border border-brand-border bg-background px-4 py-2.5 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-brand-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-action px-6 text-sm font-semibold text-action-foreground hover:bg-action-hover shadow-sm transition-all"
                >
                  <Send className="size-4" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>

          {/* Quick Direct Book Banner */}
          <div className="rounded-3xl border border-brand-border bg-brand-primary p-6 sm:p-8 text-primary-foreground shadow-sm">
            <h3 className="text-xl font-bold">Ready to schedule now?</h3>
            <p className="mt-2 text-sm text-primary-foreground/80">
              Skip the inquiry and pick your preferred doctor and time slot instantly through our online scheduling system.
            </p>
            <Link
              href="/book"
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-action px-5 text-sm font-semibold text-action-foreground hover:bg-action-hover shadow-sm transition-all"
            >
              <PhoneCall className="size-4" />
              <span>Book Appointment Online</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
