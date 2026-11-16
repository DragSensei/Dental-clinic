import { NextRequest, NextResponse } from "next/server";
import { HttpError, isStaff, requireSession } from "@/lib/authz";
import { toErrorResponse } from "@/lib/http";
import { CLINIC_TIME_ZONE, clinicInstant } from "@/lib/clinic-time";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { calendarSyncSchema } from "@/lib/clinic-schemas";

function toGoogleCalendarDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireSession(request);
    const body = await request.json();
    const parsed = calendarSyncSchema.parse(body);
    const {
      appointmentId,
      title,
      description,
      startDateTime,
      date,
      time,
      durationMinutes = 45,
      doctorName,
      location = "BlueHaven Dental Clinic, Makram Ebeid, Nasr City, Cairo",
    } = parsed;

    if (appointmentId) {
      const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
      if (!appt || (!isStaff(user) && appt.email.toLowerCase() !== user.email.toLowerCase())) {
        throw new HttpError(404, "not_found");
      }
    }

    const eventTitle =
      title || (doctorName ? `Dental Appointment - Dr. ${doctorName}` : "Dental Appointment - BlueHaven Clinic");

    let eventDescription = description;
    if (!eventDescription) {
      const details = [
        "BlueHaven Dental Care Consultation",
        doctorName ? `Doctor: ${doctorName}` : null,
        user.email ? `Patient: ${user.email}` : null,
        appointmentId ? `Appointment Ref: ${appointmentId}` : null,
      ].filter(Boolean);
      eventDescription = details.join("\n");
    }

    let startMs: number;
    if (date && time) {
      startMs = clinicInstant(date, time);
    } else if (startDateTime) {
      startMs = new Date(startDateTime).getTime();
    } else {
      startMs = Date.now() + 48 * 3600 * 1000;
    }

    const duration = Number(durationMinutes) || 45;
    const endMs = startMs + duration * 60 * 1000;

    const startDate = new Date(startMs);
    const endDate = new Date(endMs);

    const datesParam = `${toGoogleCalendarDate(startDate)}/${toGoogleCalendarDate(endDate)}`;
    const templateUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventTitle
    )}&dates=${datesParam}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(location)}`;

    let token: string | undefined;
    const authApi = auth.api as unknown as Record<
      string,
      ((opts: { body: { providerId: string }; headers: Headers }) => Promise<{ accessToken?: string }>) | undefined
    >;
    if (typeof authApi.getAccessToken === "function") {
      try {
        const tokenRes = await authApi.getAccessToken({
          body: { providerId: "google" },
          headers: request.headers,
        });
        token = tokenRes?.accessToken;
      } catch {}
    }

    let eventId: string | null = null;
    let finalUrl = templateUrl;

    if (token) {
      try {
        const googleRes = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
          method: "POST",
          signal: AbortSignal.timeout(5000),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: eventTitle,
            description: eventDescription,
            location,
            start: { dateTime: startDate.toISOString(), timeZone: CLINIC_TIME_ZONE },
            end: { dateTime: endDate.toISOString(), timeZone: CLINIC_TIME_ZONE },
            reminders: {
              useDefault: false,
              overrides: [
                { method: "popup", minutes: 2880 },
                { method: "popup", minutes: 1440 },
              ],
            },
          }),
        });

        if (googleRes.ok) {
          const eventData = await googleRes.json();
          eventId = eventData.id || null;
          if (eventData.htmlLink) {
            finalUrl = eventData.htmlLink;
          }
          if (appointmentId && eventId) {
            await prisma.appointment.update({
              where: { id: appointmentId },
              data: { calendarSynced: true, googleEventId: eventId },
            });
          }
        }
      } catch (err) {
        console.error("Failed to sync to Google Calendar API:", err);
      }
    }

    return NextResponse.json({
      success: true,
      url: finalUrl,
      eventId,
      synced: eventId !== null,
      mode: eventId ? "google_api" : "template_url",
      templateUrl,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
