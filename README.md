# Strike First — mängude osa

## Tagasiliikumise kontroll (02.11.2026)

Mänguvaliku „Tagasi” link suunas ekslikult samale `/play` lehele; nüüd viib see avalehele `/`. Korduvad päringud marsruutidele `/play/cricket`, `/play`, `/` ja `/play/x01` tagastasid HTTP 200. Kõik 72 testi, tüübikontroll ja eraldi väljundkaustaga tootmisehitus läbisid. Interaktiivne brauserikontroll jäi pooleli: integreeritud brauseri avamine ebaõnnestus. Brauseri Back/Forward, mängust lahkumise kinnitus ning võiduvaatest naasmine vajavad veel brauseris kontrollimist; HTTP päringud neid ei kata.

## Klaviatuuriga mängimine

Eraldi klaviatuurisisestuse plokk ja selle sisselülitamise valik on eemaldatud. Mängu saab juhtida olemasolevate nuppudega: Tab ja Shift+Tab liiguvad nuppude vahel, Enter ja Space aktiveerivad fookuses nupu.

Ctrl/Cmd+Z tühistab käigu sisestuse ning Ctrl/Cmd+Shift+Z taastab selle; Windowsis töötab taastamiseks ka Ctrl+Y. Tekstiväljades säilib brauseri teksti Undo/Redo. Klaviatuuri abi asub mängueelsetes täpsemates seadetes. Fookuse parandused jäävad alles.

Tabeli märginäit võib ületada kolme: näiteks D20 + T20 annab **5/3** ja 40 punkti, kui mõni vastane on avatud. Kõrilõikajas lisatakse need 40 punkti igale avatud vastasele, kuid lisamärgid kuvatakse viskaja juures ainult ühe korra. Bullil toimib sama arvestus 25 punkti kaupa. Näit kasvab üle kolme ainult tegelikult punkte andnud tabamuste võrra. Sulgemine, võidukontroll, värvid ja keelatud nupud kasutavad endiselt kolme märgi lävendit. Lisamärgid tuletatakse sündmusajaloost ja taastuvad Undo/Redo korral.

Mängija suletud sihtmärk (3/3) on tulemustabelis õrna rohelise taustaga. Sulgemata sihtmärk on õrna punase taustaga siis, kui vähemalt üks vastane on selle sulgenud ja saab sellelt punkte teha (Kõrilõikajas lisada punkte selle mängija summale). Värvid on iga mängija sihtmärgi juures nii kahe kui mitme mängija vaates, sealhulgas bullil. Märginäidud ja tekstilised selgitused säilivad; Undo/Redo uuendab ka taustavärve.

Kõigi mängijate suletud sihtmärgi sisestusnupud on keelatud ja tuhmid, sest see sihtmärk on mängust väljas. Sama kehtib mõlemale bullinupule. Kui vähemalt ühel vastasel on sihtmärk avatud, jäävad nupud lubatuks. Undo/Redo uuendab ka nuppude lubatavust. Tulemuseta noole saab endiselt sisestada möödaviskega. See asendab algse alamplaani nõude lubada kõigi suletud sihtmärgi tabamist kasutajaliideses; reeglimootor käsitleb sellist ajalukku jõudnud tabamust endiselt tulemuseta noolena.

Mängijate nimekirja all on „+ Lisa mängija” ja selle all **Vaheta järjekorda**. Järjekorra vahetamine liigutab esimese mängija viimaseks (kahe mängijaga vahetab nimed omavahel). Esimese legi alustaja on alati nimekirja esimene mängija; eraldi „Kes alustab?” valik on eemaldatud. Kordusmäng kasutab sama nimekirja järjekorda, järgmiste legide alustaja liigub endiselt mängijate ringis edasi.

