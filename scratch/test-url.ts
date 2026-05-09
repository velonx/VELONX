import { NextRequest } from "next/server";

const req = new NextRequest("https://velonx-qsw6aery2a-em.a.run.app/api/auth/signin/google", {
  headers: {
    "host": "velonx-qsw6aery2a-em.a.run.app",
    "x-forwarded-host": "velonx.in",
    "x-forwarded-proto": "https"
  }
});

console.log("Original URL:", req.url);
console.log("Original Host:", req.headers.get("host"));

req.headers.set("host", "velonx.in");
console.log("Modified Host:", req.headers.get("host"));
console.log("Modified URL:", req.url);
