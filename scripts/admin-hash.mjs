// usage: npm run admin:hash -- "your-password"
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const pw = process.argv[2];
if (!pw || pw.length < 8) {
  console.error('Parol kamida 8 belgi bo‘lsin:  npm run admin:hash -- "parolingiz"');
  process.exit(1);
}
console.log("ADMIN_PASSWORD_HASH=" + bcrypt.hashSync(pw, 12));
console.log("SESSION_SECRET=" + crypto.randomBytes(32).toString("base64url"));
