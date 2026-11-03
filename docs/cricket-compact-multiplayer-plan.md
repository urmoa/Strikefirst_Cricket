# Rakendusplaan: Cricketi kompaktne sisestus mitme mängijaga

## Eesmärk ja ulatus

Laienda olemasolev 1v1 tabamuspõhine sisestus väikese ekraani mitme mängija vaatele. Kui vaateala on väike, eemaldatakse eraldi sisestuspaneel ja aktiivse mängija tulemuskaardi sihtmärginumbrid muutuvad nuppudeks.

See on rakendusplaan. Selle koostamisel mängu koodi ei muudeta. Andmebaasimuudatusi pole vaja. Enne rakendamist loe [projekti juhiseid](../AGENTS.md).

Kasutaja väljend „2+ mängijat” hõlmab siin kõiki seadistuses toetatud 2–6 mängijaga mänge. Kahe mängija olemasolev tabel säilib; uus töö puudutab eeskätt 3–6 mängija kaarte.

## Kasutaja nõuded ja plaani lähtevalikud

Kasutaja soovib sama loogikat kui praeguses 1v1 vaates: väikesel ekraanil puudub eraldi sisestuspaneel, tabamused sisestatakse scoreboardi sihtmärginuppudest, iga arvestatud tabamus lisab nupule sisemise valge raami ja käigu tabamuste koguarv kuvatakse ainult numbrina.

Järgmised paigutusvalikud on selle plaani ettepanekud:

- Väikese ekraani määratlus jääb samaks: **laius < 760 CSS-pikslit JA kõrgus < 1020 CSS-pikslit**. Sisu üleulatumine ei määra sisestusviisi; nii väldime paigutusest sõltuvat edasi-tagasi lülitumist.
- Ainult aktiivse mängija kaardi sihtmärgid on nupud. Teiste mängijate kaardid näitavad tulemusi ja pole sisestuskohad.
- Aktiivse kaardi sihtmärkide kohal on „Sihtmärk” üleandmisnupp koos käigu tabamuste arvuga, näiteks `4`. Eraldi „Mööda” nuppu pole.
- Aktiivse kaardi seitse sihtmärki paiknevad kitsal ekraanil neljas veerus, kahel real (4 + 3). Teiste kaartide olemasolev seitsmeveeruline tulemuste rida säilib.
- 3–6 mängija puhul on vertikaalne kerimine lubatud. Kõiki kaarte ei suruta ühe ekraani sisse puutealade või teksti loetavuse arvelt.

## Olemasolev lahendus ja vajalikud muutused

- [Mängumudel](../src/lib/cricket.ts) juba toetab `mark` sündmust, `turnMarks`, `turnMode`, üheksa tabamuse piiri, tabamuspõhist kokkuvõtet ja üksiksündmuse Undo-d. Praegu keelab `applyEvent` tabamuspõhise sisestuse, kui mängijaid pole täpselt kaks.
- [Sisestusviisi hook](../src/app/play/cricket/use-cricket-input-mode.ts) juba jälgib rangete piiridega `matchMedia` päringut ning eelistab poolelioleva käigu lukustatud sisestusviisi. Praegu aktiveerib see kompaktvaate ainult kahe mängijaga.
- [Mänguvaade](../src/app/play/cricket/cricket-game.tsx) juba jätab kompaktse sisestuse ajal paneeli renderdamata, lisab `cricket-table-entry` klassi ning toetab tabamuste reaalajateavitust ja kokkuvõtet. Mitme mängija scoreboardile sisestuse callbacke veel ei anta.
- [Mitme mängija scoreboard](../src/app/play/cricket/cricket-multiplayer-scoreboard.tsx) kasutab mängijakaarte ja iga kaardi sees `dl`/`dt`/`dd` struktuuri. Kõik sihtmärginumbrid on praegu staatilised.
- [1v1 scoreboard](../src/app/play/cricket/cricket-scoreboard.tsx) juba kasutab sihtmärginuppe, numbrilist loendurit ja `cricket-mark-ring` raame.
- [Ajaloo haldus](../src/app/play/cricket/cricket-setup.tsx) juba kasutab `undoCricketMatchInput` funktsiooni ja Redo olekukoopiaid.
- [Cricketi kujundus](../src/app/play/cricket/) ja [fondiskaala](../src/app/play/cricket/cricket-typography.css) peavad jääma stiilide allikaks. Olemasoleva `cricket-table-entry` üheveerulise paigutuse sobivus tuleb üle kontrollida ka mitme mängija klassidega. Stiilid on alates 03.11.2026 jaotatud vastutuse järgi komponentide kõrval asuvatesse CSS-failidesse.

