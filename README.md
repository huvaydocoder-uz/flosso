# FLOSSO — sayt

Penoplast fasad dekori ishlab chiqaruvchi FLOSSO uchun landing sayt: 3 til (o‘zbek, rus, ingliz), katalog, kalkulyator, tayyor yechimlar, ariza formasi va admin panel.

## Ishga tushirish (kompyuterda)

```bash
npm install
npm run dev
```

- Sayt: http://localhost:3000 (o‘zbekcha), /ru, /en
- Admin: http://localhost:3000/admin
  - `.env.local` bo‘lmasa, lokal login: **admin@flosso.uz / flosso2026** (faqat kompyuterda ishlaydi, haqiqiy saytda o‘chadi)

Hech narsa sozlanmasa ham sayt ishlaydi: baza `.data/pglite` papkasida, yuklangan rasmlar `public/uploads` da saqlanadi.

## Joylash (Netlify)

- Build sozlamalari `netlify.toml` da (`npx next build --webpack`, Next.js plagini ulangan).
- Maxfiy sozlamalar Netlify → Project configuration → Environment variables'ga kiritiladi (`.env.example` dagi ro‘yxat).
- Lokal maxfiy sozlamalar `.env.local` da (GitHub'ga yuklanmaydi).

## Haqiqiy saytga tayyorlash

`.env.example` faylini `.env.local` deb nusxalang va quyidagilarni to‘ldiring.

### 1. Admin login va parol
```bash
npm run admin:hash -- "kuchli-parol-yozing"
```
Chiqqan `ADMIN_PASSWORD_HASH` va `SESSION_SECRET` qatorlarini `.env.local` ga qo‘ying, `ADMIN_EMAIL` ga o‘z emailingizni yozing.

### 2. Baza — Neon (bepul)
1. https://neon.tech saytida ro‘yxatdan o‘ting → **Create project** (region: Frankfurt).
2. **Connection string** ni nusxalang (`postgresql://...` bilan boshlanadi).
3. `.env.local` dagi `DATABASE_URL=` ga qo‘ying.

Jadvallar va 56 ta mahsulot birinchi ochilishda **avtomatik** yaratiladi — qo‘shimcha buyruq kerak emas.
Vercel'da joylansa: Vercel → Storage → Neon ni ulash bir tugma bilan, `DATABASE_URL` o‘zi qo‘shiladi.

### 3. Arizalar Telegram'ga
Saytdagi barcha Telegram tugmalari bitta manzilga olib boradi: **t.me/Flosso_uz** (o‘zgartirish — `src/lib/contact.ts`). Shaxsiy akkauntga tayyor matn yuborib bo‘lmagani uchun «Telegram'da so‘rash» tugmalari buyurtma matnini nusxalaydi, «Matn nusxalandi» xabarini ko‘rsatadi va chatni ochadi.

Formadan yuborilgan arizalar bot orqali egasiga keladi:
1. Telegram'da **@BotFather** → `/newbot` → nom va username bering → **token** oling.
2. Admin panel → **Telegram** sahifasiga tokenni qo‘ying va «Saqlash» bosing.
3. Egasi (@Flosso_uz) yangi botni ochib **Start** bosadi.
4. Admin panelda «chat_id ni aniqlash» → «Shu chatni tanlash». Sinov xabari keladi.

Xohlasangiz token va chat ID ni Netlify sozlamalariga ham qo‘yish mumkin: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`. Telegram ishlamay qolsa ham ariza yo‘qolmaydi — admin paneldagi **Arizalar** bo‘limida saqlanadi.

### 4. Rasmlar — Vercel Blob
Vercel → Storage → **Blob** → Create → loyihaga ulang. `BLOB_READ_WRITE_TOKEN` o‘zi qo‘shiladi.

## Admin panelda nima qilish mumkin
- **Mahsulotlar:** qo‘shish, tahrirlash, o‘chirish, rasm yuklash, 3 tilda nom.
- Narx va chegirmani **ro‘yxatning o‘zida** o‘zgartirish (Enter yoki «Saqlash»).
- Mahsulotni saytdan vaqtincha yashirish (o‘chirmasdan).
- **Arizalar:** holati — yangi / bog‘lanildi / yopildi; telefonni bosib qo‘ng‘iroq.

## Foydali buyruqlar
| Buyruq | Nima qiladi |
|---|---|
| `npm run dev` | lokal ishga tushirish |
| `npm run build` | production build tekshiruvi |
| `npm run admin:hash -- "parol"` | admin parol xeshi |
| `npm run typecheck` | TypeScript tekshiruvi |

## Tuzilishi
- `messages/uz.json`, `ru.json`, `en.json` — saytdagi barcha matnlar
- `data/products.ts` — boshlang‘ich katalog (bazaga birinchi marta shu yerdan yoziladi)
- `data/solutions.ts` — 4 ta tayyor yechim
- `src/lib/contact.ts` — telefon, manzil, Instagram, Telegram (bir joyda)
- `src/app/globals.css` — ranglar (`--red` va boshqalar)
- `scripts/` — PDF katalogdan rasm, chizma va naqshlarni ajratib olish skriptlari

## Deploy

GitHub: `huvaydocoder-uz/flosso` (branch `main`). Netlify'ga ulansa, `main` ga har bir push avtomatik yig‘ilib joylanadi.