„Täpsemad seaded” sisaldab punktiarvestuse valikut: **Punktimäng** (Scoring, vaikimisi) ja **Kõrilõikaja** (Cutthroat). Cutthroatis lähevad üle kolme märgi teenitud punktid täies mahus igale vastasele, kellel tabatud sihtmärk on sulgemata. Suletud sihtmärgiga vastased punkte ei saa. Võiduks peavad kõik sihtmärgid olema suletud ja punktisumma olema iga vastase omast väiksem või võrdne. Võitu kontrollitakse iga noole järel ka juba kõik sulgenud mängijatel: teise mängija antud punktid võivad nad võidule viia. Valitud mänguviis kuvatakse mänguvaates ning säilib järgmistes legides, seadistusse naasmisel ja kordusmängus. Aluseks on [reeglifaili](./.codex/cricket.txt) 7. jaotis.

Viimane kontroll: **39/39 testi**, `npm run typecheck` ja tootmisehitus läbisid. Brauseris kontrolliti tavalise mängu ja Cutthroati punktijaotust, kahe ja kolme mängija vaateid, Undo/Redo, kolme legi seeriat, võidu tagasivõtmist, kordusmängu ja mänguviisi säilimist. Kontrolliti 375 px mobiilivaadet (sisestusnupud vähemalt 48 px kõrged, horisontaalset kerimist pole), töölauapaigutust ning avalehe, mänguvaliku ja X01 tõlgitud tekste.

## Tõlked

Punktiarvestuse vaikimisi valik sõltub osalejatest: kahe mängijaga **Punktimäng**, kolme või enamaga **Kõrilõikaja**. Käsitsi valitud mänguviis säilib mängijate lisamisel ja eemaldamisel. Cutthroati eestikeelne nimi on **Kõrilõikaja**.

Kõik rakenduse eestikeelsed kasutajaliidese tekstid, metaandmed, ligipääsetavad nimetused, kinnitused, mängijate vaikenimed ja veateated asuvad [eesti keele tõlkefailis](./src/lib/locales/et.ts). Komponendid kasutavad [ühist tõlkefunktsiooni](./src/lib/i18n.ts): näiteks `t("cricket.won", { name: winner.name })`. Laused on terved ning muutujad nimeliste kohatäidetega, et teistes keeltes saaks sõnajärge muuta. TypeScript kontrollib võtmeid ja kohatäidete argumente. Mängureeglite tunnused ja sündmused jäävad keelest sõltumatuks.

Praegu on ainus keel `et`; sama `currentLocale` määrab ka HTML-i `lang` atribuudi. Uue keele jaoks lisa sama võtmekomplektiga sõnastik (`satisfies Dictionary`) ja registreeri see `dictionaries` loendis. `createTranslator(locale)` loob valitud keele tõlkija nii serveri kui kliendi jaoks. Tulevane keelevalik peab andma valitud keele marsruudi või Reacti konteksti kaudu ka komponentidele ja metaandmetele; praegune `t` kasutab ühist vaikekeelt. Keelevahetuse kasutajaliidest ega keele-eelistuse salvestamist veel pole.

Cricketi sisestuse juures on **Undo** ja **Redo**. Undo eemaldab korraga kogu poolelioleva käigu sisestuse; tühja käigu korral taastab eelmise mängija käigu alguse. See taastab ka punktid, märgid, vooru ja legivõidud. Redo taastab täpse tühistatud seisu ning toetab mitut järjestikust taastamist. Uus sisestus, järgmine leg, uus mäng või kordusmäng tühjendab Redo ajaloo. Nupud jäävad kasutatavaks ka võiduvaates. Seis ja taastamise ajalugu säilivad ainult lehe mälus.

Undo/Redo kontroll: **30/30 testi**, `npm run typecheck` ja tootmisehitus läbisid. Brauseris kontrolliti mõlemas mänguvaates tervikkäigu tühistamist, automaatset ja enneaegset käiguvahetust, korduvat Undo/Redo kasutust, uue sisestuse mõju Redole, võidu taastamist ning 375 px mobiilipaigutust. Eraldi kontrollserver: port 3004.