## Rakendamise sammud

### 1. Laienda olemasolevat mängumudelit

Eemalda `mark` sündmuse täpselt kahe mängija piirang. Kasuta olemasolevat üldist mängu valideerimist ja punktiarvestust; ära lisa mitme mängija jaoks eraldi tabamussündmust ega dubleeri reegleid.

Säilita järgmine käitumine:

- Üks vajutus lisab aktiivsele mängijale ühe tabamusmärgi; Bulli vajutus lisab ühe 25 märgi.
- Käigus saab sisestada kõigile sihtmärkidele kokku kuni üheksa märki. Kolmas ega üheksas ei vaheta mängijat. Kümnes lükatakse mudelis tagasi ning mäng ja sündmuste ajalugu jäävad muutmata.
- Keelatud on sihtmärk, mille on sulgenud **kõik mängijad**. Aktiivse mängija suletud sihtmärgile saab punkte sisestada seni, kuni vähemalt ühel vastasel on see avatud.
- Standardvariandis saab viskaja üleliigsete märkide punktid ühe korra, sõltumata avatud vastaste arvust.
- Cutthroat-variandis saab iga selle sihtmärgi suhtes avatud vastane täismahus karistuspunktid. Suletud vastane neid ei saa; viskaja `scoringMarks` kasvab ühe korra.
- Võit kontrollitakse iga märgi järel, sealhulgas Cutthroati olukord, kus sisestus annab võidu juba sihtmärgid sulgenud teisele mängijale.
- Üleandmine töötab 0–9 märgiga, liigub järgmisele mängijale ning suurendab vooru alles algusmängijani tagasi jõudes.
- Võidu järel ei saa sisestada ega käiku üle anda. Tavalise sisestuse kolme noole loogika ja vanade sündmuste taasesitus säilivad.

### 2. Laienda ekraanisuuruse järgi valikut

Muuda hooki kahe mängija tingimus kõigile toetatud mängudele sobivaks. Säilita `(width < 760px) and (height < 1020px)`, SSR-i ohutus ja kuulaja koristamine. Tavalise paigutuse 760/761 px murdepunkti ei muudeta.

`turnMode` jääb valiku esimeseks aluseks: käigu esimene sisestus lukustab viisi käigu lõpuni. Suuruse muutmine ei teisenda nooli märkideks, ei kustuta sisestusi ega vaheta aktiivset mängijat. Järgmine tühi käik valib hetke vaatealale sobiva sisestuse. Sama reegel kehtib Undo/Redo taastatud poolelioleva käigu puhul.

### 3. Lisa aktiivse kaardi sisestus

Anna mitme mängija scoreboardile tüübistatud `inputMode`, tabamuse callback ja üleandmise callback. Mängija, kellele tabamus läheb, määratakse alati mängumudeli aktiivse mängija järgi, mitte klõpsatud kaardi indeksi järgi.

Kompaktses sisestuses:

1. Renderda aktiivse kaardi iga `dt` sihtmärginumbri sisse päris `button`. `dd` tulemuse väärtus ja olemasolevad sihtmärgi värvid säilivad. Ära muuda kogu kaarti vajutatavaks.
2. Renderda aktiivse kaardi sihtmärkide kohale „Sihtmärk” nupp, mis saadab `{ type: "end-turn", mode: "marks" }`. Selle juures on üks käigu koguarv; `/9` ei kuvata.
3. Kasuta sama keelamisloogikat kui 1v1 puhul: kõikide suletud sihtmärk, üheksa märgi piir või lõppenud leg. Üheksa märgi juures jääb üleandmine lubatuks.
4. Lisa igale sihtmärginupule täpselt nii mitu valget sisemist raami, kui aktiivne mängija on sellele sihtmärgile **selles käigus** märke sisestanud. Arvesse lähevad ka punkte andnud märgid. Ära tuleta raame mängija kogumärkidest ega `scoringMarks` väärtusest.
5. Üleandmisel tühjenevad loendur ja raamid; uus aktiivne kaart muutub sisestuskohaks. Undo/Redo taastab need otse `turnMarks` põhjal, ilma kohaliku koopia või lisaloendurita.

Eelista 1v1 ja mitme mängija sihtmärginuppudele ühist väikest komponenti, mis koondab nimetuse, raamid, keelatud oleku ja tabamuse callbacki. Paigutus ja mängijakaardi ülesehitus jäävad scoreboardidesse. Vajadusel jaga ka üleandmisnuppu, kuid väldi kogu scoreboardi üldistamist.

### 4. Ligipääsetavus ja fookus

- Säilita kaartide loendi ning `dl`/`dt`/`dd` semantika.
- Kasuta olemasolevaid eestikeelseid tabamuse, üleandmise ja loenduri nimetusi. Raamid on `aria-hidden` ja ei püüa pointer-sündmusi.
- Nupud töötavad Enteri ja tühikuga ning neil on nähtav klaviatuurifookus. Keelatud nupud pole aktiveeritavad.
- Arvesta, et üleandmisel eemaldatakse vana aktiivse kaardi nupud DOM-ist: kasutaja otsese üleandmise järel suuna fookus uue aktiivse kaardi üleandmisnupule ja too kaart vajadusel nähtavale. Võidu korral kasuta olemasolevat võidupealkirja fookust.
- Undo/Redo vajutamisel säilita fookus ajaloonupul; ära liiguta seda iga aktiivse mängija muutuse peale automaatselt. Fookust ei tohi röövida ka ekraanisuuruse muutmine.
- Reaalajateavitus kasutab tabamuste arvu, aktiivset mängijat ja kõigi mängijate punkte. Käigu kokkuvõte jääb kujule `A: 20 × 3, Bull × 2`.

### 5. Kujundus ja ruumikasutus

Lisa aktiivse kaardi sisestuspaigutuse klassid kesksesse stiilifaili. Tavalise sisestuse ajal säilita kaartide praegune paigutus ja eraldi paneel.

- Kasuta nuppudel vähemalt 48 × 48 CSS-piksli puuteala. Kõik seitse nuppu ei mahu 375 px ekraanil ühele reale; kasuta aktiivsel kaardil nelja veergu.
- Sihtmärgikastide laius ja `dd` väärtused ei tohi põhjustada horisontaalset üleulatumist.
- Kontrolli 1–9 raami eristatavust ja sihtmärgiteksti loetavust. Jagatud raamide kujunduse muutmisel kontrolli uuesti ka 1v1 vaadet.
- Ühe paneeli paigutus ei tohi jätta eemaldatud sisestuspaneelile tühja veergu, ka pärast kompaktse käigu ajal ekraani laiendamist.
- Fondisuurused kasutavad keskseid muutujaid. Säilita olemasolev teksti sobitamise hook; ära kasuta selle vähendatud fondi abil puutealade kahandamist.
- Lubatud vertikaalse kerimise korral peavad kõik kaardid ja mängu toimingud olema kättesaadavad.

## Testid ja vastuvõtukriteeriumid

### Mängumudel

Täienda [kompaktse sisestuse teste](../tests/cricket-compact.test.mjs): olemasolev test, mis ootab kolme mängijaga `mark` sündmuse keelamist, tuleb asendada lubamise ja õige arvestuse kontrollidega.

