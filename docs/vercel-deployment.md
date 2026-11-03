# Verceli juurutus

Rakendus juurutati 2026-11-03: [strikefirst-zeta.vercel.app](https://strikefirst-zeta.vercel.app).
Verceli projekt on `strikefirst-cricket/strikefirst`.
[Juurutuse vaade](https://vercel.com/strikefirst-cricket/strikefirst/EVemwwRi9UQfSnsLBmMroHDPgTje).

## Seadistus

- Next.js tuvastatakse automaatselt; build on `npm run build`.
- Prisma klient genereeritakse projekti `postinstall` käsuga.
- [vercel.json](../vercel.json) määrab serverifunktsioonide regiooniks Frankfurdi (`fra1`).
- Production-keskkonnas on üks Secret-tüüpi muutuja: `DATABASE_URL`.
  See kasutab Neoni `production` haru pooled TLS ühendust piiratud rolliga
  `strikefirst_app`. Omaniku ühendust Vercelisse ei lisatud.
- [.vercelignore](../.vercelignore) välistab kohalikud env-failid, varukoopiad,
  agendikonteksti ja administreerimisskriptid. Prisma skeem jääb build'i jaoks sisse.
- Kohalik `.vercel` projektiseos ja CLI loodud `.env.local` on Gitist välistatud.
- Migratsioonid tehakse enne juurutust eraldi omaniku ühendusega vastavalt
  [Neoni juhendile](./neon-setup.md); Verceli build neid ei käivita.

## Järgmine juurutus

```powershell
npm run build
npx --yes vercel@latest deploy --prod --yes
```

CLI üleslaadimine avaldab ka kohaliku töökausta commit'imata rakenduse muudatused.
2026-11-03 ühendati GitHubi konto ja repositoorium `urmoa/Strikefirst_Cricket`
Verceli projektiga. Verceli GitHubi rakenduse ligipääs on piiratud selle ühe
repositooriumiga. Seos on kinnitatud projekti Git-seadetes (Connected Git Repository)
ja CLI vastusega `already connected to your project`.
Git-põhised juurutused kasutavad repositooriumisse push'itud koodi;
kohalikud commit'imata muudatused jõuavad sinna alles commit'i ja push'i järel.
Sidumise kontrolliks eraldi commit'i ega push'i ei tehtud.

Preview-keskkonda production-baasi ühendust ei lisatud. Preview jaoks seadista
eraldi Neoni haru ja selle piiratud kasutaja.

## Kontrollitud

- Verceli build: `Compiled successfully`, 7/7 staatilist lehte,
  `Build Completed in /vercel/output`; juurutuse staatus `Ready`.
- Serverifunktsioonide regioon: `fra1`.
- Avalik aadress vastab ilma Verceli sisselogimiseta.
- `/` ja `/play/cricket`: HTTP 200.
- `/api/health`: HTTP 200 ja `database: connected`.
- `/api/players?q=martin`: HTTP 200, Martin Tamm.
- `/api/players?q=ANNA`: HTTP 200, Anna Kask.
- Ühe tähemärgi otsing tagastab tühja loendi, üle 60 tähemärgi otsing HTTP 400.
- Kontrollitud API-vastustel on `Cache-Control: no-store`.
- Avaliku rakenduse brauserikontroll: otsing `martin` leidis Martin Tamme;
  nupule vajutades lisandus profiil mängijate loendisse ja arv muutus 1/6.

Cricketi mänguseisu pilve salvestamist juurutus ei lisa; see on
[eraldi arendusplaanis](./cricket-database-plan.md).
