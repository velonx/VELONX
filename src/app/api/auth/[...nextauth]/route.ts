import { handlers } from "@/auth"
import { NextRequest } from "next/server"

function overrideUrl(req: NextRequest) {
    const url = new URL(req.url);
    if (url.hostname.includes("run.app")) {
        url.hostname = "velonx.in";
        url.port = "";
        url.protocol = "https:";
        // Create a cloned request with the rewritten public URL
        return new NextRequest(url, {
            headers: req.headers,
            method: req.method,
            body: req.body,
            // @ts-ignore - Required for passing streams in some Next.js versions
            duplex: "half",
        });
    }
    return req;
}

export const GET = (req: NextRequest) => handlers.GET(overrideUrl(req));
export const POST = (req: NextRequest) => handlers.POST(overrideUrl(req));