Next.js 15 ja React 19 peal töötav kohalik mustand, mille arendusala on **`/play`**. Klubi avaleht ja ülejäänud veebileht kuuluvad eraldi arendusse.

## Käivitamine

Eeldus: Node.js 22.18 või uuem ning npm. Cricketi testid kasutavad Node.js-i sisseehitatud TypeScripti tuge.

```powershell
npm install
npm run dev
```

Ava [http://localhost:3000/play](http://localhost:3000/play). Server kuulab kohalikul aadressil `127.0.0.1`. Hõivatud pordi korral väljastab arendusserver terminali järgmise vaba pordi. Kindla pordi saad määrata käsuga `npm run dev -- --port 3001`.

Kui samas projektikaustas töötab teine arendusserver, saab kontrollimiseks kasutada eraldi ehituskausta. Määra PowerShellis `$env:STRIKE_FIRST_DIST_DIR = '.next-cricket'` nii ehituse kui ka serveri käivitamise terminalis; seejärel käivita `npm run build` ja `npm start -- --port 3003`. Vaikimisi kasutatakse endiselt tavalist ehituskausta.

## Lehed ja ulatus

- `/play` — X01 ja Cricketi valik linkidega mängulehtedele.
- `/play/cricket` — standardne Cricket kahele või enamale mängijale algusest võiduni: nimed ja alustaja, tulemustabel, S/D/T, bull ja möödavise, automaatne või enneaegne käiguvahetus, eelmise käigu kokkuvõte, tagasivõtmine ning kordusmäng. Uue mängu alustamine ja mängude lehele lahkumine küsivad poolelioleva, vähemalt ühe tegevusega mängu hülgamisel kinnitust.
- `/play/x01` — X01 mängutüübi valik: 501, 1001, 170, 301, 401 ja DIDO 501. Praegu saab valiku märkida; lisavalikud, edasine seadistamine ja punktiarvestus lisanduvad hiljem.
- `/` — minimaalne kohalik avalehe kohatäitja lingiga mängudesse. Päris Strike Firsti avalehte siin ei ehitata.
- `/api/health` — kohaliku serveri tervisekontroll.

Kõik „Tagasi” lingid viitavad mängude lehele `/play`. Mängude lehe logo viitab juuraadressile `/`.

Sündmused, uudised, klubitutvustus, liikmeks astumine ja edetabel ei kuulu sellesse projekti. Cricketi seis säilib ainult avatud lehe mälus: värskendamine, sulgemine või lahkumine kustutab selle. Brauseri üldist sulgemist ja värskendamist ei blokeerita. Andmebaasiühendust, kasutajakontosid ja brauserisse salvestamist ei kasutata; salvestamine ja taastamine kuuluvad neljandasse sammu.

## Kontrollimine ja tootmisversioon

Mängijate väljade all on **+ Lisa mängija**: see lisab uue nimevälja ja viib fookuse sellele. Lisatud mängija saab eemaldada × nupuga. Vähemalt kaks mängijat jäävad alles; tühjad nimed saavad järjekorranumbri. Alustaja valik arvestab kõiki mängijaid ning eemaldamisel säilitab allesjäänud alustaja või valib eemaldatud alustaja asemel esimese mängija.

Kahe mängijaga kasutatakse vastamisi tulemustabelit. Kolme või enama mängijaga avaneb eraldi ühine tulemustabel mängijakaartidega, kus igaühel on punktid ning seitse märginäitu. Mõlemas vaates on sama otsene sisestus: näiteks **20 · D20 · T20**, samuti bull ja möödavise. Iga vajutus kasutab ühe noole. Mitme mängija sisestuse juures kuvatakse aktiivse mängija nimi ja number. Mobiilis asub mitme mängija sisestus tabeli ees, töölaual tabeli kõrval.

Kahe mängijaga saab valida **1 leg**, **3 legi (2 võitu)** või **5 legi (3 võitu)**. Rohkemate mängijatega näidatakse samu võidukünniseid kujul **1 legivõit**, **2 legivõitu** või **3 legivõitu**, sest kogu seeria võib eri võitjate korral olla pikem kui 3 või 5 legi. Järgmise legi alustaja liigub kõigi mängijate vahel järjekorras edasi. Formaadivalikute all avaneb jaotis **Täpsemad seaded**, kus saab valida esimese legi alustaja.

Legi lõpus avaneb „Järgmine leg”, kogu seeria lõpus „Kordusmäng”. Tagasivõtmine parandab ka legivõitude arvestust; uue legi alguses saab tagasi võtta eelmise legi võiduviske. Kordusmäng säilitab formaadi, nimed ja algselt valitud alustaja.

Legiformaatide kontroll: 22/22 testi, tüübikontroll ja tootmisehitus läbisid. Viimases brauserikontrollis läbiti viie legi formaadi 3 : 0 võit, kordusmäng, valikute säilimine ning „Täpsemad seaded” avamine ja sulgemine; kontrolliti 375 px ja 1280 px paigutust. Automaattestid katavad ka 3 : 2 lõpptulemuse ja selle tagasivõtmise. Varasemalt kontrolliti brauseris ühe ja kolme legi formaate.

Mitme mängija laienduse kontroll: **27/27 testi**, tüübikontroll ja eraldi ehituskaustaga tootmisehitus läbisid. Brauseris läbiti nelja mängijaga punktiarvestus, käigu- ja legivahetus, seeriavõit, tagasivõtmine üle legipiiri ja kordusmäng. Kontrolliti kahe mängija vaatesse naasmist, alustaja säilimist mängija eemaldamisel ning kaheksa pika võrdse nimega mängija 375 px paigutust. Sisestusnupud on vähemalt 44 × 44 px ning horisontaalset kerimist pole.

```powershell
npm test
npm run typecheck
npm run build
npm start
```

`npm start` vajab edukat ehitust. Serveri peatamiseks vajuta selle terminalis `Ctrl+C`.

## Projekti ülesehitus

Arendusserver (`npm run dev`) kasutab eraldi väljundkausta `.next-dev`; tootmisehitus ja `npm start` kasutavad `.next` kausta. Nii ei kirjuta töötava arendusserveri ajal käivitatud ehitus selle JavaScripti faile üle ega põhjusta lehtede vahel liikudes `ChunkLoadError` viga. `STRIKE_FIRST_DIST_DIR` võimaldab kausta käsitsi määrata; samaaegselt töötavatele protsessidele tuleb valida erinevad kaustad.

- [src/app/play/page.tsx](./src/app/play/page.tsx) — mängude leht.
- [src/app/play/game-selection.tsx](./src/app/play/game-selection.tsx) — mängude kohatäitjad linkidega mängulehtedele.
- [src/lib/games.ts](./src/lib/games.ts) — loodud mängude loend.
- [src/lib/cricket.ts](./src/lib/cricket.ts) — Cricketi tabamuste valideerimine, punktiarvestus, käiguvahetus ja kohene võidukontroll. Seis arvutatakse seadistuse ja sündmuste põhjal.
- [src/app/play/cricket/cricket-setup.tsx](./src/app/play/cricket/cricket-setup.tsx) — seadistus, mälus hoitav mänguajalugu ja lahkumise kinnitus.
- [src/app/play/cricket/cricket-game.tsx](./src/app/play/cricket/cricket-game.tsx) — mängu- ja võiduvaade; kõrvalkomponendid kuvavad tabelit ja noolesisestust.
- [src/app/play/cricket/cricket-multiplayer-scoreboard.tsx](./src/app/play/cricket/cricket-multiplayer-scoreboard.tsx) — rohkem kui kahe mängija tulemustabel; sisestuseks kasutatakse ühist [cricket-controls.tsx](./src/app/play/cricket/cricket-controls.tsx) komponenti.
- [tests/cricket.test.mjs](./tests/cricket.test.mjs) — reeglimootori automaattestid Node.js-i testikäivitajaga; lisasõltuvusi ei vaja.
- [src/app/page.tsx](./src/app/page.tsx) — kohaliku avalehe kohatäitja; asendatakse põhiprojekti avalehega integreerimisel.
- [src/app/globals.css](./src/app/globals.css) — mängude komponentide paigutus.
- [styles/strike-first.css](./styles/strike-first.css) — kasutaja antud musta-punane ühiskujundus.

Kujundus on imporditud [juurpaigutuses](./src/app/layout.tsx). Montserrat laaditakse kohalikust [fondifailist](./src/app/fonts/Montserrat-Variable.ttf) läbi `next/font/local` seadistuse, kaaludega 100–900. [SIL Open Font License 1.1](./src/app/fonts/OFL.txt) on kaasas. Ehitamiseks ja fondi laadimiseks pole Google'i ühendust vaja.

Cricketi kujunduse eeskuju on [Strike Firsti Dart Tennis](https://www.strikefirst.ee/play/dart-tennis): must mängupind, Montserrat, kompaktsed rasked pealkirjad, väikesed suurtähtedes jaotisenimed, hallid ümardatud sisestusnupud ning punased põhitegevused (`#ba0c2f`). Kujundus on piiratud Cricketi vaatega. Pärast kohandamist läbisid tüübikontroll ja tootmisehitus; brauseris kontrolliti 375 px ja 1280 px paigutust, pikki võrdseid nimesid, vähemalt 44 × 44 px nuppe, punktiarvestust, tagasivõtmist, võitu ja kordusmängu.

Cricketi kolmanda sammu kontroll: 18 automaattesti (sh algsed 14), tüübikontroll ja tootmisehitus läbisid. Brauseris kontrolliti punktiarvestust, käiguvahetust ja kokkuvõtet, tagasivõtmist, võitu kõigi kolme noolekohaga, kordusmängu, mõlema kinnituse nõustumist ja tühistamist, klaviatuuri ning 375 px ja töölauavaadet. Pikad võrdsed nimed ei põhjusta horisontaalset kerimist ning mängunupud on vähemalt 44 × 44 px.

## Kohalik andmebaas

Kohalik PostgreSQL-i andmebaas on `strikefirst`. Rakendus kasutab piiratud rolli `strikefirst_app`; administraatori ühendust kasutatakse ainult migratsioonideks. Seadistus ja käsud on [kohaliku andmebaasi juhendis](./docs/local-database.md). Algne [andmebaasi kontekst](./.codex/README.md) ja [Prisma skeem](./.codex/schema.prisma) on säilitatud. Cricketi mänguseis on endiselt lehe mälus; andmebaasiühendust kontrollib `/api/health`.

## Cricketi tahvelvaade ja stiilid

Cricketi kujundus asub eraldi [stiilifailis](./styles/cricket.css), mille impordib [Cricketi leht](./src/app/play/cricket/page.tsx). Faili alguses on m?nguvaatega piiratud CSS-i teemamuutujad (r?huv?rv, abitekst, piirjoon, paneelipind ja puutenupu miinimumk?rgus). Komponendid m??ravad sisu ja tegevused; paigutus, t?pograafia ja ekraanim??tude kohandused on CSS-is.

Alates 761 px laiusest on tulemustabel ja sisestus k?rvuti ning seeria p?is kompaktne. Alates 1000 px laiusest paiknevad S/D/T tabamusread kahes plokis (20/19, 18/17, 16/15), et ka r?htasendis mahuksid bull, m??davise ja k?igu l?petamine ekraanile. Nupud on v?hemalt 48 px k?rgused. Undo/Redo ja m??daviske selgitused avanevad ?Sisestuse abi? alt. Kitsas mobiilivaates s?ilib ?ks veerg; lehte saab loomulikult kerida.

