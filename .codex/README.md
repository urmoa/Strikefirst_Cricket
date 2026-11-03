# Projekti tehniline kontekst

Kasutaja edastatud projekti andmebaasiskeem on täies mahus failis [schema.prisma](./schema.prisma). See on algse manuse muutmata koopia ja edasise arenduse lähteinfo.

## Tehnoloogia

- Rakenduse raamistik: Next.js 15.
- Kasutajaliides: React 19.
- ORM: Prisma, klient `prisma-client-js`.
- Andmebaas: PostgreSQL.
- Ühendus loetakse keskkonnamuutujast `DATABASE_URL`. Rakenduse Neoni ühendus on Git-ist välistatud `.env` failis; pilvebaasi omanikuühendus on eraldi `.env.neon.migrations` failis. Varasem kohalik ühendus on `.env.before-neon` failis ja kohaliku administraatori ühendus `.env.migrations` failis.
- Rollid: `ADMIN`, `MEMBER`.
- Sündmuse olekud: `UPCOMING`, `COMPLETED`, `CANCELLED`.

## Majutus ja andmebaas

- Serveri ja rakenduse majutus: [Vercel](https://vercel.com/), projekt `strikefirst-cricket/strikefirst`.
- PostgreSQL-andmebaasi majutus: [Neon](https://neon.com/). 2026-11-03 ühendati projekt `bitter-term-18836815`, haru `production`, baas `neondb` (AWS Frankfurt). Migratsioonid ja piiratud rakenduse roll `strikefirst_app` on seadistatud; build, API-d ja brauseri profiiliotsing kontrollitud. Seadistus on [Neoni juhendis](../docs/neon-setup.md).
- Rakendus juurutati Vercelisse 2026-11-03: [strikefirst-zeta.vercel.app](https://strikefirst-zeta.vercel.app). Projekt `strikefirst-cricket/strikefirst`, serverifunktsioonid Frankfurdis (`fra1`), Neoni ühendus piiratud rolliga. Seadistus ja kontrollid on [Verceli juhendis](../docs/vercel-deployment.md). Varasem kohalik PostgreSQL 18 andmebaas `strikefirst` säilib; juhend on [kohaliku andmebaasi juhendis](../docs/local-database.md).
- GitHubi repositoorium [urmoa/Strikefirst_Cricket](https://github.com/urmoa/Strikefirst_Cricket) ühendati Verceli projektiga 2026-11-03. Verceli GitHubi rakendusel on ligipääs ainult sellele repole. Seos kinnitati Verceli Git-seadetes; eraldi test-push'i ei tehtud. Git-põhine juurutus kasutab push'itud koodi, mitte kohalikke commit'imata muudatusi.
- Verceli Production-keskkonnas on salajane `DATABASE_URL` rakenduse pooled TLS ühendusega. Omanikuühendust Vercelisse ei lisatud. Preview-baasi ühendus vajab eraldi Neoni haru ja piiratud kasutajat. Migratsioonid käivitatakse enne juurutamist eraldi; Verceli build genereerib ainult Prisma kliendi.
- Cricketi mänguseis ja Undo/Redo ajalugu säilivad praegu brauserikaardi `sessionStorage`-is. Pilvebaasist kasutatakse profiiliotsingut ja tervisekontrolli; mängude ja tulemuste salvestamine ootab [andmebaasiplaani](../docs/cricket-database-plan.md) teostamist.

## CSS ja kujundus

### Salvestatud CSS ja kinnitatud väärtused

Kasutaja hiljem edastatud CSS on salvestatud loetaval kujul faili [styles/strike-first.css](../styles/strike-first.css). Koodiploki märgid on eemaldatud; algne vormindamine kontrolliti PostCSS-parseriga. Fail on nüüd imporditud rakenduse juurpaigutuses. Algse lehe fondifailidele viitavad Montserrati `@font-face` reeglid on asendatud kohaliku fondiseadistusega.

CSS kinnitab varasemale HTML-analüüsile lisaks:

- Tailwind CSS-i versioon on **3.4.19** (faili litsentsikommentaari järgi).
- Põhifont on **Montserrat**. Algses CSS-is olid määratlused kaaludele 500, 800 ja 900 ning Arialil põhinev varufont; kohalik teostus toetab püstkirja kaale 100–900.
- `felt` ja `panel` on mustad (`#000000`), `flight` on punane (`#BA0C2F`), `limeglow` on helehall (`#D0D0CE`). Nimi `limeglow` ei tähenda selles teemas laimirohelist. Eraldi utiliitides leidub ka värvi `#D4EE2C`.
- Kohalik font [Montserrat-Variable.ttf](../src/app/fonts/Montserrat-Variable.ttf) laaditakse `next/font/local` abil [juurpaigutuses](../src/app/layout.tsx), muutujaga `--font-montserrat` ja laadimisrežiimiga `swap`. Fondilitsents on [OFL.txt](../src/app/fonts/OFL.txt). Font ei vaja ehitamisel ega brauseris välist fonditeenust.

Allolev HTML-analüüs kirjeldab algse manuse põhjal tehtud järeldusi; versiooni, fondi ja värvide puhul kehtivad ülal CSS-ist kinnitatud väärtused.

Järgnev info põhineb kasutaja edastatud olemasoleva Strike Firsti lehe HTML-il ja kirjeldab lähtelehe lahendust. Kohalik kasutajaliidese mustand ja CSS on nüüd seadistatud.

- HTML-i klassid viitavad Tailwind CSS-i kasutusele, näiteks `flex`, `grid`, `rounded-xl`, `text-sm`, `sm:grid-cols-2` ja `lg:grid-cols-3`. Tailwindi täpne versioon ei ole teada.
- Kujundus kasutab projekti kohandatud värvinimesid `felt`, `panel`, `flight`, `limeglow` ja varju `shadow-glow`. Nende täpsed väärtused tuleb võtta CSS-ist või algsest teema konfiguratsioonist; nimede põhjal ei saa värvikoode kinnitada.
- Klassid viitavad tumedale kujundusele, valgele eri läbipaistvusega tekstile, õhukestele poolläbipaistvatele ääristele, ümardatud kaartidele ja helendavatele aktsentidele.
- Paigutus kasutab Flexboxi ja Gridi ning ekraanisuuruste variante `sm:`, `lg:`, `xl:`, `2xl:` ja erandit `min-[390px]:`. Säilitada tuleb mobiilimenüü, kohanduvad veerud, fikseeritud päis ja allserva kleepuv jalus.
- Interaktsioonides on `hover:`, `focus-visible:`, `disabled:` ja `group-hover:` olekud ning üleminekud. Arenduses tuleb säilitada klaviatuurifookuse nähtavus ja nuppude olekud.
- Ikoonid pärinevad Lucide'i ikoonikomplektist, näiteks `lucide-house` ja `lucide-trophy`. Reacti teostuses saab neid kasutada paketist `lucide-react`; algse projekti täpne pakett ja versioon vajavad kinnitamist.
- Kirjatüüp kuulub sans-serif-perekonda. HTML sisaldab Next.js-i genereeritud fondiklassi ning WOFF2-failide viiteid, kuid täpne fondinimi ei selgu manusest.
- HTML-ist ei saa kinnitada valmis komponenditeegi, näiteks shadcn/ui kasutust. Teema taastamisel ei tule selle olemasolu eeldada.

### CSS-i hankimine olemasolevalt lehelt

Manuses viidatud kompileeritud stiilifail: [a3d1f0029d545071.css](https://www.strikefirst.ee/_next/static/css/a3d1f0029d545071.css).

1. Ava CSS-i link brauseris ja salvesta fail käsuga `Ctrl+S` (näiteks nimega `reference.css`).
2. Kui link enam ei tööta, ava olemasolev veebileht, seejärel arendajatööriistad (`F12` või `Ctrl+Shift+I`). Vali **Network**, filtreeri **CSS** ja laadi leht uuesti.
3. Ava CSS-päring uuel vahelehel ning salvesta fail. Kui leht laadib mitu CSS-faili, salvesta kõik vajalikud failid; teistel alamlehtedel võib olla lisastiile.

See on Next.js-i koostatud, tavaliselt minimeeritud väljund. Faili nime räsi võib uue juurutusega muutuda. Kompileeritud CSS-ist saab otsida värve, varje, fondimääratlusi ja kasutatud stiile, kuid see ei taasta algseid Reacti komponente ega kogu Tailwindi konfiguratsiooni. Fondid ja pildid tuleb hankida eraldi.

Kui algne lähtekood on olemas, eelista sealt globaalset CSS-i, Tailwindi teema seadistust (sõltuvalt versioonist konfiguratsioonifailis või CSS-is), fondiseadistust ja komponente. Pakettide versioonid tuleb kontrollida algse projekti sõltuvustest. Kompileeritud võrdlusfaili ei tule automaatselt uue rakenduse globaalse CSS-ina kasutusele võtta.

## Andmemudelid

- Liigad ja hooajad: `League`, `Season`.
- Kasutajad, liikmeks astumine ja liikmelisuse perioodid: `User`, `MembershipApplication`, `MembershipPeriod`.
- Mängijad: `Player`; kasutajal võib olla üks seotud mängijaprofiil.
- Uudised ja veebisisu: `NewsPost`, `NavigationItem`, `SocialLink`, `Sponsor`, `StaticText`.
- Mängukategooriad ja mängud: `GameCategory`, `Game`.
- Sündmused, tulemused, kohtumised ja registreerumised: `Event`, `EventResult`, `Match`, `EventRegistration`.
- Liikmetele mõeldud soodustused, ressursid ja teated: `MemberDiscount`, `MemberResource`, `MemberMessage`.
- Noolegolfi rajad: `DartGolfCourse`; rajad sisaldavad JSON-kujul aukude sihtmärke ja par-väärtusi.

## Arenduse lähtekohad

- Täpsed väljad, seosed, kustutamiskäitumine, vaikeväärtused, unikaalsuspiirangud ja indeksid on kirjas skeemis.
- Mitmel sisumudelil on eesti- ja ingliskeelsed väljad (`Et`, `En`); osa mudeleid sisaldab ka üldist nime, kirjeldust või sisu.
- Liigal ja hooajal on valikuline `rankingEventLimit`; selle rakendamise äriloogikat ei ole edastatud.
- Skeem kirjeldab struktuuri, mitte olemasolevaid andmekirjeid, töötavat andmebaasiühendust ega täielikke ärireegleid.
- Siinne skeem jääb algseks projekti kontekstiks. Rakenduse tööskeem on [prisma/schema.prisma](../prisma/schema.prisma); migratsioonid on [prisma/migrations](../prisma/migrations) kaustas.

Allikas: kasutaja manus „Pasted text #1”, salvestatud 2026-10-31.
