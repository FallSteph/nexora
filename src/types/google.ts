declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
].join(" ");

const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];

let tokenClient: any = null;
let gapiInited = false;
let gisInited = false;

/* ----------------------------------------
 ✅ 1. Initialize GAPI client (Calendar)
---------------------------------------- */
export async function initGoogleAPI(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.gapi) {
      reject("❌ gapi not found on window");
      return;
    }

    window.gapi.load("client", async () => {
      try {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
        });
        gapiInited = true;
        console.log("✅ GAPI client initialized");
        resolve();
      } catch (err) {
        console.error("❌ Failed to initialize gapi:", err);
        reject(err);
      }
    });
  });
}

/* ----------------------------------------
 ✅ 2. Initialize Google Identity (GIS)
---------------------------------------- */
export async function initTokenClient() {
  if (!window.google || gisInited) return;

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    prompt: "consent", // ✅ forces fresh consent if scopes are missing
    callback: (tokenResponse: any) => {
      if (tokenResponse.error) {
        console.error("❌ Token error:", tokenResponse);
        return;
      }
      window.gapi.client.setToken(tokenResponse);
      console.log("✅ Token received and set");
    },
  });

  gisInited = true;
  console.log("✅ GIS client initialized");
}

/* ----------------------------------------
 ✅ 3. Ensure authorization before API calls
---------------------------------------- */
export async function ensureAuthorized(): Promise<void> {
  if (!gapiInited) await initGoogleAPI();
  if (!gisInited) await initTokenClient();

  // 🧹 Always clear the old token to force a fresh one
  window.gapi.client.setToken(null);

  await new Promise<void>((resolve) => {
    tokenClient.callback = (resp: any) => {
      if (resp.error) {
        console.error("❌ Token request error:", resp);
        return;
      }
      if (resp.access_token) {
        window.gapi.client.setToken({ access_token: resp.access_token });
        console.log("✅ New access token applied:", window.gapi.client.getToken());
        resolve();
      }
    };

    // 🆕 Force consent and include all required scopes
    tokenClient.requestAccessToken({
        prompt: "select_account consent", // ✅ forces re-selection AND new consent
        scope: SCOPES,
    });
  });
}

/* ----------------------------------------
 ✅ 4. Create new Calendar event
---------------------------------------- */
export async function addEventToGoogleCalendar(card: {
  title: string;
  description?: string;
  dueDate: string | Date;
  assignedMembers?: string[];
}): Promise<string | null> {
  try {
    await ensureAuthorized();

    const token = window.gapi.client.getToken();
    if (!token?.access_token) throw new Error("No valid OAuth token found");

    const start = new Date(card.dueDate);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour

    const event = {
      summary: card.title,
      description: card.description || "",
      start: { dateTime: start.toISOString(), timeZone: "Asia/Manila" },
      end: { dateTime: end.toISOString(), timeZone: "Asia/Manila" },
      attendees: card.assignedMembers?.map((email) => ({ email })) || [],
    };

    // use fetch with OAuth bearer token instead of API key
    const res = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.access_token}`,
        },
        body: JSON.stringify(event),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));

    console.log("✅ Calendar event created:", data.id);
    return data.id;
  } catch (err) {
    console.error("❌ Failed to create calendar event:", err);
    return null;
  }
}

/* ----------------------------------------
 ✅ 5. Update existing Calendar event
---------------------------------------- */
export async function updateGoogleCalendarEvent(
  eventId: string,
  updates: { title: string; description?: string; dueDate: string | Date },
  assignedMembers?: string[]
) {
  try {
    await ensureAuthorized();

    const start = new Date(updates.dueDate);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const updatedEvent = {
      summary: updates.title,
      description: updates.description || "",
      start: { dateTime: start.toISOString(), timeZone: "Asia/Manila" },
      end: { dateTime: end.toISOString(), timeZone: "Asia/Manila" },
      attendees: assignedMembers?.map((email) => ({ email })) || [],
    };

    await window.gapi.client.calendar.events.update({
      calendarId: "primary",
      eventId,
      resource: updatedEvent,
      sendUpdates: "all",
    });

    console.log("🔄 Google Calendar event updated");
  } catch (err) {
    console.error("❌ Failed to update event:", err);
  }
}

/* ----------------------------------------
 ✅ 6. Delete Calendar event
---------------------------------------- */
export async function deleteGoogleCalendarEvent(eventId: string) {
  try {
    await ensureAuthorized();

    await window.gapi.client.calendar.events.delete({
      calendarId: "primary",
      eventId,
      sendUpdates: "all",
    });

    console.log("🗑️ Google Calendar event deleted");
  } catch (err) {
    console.error("❌ Failed to delete calendar event:", err);
  }
}
