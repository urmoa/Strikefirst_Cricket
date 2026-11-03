# Strike First — mängude osa

Next.js 15, React 19, TypeScripti ja Prisma 6 peal töötav mängurakenduse mustand, mis on juurutatud Vercelisse ja ühendatud Neoni PostgreSQL-iga. Arendusala on **`/play`**: Cricket on mängitav, X01 sisaldab praegu mängutüübi valikut. Klubi päris avaleht, sündmused, uudised, liikmelisus ja edetabel jäävad sellest teostusest välja.

See juhend kirjeldab praegust teostust. Varasemate arendusetappide testide arvud ja brauserikontrollid on [kontrollide ajaloos](./docs/verification-history.md); need ei kinnita praeguse versiooni kontrollimist.

## Avalik rakendus ja juurutamine

- Rakendus: [strikefirst-zeta.vercel.app](https://strikefirst-zeta.vercel.app); [Cricket](https://strikefirst-zeta.vercel.app/play/cricket).
- GitHub: [urmoa/Strikefirst_Cricket](https://github.com/urmoa/Strikefirst_Cricket), ühendatud Verceli projektiga `strikefirst-cricket/strikefirst`.
- Verceli serverifunktsioonid töötavad Frankfurdis (`fra1`). Neoni projekt on `bitter-term-18836815`, haru `production`, andmebaas `neondb` (AWS Frankfurt).
- Production-keskkonna salajane `DATABASE_URL` kasutab piiratud õigustega `strikefirst_app` rolli ja pooled TLS ühendust. Omanikuühendus jääb eraldi migratsioonide jaoks.

Verceli GitHubi rakenduse ligipääs on piiratud selle ühe repositooriumiga.
GitHubi push'id käivitavad Git-põhiseid juurutusi; kohalikud commit'imata muudatused
jõuavad sinna alles pärast commit'i ja push'i. Preview-keskkonna andmebaasiühendust
pole seadistatud; selle jaoks kasuta eraldi Neoni haru ja piiratud kasutajat.

Kohalikust töökaustast saab tootmisversiooni juurutada ka CLI kaudu:

```powershell
npm run build
npx --yes vercel@latest deploy --prod --yes
```

Migratsioonid tuleb käivitada eraldi enne juurutamist; Verceli build genereerib
Prisma kliendi, kuid migratsioone ei rakenda. Kohalikud env-failid ja varukoopiad
on Gitist ning Verceli üleslaadimisest välistatud.
Seadistus, kordusjuurutus ja 2026-11-03 kontrollitulemused on
[Verceli juhendis](./docs/vercel-deployment.md) ning [Neoni juhendis](./docs/neon-setup.md).
Avalikul rakendusel kontrolliti lehti, andmebaasi tervisekontrolli ja profiili
otsingust mängu lisamist. GitHubi ühendus kinnitati seadetes; eraldi test-push'i ei tehtud.

## Käivitamine

Vaja on Node.js 22.18 või uuemat ning npm-i. Automaattestid kasutavad Node.js-i sisseehitatud TypeScripti tuge.

```powershell
npm install
npm run dev
```

Ava [http://localhost:3000/play](http://localhost:3000/play). Server kuulab aadressil `127.0.0.1`. Hõivatud pordi korral väljastab arendusserver järgmise vaba pordi; kindla pordi saad valida käsuga `npm run dev -- --port 3001`.

Mängijaprofiilide otsing ja andmebaasi tervisekontroll vajavad seadistatud PostgreSQL-i ühendust. Projekt kasutab nüüd Neoni production-baasi piiratud rakenduse kasutajaga; ühendusfailid, pilvemigratsioonid ja Verceli keskkonnamuutujad on kirjeldatud [Neoni juhendis](./docs/neon-setup.md). Rakenduse ühenduse näidis on failis [.env.example](./.env.example); varasema kohaliku baasi juhis asub [andmebaasidokumentatsioonis](./docs/local-database.md). Cricketit saab mängida ka külalistega, ilma toimiva profiiliotsinguta.

## Lehed ja API

| Marsruut | Praegune funktsioon |
| --- | --- |
| `/` | Avalehe kohatäitja lingiga mängudesse. |
| `/play` | Cricketi ja X01 valik. Logo ja „Tagasi” viivad avalehele `/`. |
| `/play/cricket` | Cricketi seadistus, mäng, legid, Undo/Redo ja kordusmäng. Tagasinupp viib `/play` lehele. |
| `/play/x01` | 501, 1001, 170, 301, 401 ja DIDO 501 valik. Punktiarvestust ega mängu alustamist veel pole; tagasilingid viivad `/play` lehele. |
| `GET /api/players?q=...` | Vähemalt kahe tähemärgiga nimeotsing: kuni 12 profiili ID ja nimega. |
| `GET /api/health` | Andmebaasiühenduse kontroll: HTTP 200 töötava ühendusega, HTTP 503 ühenduse veaga. |

## Cricketi praegune käitumine

### Seadistamine ja punktid

- Mängu alustamiseks lisa **2–6 mängijat**, valides otsingust profiili või lisades nimega külalise. Mängijaid saab eemaldada, ümber nimetada ja üles/alla liigutada. Tühi või ainult tühikutest koosnev nimi takistab vormi esitamist.
- „Vaheta järjekorda” liigutab esimese mängija viimaseks. Esimest legi alustab nimekirja esimene mängija; järgmiste legide alustaja liigub mängijate ringis edasi.
- Iga mängija sulgemispiir on **1–9 märki**, vaikimisi 3. Vaikimisi sihtmärgid on **20, 19, 18, 17, 16, 15 ja Bull**. Täpsemates seadetes saab valida 1–8 sihtmärki numbrite 10–20 ja Bulli hulgast või juhusliku kaheksa sihtmärgi komplekti.
- Kahe mängijaga on vaikimisi **Punktimäng**, kolme või enamaga **Kõrilõikaja**. Käsitsi valitud variant säilib mängijate lisamisel ja eemaldamisel.
- Formaadid 1/3/5 tähendavad vastavalt 1/2/3 legivõitu. Kahe mängijaga kuvatakse „1 leg”, „3 legi (2 võitu)” ja „5 legi (3 võitu)”; rohkemate mängijatega vajalikku legivõitude arvu. Mitme mängija seeria kogupikkus võib ületada formaadi arvu.
- Täpsemates seadetes saab valida ka kahe mängija vastamisi tulemustabeli; selle väljalülitamisel kasutatakse mängijakaarte. Rohkemate mängijatega kasutatakse alati mängijakaarte.

Punktimängus annavad sulgemispiiri ületavad tabamused viskajale punkte, kui vähemalt ühel vastasel on sihtmärk avatud. Kõrilõikajas saab sama punktisumma iga avatud sihtmärgiga vastane. Võiduks tuleb sulgeda kõik valitud sihtmärgid ning Punktimängus koguda vähemalt sama palju punkte kui iga vastane, Kõrilõikajas kõige rohkem sama palju kui iga vastane. Kõrilõikajas võib teise mängija sisestus tuua võidu juba kõik sihtmärgid sulgenud vastasele.

Tabelis näidatakse sulgemismärke koos punkte andnud lisamärkidega. Näiteks vaikimisi sulgemispiiri korral annab D20 + T20 näidu **5/3** ja 40 punkti, kui vastane on avatud. Sulgemist ja värve määrab mängija enda sulgemispiir. Suletud sihtmärk on roheka taustaga; vastase suletud, kuid mängija enda avatud sihtmärk punaka taustaga. Kõigi mängijate suletud sihtmärgi sisestusnupud on keelatud.

### Sisestamine ja Undo/Redo

| Sisestusviis | Käitumine |
| --- | --- |
| Noolte sisestus | S/D/T, Bull 25/50 ja möödavise. Kolm noolt vahetavad käiku automaatselt; käigu saab lõpetada ka varem. Undo tühistab terve praeguse käigu sisestuse, tühja käigu korral eelmise käigu. |
| Märkide sisestus | Valitakse ekraanil laiusega alla 760 px **ja** kõrgusega alla 1020 px. Vajutus lisab ühe märgi; käigus saab sisestada kuni 9 märki kuni kolmele erinevale sihtmärgile. Käik lõpetatakse käsitsi. Undo tühistab ühe märgi või käigu üleandmise sündmuse. |

Poolelioleva käigu sisestusviis säilib ekraani suuruse muutumisel. Uue tühja käigu režiim valitakse uuesti ekraani järgi. Tagasivõtmine töötab ka võidu järel ja üle legipiiri. Redo taastab tühistatud seisu; uus sisestus, järgmine leg ja kordusmäng tühjendavad Redo ajaloo.

Legivõidu järel saab minna järgmisse legi; kohtumise lõpus alustada sama seadistusega kordusmängu või naasta seadistusse.

Tab ja Shift+Tab liiguvad nuppude vahel, Enter ja Space aktiveerivad fookuses nupu. Mänguvaates toimivad Ctrl/Cmd+Z ja Ctrl/Cmd+Shift+Z; Windowsis ka Ctrl+Y taastamiseks. Tekstiväljades säilib brauseri teksti Undo/Redo. Mängija nimeväljal viib Enter järgmisele väljale; külalise väljal lisab nimega külalise.

### Salvestamine ja lahkumine

Cricket salvestab alustatud kohtumise seadistuse, mänguseisu ning Undo/Redo ajaloo brauserikaardi `sessionStorage`-isse pärast iga muudatust. Seis säilib sama kaardi sessiooni jooksul ka lehe värskendamisel ja mängude loendisse naasmisel. Cricketi uuesti avamisel küsib „Pooleli mäng” hüpikaken, kas jätkata salvestatud mängu või alustada uut.

„Alusta uut” avab seadistuse; vana salvestus asendatakse alles uue mängu tegelikul alustamisel. Hüpikakna sulgemine Escape-klahviga säilitab salvestuse. Kohtumise võit kustutab salvestuse, lõpetatud leg pooleliolevas seerias säilib. Võidu tagasivõtmisel salvestatakse taastatud pooleliolev mäng uuesti. Vigane või ühildumatu salvestus eemaldatakse; keelatud või täis brauserisalvestus ei takista mängimist.

Kaardi sulgemisel sessioon tavaliselt lõpeb, kuid brauseri kaardi/akna taastamine võib taastada ka salvestuse. Eraldi avatud kaardil on oma sessioon; kaardi dubleerimine võib brauseris algse salvestuse kopeerida. Püsivat seadmeteülest salvestamist pole. Andmebaas on kasutusel mängijate otsinguks ja tervisekontrolliks; mänguseisu ega tulemusi sinna veel ei salvestata. Kasutajate autentimist ja keelevalikut pole rakendatud. Andmebaasi salvestamine ja taastamine on [andmebaasiplaani](./docs/cricket-database-plan.md) ettepanekud.

## Kontrollimine ja tootmisehitus

```powershell
npm test
npm run typecheck
npm run build
npm start
```

`npm test` käivitab [testid](./tests/) Node.js-i testikäivitajaga; `typecheck` kontrollib TypeScripti tüüpe. `npm start` vajab edukat tootmisehitust. Serveri peatamiseks vajuta terminalis Ctrl+C. Kuupäevaga kontrollitulemused ja nende piirangud asuvad [kontrollide ajaloos](./docs/verification-history.md).

Arendusserver kasutab vaikimisi väljundkausta `.next-dev`; tootmisehitus ja `npm start` kasutavad `.next`. Kausta saab muuta keskkonnamuutujaga `STRIKE_FIRST_DIST_DIR`. Samaaegselt töötavatele protsessidele vali erinevad väljundkaustad ning kasuta tootmisehituse ja selle käivitamise jaoks sama väärtust. Näiteks eraldi kontrollversiooni jaoks:

```powershell
$env:STRIKE_FIRST_DIST_DIR = '.next-check'
npm run build
npm start -- --port 3003
```

## Koodi ja dokumentatsiooni asukohad

| Asukoht | Vastutus |
| --- | --- |
| [Rakenduse marsruudid](./src/app/) | Lehed, metaandmed ja API. |
| [Cricketi komponendid ja hook'id](./src/app/play/cricket/) | Seadistus, mängijavalik, mänguvaade ja kohtumise juhtimine. |
| [Cricketi reeglimootor](./src/lib/cricket.ts) | Valideerimine, sündmustest arvutatav seis, punktid, käigud, legid ja tagasivõtmine. |
| [Mängude loend](./src/lib/games.ts) | Mänguvaliku kohalik kataloog. |
| [Prisma klient](./src/lib/db.ts) | Ainult serveris kasutatav andmebaasiühendus. |
| [Tõlkefunktsioon](./src/lib/i18n.ts) ja [eesti sõnastik](./src/lib/locales/et.ts) | Tüübitud võtmed ja nimelised kohatäited; praegu ainus keel `et`. |
| [Üldpaigutus](./src/app/globals.css) ja [ühiskujundus](./styles/strike-first.css) | Üldised lehe- ja teemastiilid. |
| [Cricketi ühistiil](./src/app/play/cricket/cricket.css) ja [tüpograafia](./src/app/play/cricket/cricket-typography.css) | Cricketi teema, nupud ja fondiskaala. |
| [Seadistuse stiil](./src/app/play/cricket/cricket-setup.css), [mänguvaade](./src/app/play/cricket/cricket-game.css), [tabelid](./src/app/play/cricket/cricket-scoreboard.css) ja [sisestus](./src/app/play/cricket/cricket-controls.css) | Vastava funktsiooni juures hoitavad Cricketi paigutused. |
| [Kohalik Montserrat](./src/app/fonts/) | Fondifail ja litsents; laaditakse juurpaigutuses `next/font/local` abil. |
| [Andmebaasijuhend](./docs/local-database.md) | Kohaliku PostgreSQL-i seadistus, rollid, migratsioonid ja kontrollid. |
| [Neoni juhend](./docs/neon-setup.md) | Pilvebaasi ühendused, piiratud roll, migratsioonid ja kontrollid. |
| [Verceli juhend](./docs/vercel-deployment.md) ja [seadistus](./vercel.json) | Avalik aadress, GitHubi ühendus, keskkonnamuutujad ja juurutamine. |
| [Tööskeem](./prisma/schema.prisma) ja [migratsioonid](./prisma/migrations/) | Rakenduse Prisma mudelid ja migratsiooniajalugu. |
| [Lähteskeem](./.codex/schema.prisma) ja [tehniline kontekst](./.codex/README.md) | Kasutaja antud algne andmebaasiskeem ja taustinfo. |
| [Struktuurne ülevaade](./docs/structural-review.md) | 02.11.2026 seisul koostatud tähelepanekud ja parandamisettepanekud. |
| [Kontrollide ajalugu](./docs/verification-history.md) | Varasemad kontrollitulemused, mitte praeguse käitumise juhend. |

Uue keele lisamise alus on sama võtmekomplektiga `Dictionary` ja selle registreerimine tõlkefunktsiooni sõnastikes. Praegune `t` kasutab vaikekeelt; valitava keele edastamine komponentidele ja metaandmetele vajab eraldi teostust.

Ülejäänud [arendusplaanid](./docs/) kirjeldavad kavatsusi ja varasemaid lahendusi. Plaani olemasolu ei tähenda, et see on rakendatud; praegust käitumist kirjeldab see README ning täpseid reegleid lähtekood.