Lisa tähenduslikud 3 ja 6 mängija juhtumid:

- Üheksa märki eri sihtmärkidel ja Bullil; kümnenda tagasilükkamine muutumatu ajalooga.
- Üleandmine 0, 1 ja 9 märgiga; täielik ring kõigi mängijate vahel, ka nullist erineva algusmängijaga.
- Standard- ja Cutthroat-punktid mitmele avatud ning ühele suletud vastasele.
- Kõigile suletud sihtmärgi keeld, kuid ühe avatud vastase olemasolul sisestuse lubamine.
- Viskaja võit ning Cutthroatis teise mängija võit; võidujärgne sisestus ja üleandmine keelatud.
- Tabamuse, üheksanda märgi, üleandmise ja võidutabamuse Undo; järgmise legi algusest võidutabamuse tagasivõtmine.
- Sisestusviiside segamise keeld ning kompaktsete ja tavaliste käikude vaheldumine ja õige Undo valik.

Olemasolevad 1v1, mitme mängija, Cutthroati ning terve käigu Undo testid peavad jätkuvalt läbima.

### Brauser

Kontrolli 2, 3 ja 6 mängijaga vähemalt järgmisi vaatealasid:

| Vaateala | Tühja käigu sisestus |
| --- | --- |
| 375 × 812 | Kompaktne |
| 390 × 844 | Kompaktne |
| 759 × 1019 | Kompaktne |
| 760 × 1019 | Tavaline |
| 759 × 1020 | Tavaline |
| 1100 × 900 | Tavaline |

Kontrollid:

1. Kompaktses vaates puudub sisestuspaneel ka DOM-ist ja klaviatuurijärjekorrast. Aktiivse kaardi sihtmärgid on ainsad sisestuskohad.
2. Üks vajutus muudab ainult aktiivse mängija märke; teiste punktid muutuvad ainult mänguvariandi reeglite järgi.
3. Iga arvestatud märgiga lisandub vastavale nupule üks raam, kokku kuni üheksa. Teiste sihtmärkide raamid ei muutu. Päise loendur näitab ainult arvu.
4. Üheksas vajutus ei vaheta mängijat; kümnes ei tee midagi. Üleandmine töötab ka nullmärgiga ning aktiveerib õige järgmise kaardi.
5. Undo/Redo taastab raamid, koguarvu, mängija, punktid ja vooru; uus sisestus tühjendab Redo.
6. Muuda suurust mõlemas suunas poolelioleva käigu ajal ning korda pärast Undo/Redo-d. Järgmine tühi käik kasutab uut vaatealale vastavat viisi.
7. Kontrolli klaviatuuri ja nähtavat fookust, eriti üleandmisel järgmisele kaardile ja pärast võitu.
8. Mõõda tegelikku horisontaalset üleulatumist ja nuppude puutealasid pärast paigutuse stabiliseerumist. Kontrolli pikki nimesid ning 6 mängija kerimist, sealhulgas viimase kaardi aktiivseks muutumist.
9. Kontrolli võitu, järgmise legi alustamist ning sealt Undo/Redo-d; 1v1 olemasolev tabel, loendur ja raamid peavad säilima.

Käivita `npm test`, `npm run typecheck` ja `npm run build`. Build peab kasutama projekti olemasolevat arendusserverist eraldatud väljundkausta. Raporteeri käivitatud kontrollide tegelikud tulemused ja võimalikud allesjäänud paigutuspiirangud.

## Soovitatud rakendamise järjekord

1. Mudeli mängijate arvu piirangu eemaldamine koos regressioonitestidega.
2. Jagatud sihtmärginupp ja aktiivse mängijakaardi sisestus ning üleandmine.
3. Hooki laiendamine ja mänguvaate ühendamine.
4. Keskne kujundus, fookuse üleminek ja brauserikontrollid.
5. Kõik projekti kontrollid ning lühike üleandmisraport muudetud failide ja tulemustega.
