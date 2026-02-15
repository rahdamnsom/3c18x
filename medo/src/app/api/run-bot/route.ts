import { spawn } from "child_process";

export async function POST(req: Request) {
  const { count, inviteLink } = await req.json();

  // Basic validation
  const numCount = parseInt(count);
  if (isNaN(numCount) || numCount <= 0 || numCount > 50) {
    return new Response(JSON.stringify({ error: "Invalid count. Must be between 1 and 50." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate invite link (basic)
  if (!inviteLink || typeof inviteLink !== "string" || !inviteLink.startsWith("https://")) {
    return new Response(JSON.stringify({ error: "Invalid invite link." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stream = new ReadableStream({
    start(controller) {
      // Use a timeout to ensure initial data is sent
      const initialTimer = setTimeout(() => {
        controller.enqueue("LOG:INFO:Process initializing... (Waiting for Python startup)\n");
      }, 500);

      const process = spawn("python3", ["-u", "bot.py", "--count", numCount.toString(), "--url", inviteLink]);

      process.stdout.on("data", (data) => {
        clearTimeout(initialTimer);
        controller.enqueue(data.toString());
      });

      process.stderr.on("data", (data) => {
        clearTimeout(initialTimer);
        controller.enqueue(`LOG:ERROR:${data.toString()}\n`);
      });

      process.on("error", (err: any) => {
        clearTimeout(initialTimer);
        if (err.code === "ENOENT") {
          controller.enqueue("LOG:ERROR:System Error: Python not found (ENOENT).\n");
          controller.enqueue("LOG:WARN:This bot requires a full server (VPS/Codespaces) with Python & Chrome installed.\n");
          controller.enqueue("LOG:WARN:Vercel/Serverless environments do not support this browser automation stack.\n");
        } else {
          controller.enqueue(`LOG:ERROR:Failed to start process: ${err.message}\n`);
        }
        controller.close();
      });

      process.on("close", (code) => {
        clearTimeout(initialTimer);
        if (code !== 0) {
          controller.enqueue(`LOG:ERROR:Process exited with code ${code}\n`);
        } else {
          controller.enqueue(`LOG:SUCCESS:Bot sequence completed.\n`);
        }
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
