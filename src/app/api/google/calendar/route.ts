import { NextRequest, NextResponse } from "next/server";

function toGoogleCalendarDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export async function POST(request: Request | NextRequest) {
  try {
    const body = await request.json();
    const {
      appointmentId,
      title,
      description,
      startDateTime,
      date,
      time,
      durationMinutes = 45,
      patientEmail,
      doctorName,
      location = "BlueHaven Dental Clinic, Makram Ebeid, Nasr City, Cairo",
    } = body;

    const eventTitle =
      title || (doctorName ? `Dental Appointment - Dr. ${doctorName}` : "Dental Appointment - BlueHaven Clinic");

    let eventDescription = description;
    if (!eventDescription) {
      const details = [
        "BlueHaven Dental Care Consultation",
        doctorName ? `Doctor: ${doctorName}` : null,
        patientEmail ? `Patient: ${patientEmail}` : null,
        appointmentId ? `Appointment Ref: ${appointmentId}` : null,
      ].filter(Boolean);
      eventDescription = details.join("\n");
    }

    let startDate: Date;
    if (startDateTime) {
      startDate = new Date(startDateTime);
    } else if (date && time) {
      startDate = new Date(`${date}T${time}:00Z`);
    } else {
      startDate = new Date(Date.now() + 48 * 3600 * 1000);
    }

    const duration = Number(durationMinutes) || 45;
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    const datesParam = `${toGoogleCalendarDate(startDate)}/${toGoogleCalendarDate(endDate)}`;
    const templateUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventTitle
    )}&dates=${datesParam}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(location)}`;

    const cookieToken =
      typeof (request as NextRequest).cookies?.get === "function"
        ? (request as NextRequest).cookies.get("dental_google_token")?.value
        : undefined;

    const token =
      process.env.GOOGLE_CALENDAR_ACCESS_TOKEN ||
      process.env.GOOGLE_ACCESS_TOKEN ||
      process.env.GOOGLE_CALENDAR_TOKEN ||
      cookieToken;

    let eventId: string | null = null;
    let finalUrl = templateUrl;

    if (token) {
      try {
        const googleRes = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: eventTitle,
            description: eventDescription,
            location,
            start: { dateTime: startDate.toISOString() },
            end: { dateTime: endDate.toISOString() },
            reminders: {
              useDefault: false,
              overrides: [
                { method: "popup", minutes: 2880 }, // 48-hour reminder
                { method: "popup", minutes: 1440 }, // 24-hour reminder
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
        }
      } catch (err) {
        console.error("Failed to sync to Google Calendar API:", err);
      }
    }

    return NextResponse.json({
      success: true,
      url: finalUrl,
      eventId,
      synced: true,
      mode: eventId ? "google_api" : "template_url",
      templateUrl,
    });
  } catch (err) {
    console.error("Error processing calendar request:", err);
    return NextResponse.json({ error: "Invalid calendar request payload", success: false }, { status: 400 });
  }
}
