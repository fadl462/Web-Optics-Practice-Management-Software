import baseWorker from "./worker.js";

const SESSION_COOKIE = "OptiFlowReviewSession";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours
const REVIEW_EMAIL = "client-review@optiflow.review";
const REVIEW_NAME = "Client Reviewer";
const REVIEW_ROLE = "Viewer";

const LOGIN_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>OptiFlow · Client Review</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f4f7f8;color:#17212b;display:grid;place-items:center}
.shell{width:min(440px,calc(100% - 32px));background:#fff;border:1px solid #dce5e8;border-radius:22px;box-shadow:0 22px 60px rgba(23,33,43,.10);padding:36px}
.brand{display:flex;align-items:center;gap:13px;margin-bottom:28px}.logo{width:42px;height:42px;border-radius:13px;background:#123b45;color:#fff;display:grid;place-items:center;font-size:22px}.brand strong{display:block;font-size:21px;letter-spacing:-.02em}.brand span{display:block;color:#71808a;font-size:12px;margin-top:2px}
.kicker{font-size:11px;letter-spacing:.14em;font-weight:800;color:#54727b;margin-bottom:8px}.title{font-size:29px;line-height:1.08;letter-spacing:-.035em;margin:0 0 10px}.copy{color:#6c7a83;line-height:1.55;font-size:14px;margin:0 0 25px}
label{display:block;font-size:12px;font-weight:750;color:#34444d;margin:0 0 7px}input{width:100%;height:48px;border:1px solid #cfdadd;border-radius:11px;padding:0 14px;font:inherit;outline:none;background:#fbfcfc;margin-bottom:16px}input:focus{border-color:#547e88;box-shadow:0 0 0 3px rgba(84,126,136,.12)}
button{width:100%;height:49px;border:0;border-radius:11px;background:#123b45;color:#fff;font:700 14px inherit;cursor:pointer}button:disabled{opacity:.6;cursor:wait}
.notice{display:none;margin:0 0 16px;padding:11px 12px;border-radius:10px;background:#fff1f1;color:#a33d3d;font-size:13px}.foot{margin-top:22px;text-align:center;color:#88949a;font-size:11px;line-height:1.5}
</style>
</head>
<body>
<main class="shell">
<div class="brand"><div class="logo">◉</div><div><strong>OptiFlow</strong><span>Client Review Environment</span></div></div>
<div class="kicker">SECURE REVIEW ACCESS</div>
<h1 class="title">Welcome to OptiFlow</h1>
<p class="copy">Sign in with the review credentials provided to you. This environment contains fictional practice data for product review only.</p>
<div id="notice" class="notice"></div>
<form id="login">
<label for="username">Username</label>
<input id="username" autocomplete="username" required>
<label for="password">Password</label>
<input id="password" type="password" autocomplete="current-password" required>
<button id="submit" type="submit">Sign in to OptiFlow</button>
</form>
<div class="foot">Client Reviewer · View-only access · No production patient data</div>
</main>
<script>
const form=document.getElementById("login"), notice=document.getElementById("notice"), button=document.getElementById("submit");
form.addEventListener("submit",async e=>{
 e.preventDefault(); notice.style.display="none"; button.disabled=true; button.textContent="Signing in…";
 try{
  const r=await fetch("/api/review-login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({username:document.getElementById("username").value,password:document.getElementById("password").value})});
  const p=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(p?.error?.message||"Sign-in failed.");
  location.href="/";
 }catch(err){notice.textContent=err.message;notice.style.display="block";button.disabled=false;button.textContent="Sign in to OptiFlow";}
});
</script>
</body>
</html>`;

function b64u(bytes) {
  return base64url(bytes);
}
function base64url(input) {
  let bytes;
  if (input instanceof Uint8Array) bytes = input;
  else bytes = new TextEncoder().encode(String(input));
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function fromB64u(value) {
  const pad = "=".repeat((4 - value.length % 4) % 4);
  const binary = atob(value.replace(/-/g,"+").replace(/_/g,"/") + pad);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}
function timingSafeEqual(a,b) {
  if (!a || !b || a.length !== b.length) return false;
  let n = 0; for (let i=0;i<a.length;i++) n |= a.charCodeAt(i)^b.charCodeAt(i);
  return n === 0;
}
async function hmac(secret, text) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), {name:"HMAC",hash:"SHA-256"}, false, ["sign"]);
  return base64url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text)));
}
async function pbkdf2(password, salt, iterations) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations,hash:"SHA-256"}, key, 256));
}
async function verifyPassword(password, stored) {
  const parts = String(stored || "").split("$");
  if (parts.length !== 5 || parts[0] !== "pbkdf2" || parts[1] !== "sha256") return false;
  const iterations = Number(parts[2]); if (!Number.isInteger(iterations) || iterations < 100000) return false;
  try {
    const derived = base64url(await pbkdf2(password, fromB64u(parts[3]), iterations));
    return timingSafeEqual(derived, parts[4]);
  } catch { return false; }
}
async function makeSession(env) {
  const payload = base64url(JSON.stringify({u: env.REVIEW_USERNAME || "client-review", exp: Math.floor(Date.now()/1000)+SESSION_TTL_SECONDS}));
  return payload + "." + await hmac(env.REVIEW_SESSION_SECRET, payload);
}
async function readSession(request, env) {
  const raw = request.headers.get("Cookie") || "";
  const match = raw.match(new RegExp("(^|;\\s*)" + SESSION_COOKIE + "=([^;]+)"));
  if (!match) return false;
  const token = match[2];
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const expected = await hmac(env.REVIEW_SESSION_SECRET, parts[0]);
  if (!timingSafeEqual(expected, parts[1])) return false;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromB64u(parts[0])));
    return payload.exp > Math.floor(Date.now()/1000) && payload.u === (env.REVIEW_USERNAME || "client-review");
  } catch { return false; }
}
async function ensureReviewStaff(env) {
  if (!env.DB) throw new Error("Review D1 database is not configured.");
  await env.DB.prepare(
    `INSERT OR IGNORE INTO staff (id,email,name,role,active,created_at,updated_at)
     VALUES ('USR-CLIENT-REVIEW',?,?,?,?,?,?)`
  ).bind(REVIEW_EMAIL, REVIEW_NAME, REVIEW_ROLE, 1, new Date().toISOString(), new Date().toISOString()).run();
}
function authCookie(token) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`;
}
function clearCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
function json(data,status=200,headers={}) {
  return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=UTF-8","cache-control":"no-store",...headers}});
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Login endpoint is deliberately outside the base Worker API.
    if (url.pathname === "/api/review-login" && request.method === "POST") {
      if (!env.REVIEW_PASSWORD || !env.REVIEW_SESSION_SECRET) return json({error:{message:"Client review authentication is not configured."}},503);
      let input={};
      try { input=await request.json(); } catch { return json({error:{message:"Invalid login request."}},400); }
      const username=String(input.username||"").trim();
      const password=String(input.password||"");
      const expectedUsername=String(env.REVIEW_USERNAME||"client-review").trim();
      if (username !== expectedUsername || !await verifyPassword(password,env.REVIEW_PASSWORD)) {
        return json({error:{message:"Invalid username or password."}},401);
      }
      await ensureReviewStaff(env);
      const token=await makeSession(env);
      return json({ok:true},200,{ "set-cookie": authCookie(token) });
    }

    if (url.pathname === "/review-logout") {
      return new Response("",{status:302,headers:{"location":"/","set-cookie":clearCookie(),"cache-control":"no-store"}});
    }

    const authenticated = await readSession(request,env);

    if (!authenticated) {
      if (url.pathname.startsWith("/api/")) {
        return json({error:{message:"Client review sign-in required."}},401);
      }
      return new Response(LOGIN_HTML,{status:200,headers:{"content-type":"text/html; charset=UTF-8","cache-control":"no-store"}});
    }

    // Never expose production-only webhook handling in the review environment.
    if (url.pathname === "/api/webhooks/messages") return json({error:{message:"Messaging webhooks are disabled in the client review environment."}},403);

    // Convert the signed review session into the identity shape already trusted
    // by the OptiFlow application layer. The review Worker is the only code that
    // can create this header; the production Worker remains unchanged.
    const headers = new Headers(request.headers);
    headers.set("Cf-Access-Authenticated-User-Email",REVIEW_EMAIL);
    headers.set("Cf-Access-Authenticated-User-Name",REVIEW_NAME);
    const upstream = new Request(request,{headers});

    return baseWorker.fetch(upstream,env,ctx);
  },
  async scheduled() {
    // No automated messaging/recall jobs run in the client review environment.
  }
};
