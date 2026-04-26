import { NextRequest, NextResponse } from "next/server";

interface ServiceStatus {
  name: string;
  status: "ok" | "degraded" | "down";
  latency?: number;
}

export async function GET(request: NextRequest) {
  const services: ServiceStatus[] = [];
  const checks = [
    {
      name: "Ticketmaster",
      url: `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${process.env.TICKETMASTER_API_KEY}&size=1`,
    },
    {
      name: "Amadeus",
      url: "https://test.api.amadeus.com/v1/security/oauth2/token",
    },
  ];

  for (const check of checks) {
    const start = Date.now();
    try {
      const res = await fetch(check.url, {
        method: check.name === "Amadeus" ? "HEAD" : "GET",
        signal: AbortSignal.timeout(3000),
      });
      services.push({
        name: check.name,
        status: res.ok || res.status === 405 ? "ok" : "degraded",
        latency: Date.now() - start,
      });
    } catch {
      services.push({
        name: check.name,
        status: "down",
        latency: Date.now() - start,
      });
    }
  }

  const allOk = services.every((s) => s.status === "ok");
  return NextResponse.json(
    { status: allOk ? "ok" : "degraded", services, timestamp: new Date().toISOString() },
    { status: 200 }
  );
}
