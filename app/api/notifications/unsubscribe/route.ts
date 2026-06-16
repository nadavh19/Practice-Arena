import { unsubscribeFromEmailReminders } from "@/services/notification.service";

function htmlResponse(title: string, body: string, status = 200) {
  return new Response(
    [
      "<!doctype html>",
      '<html lang="en">',
      "<head>",
      '<meta charset="utf-8" />',
      '<meta name="viewport" content="width=device-width, initial-scale=1" />',
      `<title>${title}</title>`,
      "</head>",
      '<body style="font-family:Arial,sans-serif;line-height:1.6;color:#171326;padding:32px;max-width:680px;margin:0 auto">',
      `<h1>${title}</h1>`,
      `<p>${body}</p>`,
      "</body>",
      "</html>",
    ].join(""),
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
      status,
    },
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";

  try {
    const user = await unsubscribeFromEmailReminders(token);
    if (!user) {
      return htmlResponse("Invalid unsubscribe link", "This reminder unsubscribe link is missing or invalid.", 400);
    }

    return htmlResponse("You are unsubscribed", `${user.email} will no longer receive Practice Arena reminders.`);
  } catch {
    return htmlResponse("Invalid unsubscribe link", "This reminder unsubscribe link is no longer valid.", 404);
  }
}
