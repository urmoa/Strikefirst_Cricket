# Neon PostgreSQL

Rakendus on ühendatud Neoni projektiga `bitter-term-18836815`, organisatsioonis
`org-wild-scene-62329728`, haruga `production`. Andmebaasi nimi on `neondb`,
regioon AWS Frankfurt (`eu-central-1`). Rakendus juurutati Vercelisse 2026-11-03:
[strikefirst-zeta.vercel.app](https://strikefirst-zeta.vercel.app), vt [juurutuse juhend](./vercel-deployment.md).

[neon.ts](../neon.ts) kirjeldab Neoni seadistust. Kasutusel on ainult Postgres;
Authi, Functionseid ega muid teenuseid ei lisatud. Olemasolev Prisma 6 klient ja
Next.js serveripoolsed API-päringud säilivad. Veebipäringud kasutavad pooled TLS
ühendust; migratsioonid kasutavad otsest ühendust.

## Ühendused ja õigused

- `.env`: ainult rakenduse `strikefirst_app` pooled `DATABASE_URL` ja haru nimi.
- `.env.neon.migrations`: Neoni omaniku ühendused, ainult seadistus-/migratsioonikäsule.
- `.env.before-neon`: varasem kohaliku PostgreSQL-i seadistus.
- `.env.migrations`: varasem kohaliku PostgreSQL-i administraatori seadistus;
  tavaline `npm run db:migrate` on jätkuvalt **kohaliku baasi** käsk.

Kõik need env-failid on Gitist ignoreeritud. Ära kopeeri omanikuühendust Verceli
rakenduse keskkonnamuutujaks ega kasuta `NEXT_PUBLIC_` prefiksit.

`strikefirst_app` saab 21 rakenduse tabelis SELECT, INSERT, UPDATE, DELETE ning
järjendites USAGE, SELECT. Tal puuduvad haldusrollid, rolliliikmelisused,
skeemi CREATE, tabeli TRUNCATE ja ligipääs `_prisma_migrations` tabelile.
PUBLIC-i õigused eemaldatakse selle andmebaasi ja public-skeemi küljest.
Neoni ühenduspiirangud teistesse sama haru andmebaasidesse ei ole kohaliku
`pg_hba.conf` reeglitega samaväärsed; seadistus ei muuda teisi andmebaase.

## Migratsioonid ja kontroll

```powershell
npm run db:setup:neon
npm run db:verify:neon
npm run build
npm start
```

[setup-neon.cjs](../scripts/setup-neon.cjs) laadib vaikimisi omanikuühenduse
`.env.neon.migrations` failist, käivitab olemasolevad Prisma migratsioonid,
loob puuduva piiratud rolli, salvestab rakenduse ühenduse `.env` faili ning
rakendab õigused. Olemasoleva rolli parooli ei muudeta; korduskäivitus vajab
tema olemasoleva parooliga runtime env-faili. Käsule võib anda kaks argumenti:
omaniku env-fail ja runtime env-fail, et kontrollida eraldi testharu.

[verify-neon.cjs](../scripts/verify-neon.cjs) kontrollib TLS pooled ühendust,
rolli piiranguid, kõigi tabelite CRUD-õigusi, migratsioonitabeli keeldu ning
Player CRUD-i tagasipööratavas tehingus. Testandmeid ei jäeta baasi.

Neoni `deploy` ja `env pull` kirjutavad vaikimisi omanikuühenduse `.env` faili.
**Ära käivita neid kordusseadistusel otse olemasoleva runtime `.env` peale.**
Järgnevate ühenduste värskendamiseks suuna tõmme administraatori faili:

```powershell
neon env pull --branch production --service postgres --file .env.neon.migrations
npm run db:setup:neon
```

Kui infrastruktuuri muutmiseks on vaja uuesti `neon deploy`, varunda kõigepealt
runtime `.env`; pärast deploy'd tõsta omaniku ühendused administraatori faili
ja taasta runtime `.env` enne rakenduse käivitamist.

Olemasolev algskeem ja 12 demomängija migratsioon prooviti esmalt ajutisel
production-harust loodud kontrollharul ning seejärel rakendati productionile.
Kohaliku baasi andmeid ei kopeeritud. Uusi Cricketi salvestustabeleid ei lisatud.

## Vercel

Lisa Verceli Production keskkonda `.env` failis olev piiratud `DATABASE_URL`.
Build Command: `npm run build`; Prisma klient genereeritakse `postinstall` ajal.
Käivita migratsioonid omanikuühendusega eraldi enne rakenduse juurutamist.
Preview jaoks kasuta eraldi Neoni haru ja selle piiratud kasutajat.

Töötava rakenduse kontrollid:

- `/api/health`: HTTP 200 ja `database: connected`.
- `/api/players?q=martin`: demoprofiil Martin Tamm.
- `/play/cricket`: otsingust saab mängija lisada.

Need ühendused ei lisa Cricketi mänguseisu salvestamist pilve; see vajab
[eraldi plaani](./cricket-database-plan.md) rakendamist.

## Kontrollitud 2026-11-03

- `neon deploy`: `No changes — branch production already matches the policy.`;
  `Utilized services: Postgres`; kolm ühendusmuutujat laaditi env-faili.
- Migratsioonid kontrollharul ja productionil: `All migrations have been successfully applied.`
- Prisma skeemivõrdlus mõlemal harul: `No difference detected.`; algne konteksti
  skeem ja runtime skeem on endiselt identsed.
- `npm run db:verify:neon`: PASS, 21 tabeli CRUD, rollipiirangud, keelatud DDL
  ja migratsioonitabeli lugemine, Player CRUD tehingus tagasipööratud.
- `npm run db:check`: `database: neondb`, `username: strikefirst_app`, `players: 12`.
- Lõplik `npm run build`: exit 0, `Compiled successfully`, 7/7 staatilist lehte.
- `npm start -- --port 3107`: `Ready in 642ms`.
- HTTP kontroll: avaleht 200, health 200 `database: connected`, otsingud
  `martin` ja `ANNA` 200 õigete profiilidega, ühe tähemärgi otsing tühi,
  üle 60 tähemärgi otsing 400; API-del `Cache-Control: no-store`.
- Brauser: otsing `martin` → „Lisa mängija Martin Tamm” → mängijate loendis
  „Martin Tamm”, mängijate arv 1/6.
- Ajutine `setup-validation-20261103` haru eemaldati pärast kontrolli.

CLI `init` ei suutnud automaatselt paigaldada Codexi/VS Code'i Neoni pluginaid
ega Copiloti globaalseid oskusi; olemasolevad projekti oskused olid kasutatavad.
CLI lisas Copiloti MCP seadistuse ja lõi projektiseose. `deploy` brauseri
sisselogimine õnnestus. npm teatas blokeeritud esbuild/Prisma installiskriptidest,
kuid CLI deploy, Prisma migratsioonid ja rakenduse build töötasid.

`npm audit --omit=dev --audit-level=high` lõppes koodiga 1: 5 probleemi
(1 moderate, 4 high), seotud Prisma/deepmerge-ts ja Next.js/PostCSS sõltuvustega.
Automaatselt pakutud parandus vahetaks Prisma ja Next.js põhiversioone;
neid ei muudetud Neoni ühendamise käigus.
