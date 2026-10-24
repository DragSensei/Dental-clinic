import { NextRequest, NextResponse } from "next/server";

function toGoogleCalendarDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title = "Dental Appointment - BlueHaven Clinic",
      description = "BlueHaven Dental Care Consultation",
      location = "BlueHaven Dental Clinic, Makram Ebeid, Nasr City, Cairo",
      date,
      time,
      durationMinutes = 45,
    } = body;

    const startDate = date && time ? new Date(`${date}T${time}:00Z`) : new Date(Date.now() + 48 * 3600 * 1000);
    const duration = Number(durationMinutes) || 45;
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    const datesParam = `${toGoogleCalendarDate(startDate)}/${toGoogleCalendarDate(endDate)}`;
    const templateUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${datesParam}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;

    const token = request.cookies.get("dental_google_token")?.value;

    if (token) {
      try {
        const googleRes = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: title,
            description,
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
          return NextResponse.json({
            synced: true,
            mode: "google_api",
            eventId: eventData.id,
            htmlLink: eventData.htmlLink,
            templateUrl,
          });
        }
      } catch (err) {
        console.error("Failed to sync to Google Calendar API:", err);
      }
    }

    // Default template URL sync mode
    return NextResponse.json({
      synced: true,
      mode: "template_url",
      templateUrl,
    });
  } catch (err) {
    console.error("Error processing calendar request:", err);
    return NextResponse.json({ error: "Invalid calendar request payload" }, { status: 400 });
  }
}
