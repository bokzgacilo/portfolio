import { NextResponse } from "next/server";

const toEmail = process.env.CONTACT_TO_EMAIL ?? "bokzgacilo@gmail.com";
const fromEmail =
  process.env.RESEND_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";
const audienceId = process.env.RESEND_AUDIENCE_ID;

type ContactPayload = {
  kind?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  website?: string;
  interest?: string;
  message?: string;
  idea?: string;
  subject?: string;
  source?: string;
  feedbackType?: string;
  tool?: string;
  websiteField?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildEmail(payload: ContactPayload) {
  const kind = clean(payload.kind);
  const email = clean(payload.email);
  const name =
    clean(payload.name) ||
    [clean(payload.firstName), clean(payload.lastName)].filter(Boolean).join(" ");
  const message = clean(payload.message) || clean(payload.idea);

  const rows = [
    ["Name", name],
    ["Email", email],
    ["Company / project", clean(payload.company)],
    ["Website", clean(payload.website)],
    ["Interest", clean(payload.interest)],
    ["Feedback type", clean(payload.feedbackType)],
    ["Tool", clean(payload.tool)],
    ["Source", clean(payload.source)],
  ].filter(([, value]) => value);

  const title =
    kind === "tool-idea"
      ? "New Tool Idea"
      : kind === "tool-feedback"
        ? "New Tool Feedback"
        : "New Contact Inquiry";
  const subject =
    clean(payload.subject) ||
    (kind === "tool-idea"
      ? `Tool idea from ${name || email}`
      : kind === "tool-feedback"
        ? `Tool feedback from ${name || email}`
        : `Portfolio inquiry from ${name || email}`);

  const htmlRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 14px 8px 0;color:#706b62;font-weight:700;">${escapeHtml(label)}</td>
          <td style="padding:8px 0;color:#151412;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");

  return {
    subject,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#151412;">
        <h1 style="margin:0 0 18px;font-size:24px;">${title}</h1>
        <table style="border-collapse:collapse;margin-bottom:22px;">${htmlRows}</table>
        <div style="white-space:pre-wrap;border-top:1px solid #d8d1c5;padding-top:18px;">${escapeHtml(message)}</div>
      </div>`,
    text: `${title}

${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}

${message}`,
    replyTo: email,
  };
}

function splitName(payload: ContactPayload) {
  const firstName = clean(payload.firstName);
  const lastName = clean(payload.lastName);

  if (firstName || lastName) {
    return { firstName, lastName };
  }

  const [first, ...rest] = clean(payload.name).split(/\s+/).filter(Boolean);

  return {
    firstName: first ?? "",
    lastName: rest.join(" "),
  };
}

async function saveContact(apiKey: string, payload: ContactPayload) {
  const email = clean(payload.email);
  const { firstName, lastName } = splitName(payload);
  const baseUrl = audienceId
    ? `https://api.resend.com/audiences/${audienceId}/contacts`
    : "https://api.resend.com/contacts";

  const body = JSON.stringify({
    email,
    firstName,
    lastName,
    unsubscribed: false,
  });

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const createResponse = await fetch(baseUrl, {
    method: "POST",
    headers,
    body,
  });

  if (createResponse.ok) {
    return;
  }

  const updateResponse = await fetch(`${baseUrl}/${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      firstName,
      lastName,
      unsubscribed: false,
    }),
  });

  if (!updateResponse.ok) {
    const errorBody = await updateResponse.text().catch(() => "");
    console.error("Unable to save Resend contact", {
      status: updateResponse.status,
      body: errorBody,
    });
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { message: "Email is not configured yet." },
      { status: 500 }
    );
  }

  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { message: "Please send a valid form submission." },
      { status: 400 }
    );
  }

  if (clean(payload.websiteField)) {
    return NextResponse.json({ ok: true });
  }

  const email = clean(payload.email);
  const message = clean(payload.message) || clean(payload.idea);
  const name =
    clean(payload.name) ||
    [clean(payload.firstName), clean(payload.lastName)].filter(Boolean).join(" ");

  if (!name || !isEmail(email) || !message) {
    return NextResponse.json(
      { message: "Please complete the required fields." },
      { status: 400 }
    );
  }

  const emailContent = buildEmail(payload);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: toEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      reply_to: emailContent.replyTo,
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "The email could not be sent right now." },
      { status: 502 }
    );
  }

  await saveContact(apiKey, payload).catch((error: unknown) => {
    console.error("Unable to sync Resend contact", error);
  });

  return NextResponse.json({ ok: true });
}
