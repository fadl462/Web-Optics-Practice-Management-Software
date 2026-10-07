import crypto from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-review-password.mjs "YOUR-PASSWORD"');
  process.exit(1);
}
if (password.length < 14) {
  console.error("Password must be at least 14 characters.");
  process.exit(1);
}

const iterations = 150000;
const salt = crypto.randomBytes(16);
const derived = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");

const b64u = b => b.toString("base64url");
console.log(`pbkdf2$sha256$${iterations}$${b64u(salt)}$${b64u(derived)}`);
