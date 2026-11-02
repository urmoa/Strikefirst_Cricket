# Cricketi andmebaasi ja salvestamise plaan

Staatus: ettepanek, mitte rakendatud skeemimuudatus. Plaan põhineb [lähteskeemil](../.codex/schema.prisma), [mängumootoril](../src/lib/cricket.ts), [mängu seadistusel](../src/app/play/cricket/cricket-setup.tsx) ja [andmebaasi õigustel](../prisma/permissions.sql).

## Eesmärk ja eeldused

Salvestada Cricketi mäng nii, et lehe värskendamine ei kaotaks mängu, mängu saaks jätkata ning mängijate ajalugu ja tulemusi hiljem vaadata. Säilivad standard/cutthroat, 2–6 osalejat, külalised, 1/3/5 legi formaat, valitud sihtmärgid, iga mängija 1–9 sulgemismärgi seadistus ning mõlemad sisestusviisid koos undo/redo-ga.

Esimese etapi eeldus on üks tulemuste sisestaja mängu kohta. Mitme seadme konfliktid tuleb siiski tuvastada. Võistluste koondarvestus ja avalik mängude jälgimine jäävad järgmisse etappi.

Valitud lahendus: undo/redo toimub brauseris. Mängu seadistus ja aktiivne sisendite ajalugu salvestatakse andmebaasi ühe JSONB-väljana, lisaks hoitakse brauseris kohalikku varukoopiat. Osalejad ning lõpptulemused jäävad eraldi tabelitesse otsingu ja statistika jaoks. Esimeses etapis `CricketAction` tabelit ei lisata.

Praeguse `bestOf` välja võidulävend on `floor(bestOf / 2) + 1` ka mitme mängijaga mängus. Mitme mängijaga kohtumise legide koguarv võib seetõttu ületada `bestOf` väärtust; andmebaas ei tohi panna legide arvule selle põhjal piirangut.

## Olemasolevate tabelite kasutamine

| Tabel | Cricketi kasutus | Millal sinna kirjutada |
| --- | --- | --- |
| `Player` | Otsing, osaleja püsiv profiil, hilisem mänguajalugu | Ainult eraldi profiili loomise või muutmise toimingul. Mängu lisamine ja külalise lisamine uut profiili ei loo. |
| `User` | Sisselogitud mängu looja või tulemuste sisestaja, seos mängijaprofiiliga | Konto haldamisel; iga mängu jaoks uut kontot ei looda. |
| `GameCategory` | Cricketi kategooria olemasolevas mängukataloogis, kui kategooriat vajatakse | Ühekordne algandmete lisamine. Olemasolevat sobivat kategooriat kasutatakse uuesti. |
| `Game` | Üks Cricketi mänguliigi kirje, nt slug `cricket` | Ühekordne idempotentne algandmete migratsioon; kirjeldusi haldab administraator. Üks mängukord ei ole uus `Game` kirje. |
| `Event` | Valikuline seos turniiri või muu võistlussündmusega | Korraldaja loob sündmuse ja määrab õige Cricketi `gameId` ning `gameType`. Tavaline sõprusmäng sündmust ei vaja. |
| `EventRegistration` | Sisselogitud kasutaja registreerumine sündmusele | Ainult registreerumise toimingul. Ei ole mängu osalejate tabel ja ei toeta külalisi. |
| `EventResult` | Mängija lõplik koht ja edetabelipunktid kogu sündmusel | Võistluse arvestuse kinnitamisel, mitte iga legi või mängu järel. Unikaalne `(eventId, playerId)` võimaldab üht koondtulemust. |
| `League`, `Season` | Võistluse liigakontekst läbi `Event.seasonId` | Korraldaja seadistamisel; jooksva mängu sisendid neid ei muuda. |
| `Match` | Olemasolev kahe mängija tulemuse mudel | Esimeses etapis Cricket siia ei kirjuta; põhjendus allpool. |

Ülejäänud olemasolevad tabelid ei vaja Cricketi mängimise käigus kirjutamist. `EventResult.points` tähendab sündmuse arvestuspunkte; see ei ole Cricketi mängus kogutud punktisumma. Välju `oneEighties`, `highestCheckout` ja `average` ei täideta Cricketi andmetega ilma eraldi mõõdikute definitsioonita.

### Miks olemasolevast `Match` tabelist ei piisa?

Seal on kohustuslikud `playerAId`, `playerBId`, `winnerId` ja lõpptulemused. See ei kirjelda pooleliolevat mängu, külalist, 3–6 osalejat, lege, sihtmärke, händikäppi ega sisendite ajalugu. Lisaks puudub otsene mänguliigi seos ja mitu välja on sobivamad 501 jaoks.

Soovitus on lisada eraldi Cricketi mudel. See võimaldab olemasoleva `Match` tähenduse säilitada. Cricketi tulemuste näitamisel tuleb ajaloo ja edetabeli päringutes arvestada uut mudelit; ainult olemasoleva `Match` lugemisest ei piisa. Sama kohtumise paralleelne kirjutamine mõlemasse tabelisse tooks topeltarvestuse ja sünkroonimise riski.

## Lisatavad tabelid: neli põhimudelit

### Golfi võrdlus ja ühise mudeli võimalus

Projekti lähte- ja tööskeemis on golfi jaoks ainult `DartGolfCourse`. See salvestab raja nime, raskusastme ning `holes` JSON-i kujul sihtmärgid ja par-väärtused. Tabelis puuduvad mängukorra, osalejate, tulemuste ja visete seosed. Kohalikus `src` ja `tests` puus golfi mänguteostust kontrollimise ajal ei leidunud. Seega ei saa siinsest projektist järeldada, kuidas olemasoleva välise golfirakenduse mitme mängija salvestamine töötab.

Golfi mitme mängija tugi tähendab, et üldist mitme osalejaga mängukorra mudelit tasub kaaluda enne Cricketi migratsiooni. Kui ka golfi mängukorrad tuleb siin salvestada, on soovitus ühine `GameSession` + `GameParticipant`, millel on `Game` seos, olek, omanik, osalejad ja profiilide seosed. Cricketi erireeglid ja legid jäävad eraldi mudelisse; golfile lisanduvad rajaseos ja mängijapõhised aukude tulemused. Golfi mängukorrale tuleb säilitada raja versioon või mänguaegne aukude koopia, et raja hilisem muutmine ei muudaks vana tulemust.

Allpool olev nelja tabeli ettepanek kirjeldab Cricketi iseseisvat varianti. Seda ei tule ühise variandiga paralleelselt rakendada: ühise mudeli valimisel asendavad `GameSession` ja `GameParticipant` vastavalt `CricketSession` ja `CricketParticipant` rolli. Cricketi seadistus ja sisendite ajalugu salvestatakse mängukorra JSONB-väljale. Sama salvestusviisi sobivust golfile tuleb kontrollida golfi tegelike mängureeglite põhjal; raja `holes` JSON-väli ise mängukorra salvestamist ei lahenda.

### 1. `CricketSession` — kogu kohtumine

- `id`: UUID, mängu püsiv identifikaator.
- `gameId`: kohustuslik seos kataloogi `Game` kirjega.
- `eventId`: valikuline seos `Event` kirjega; server kontrollib mänguliigi sobivust.
- `createdByUserId`: valikuline seos `User` kirjega.
- `status`: `IN_PROGRESS`, `COMPLETED`, `ABANDONED`.
- `state`: JSONB; sisaldab mängu seadistust (`variant`, `bestOf`, `targets`, osalejate stabiilsed ID-d ja händikäpp), legide alustajaid ja aktiivseid `CricketEvent` sisendeid (`hit`, `miss`, `mark`, `end-turn`). Sellest taastatakse mängumootoriga punktiseis ja võitjad. JSON ei sisalda eraldi auditilogi ega undo/redo toiminguid.
- `rulesVersion`: mängureeglite versioon, et vana mängu tulemus tulevase reeglimuudatusega ei muutuks.
- `winnerParticipantId`: valikuline viide sama kohtumise osalejale; selgub legivõitude lävendist.
- `revision`: samaaegsete ja korduvate salvestuste kontroll.
- `lastSaveId`: viimase salvestuspäringu UUID koos sisu kontrollsummaga korduskatsete tuvastamiseks.
- `startedAt`, `completedAt`, `abandonedAt`, `createdAt`, `updatedAt`.
- `editTokenHash`: kui lubame sisselogimata mängu salvestada, ainult sellele mängule kirjutamise õigust andva juhusliku tokeni räsi.

Indeksid: `(createdByUserId, startedAt)`, `(eventId, status)`, `(status, updatedAt)`.

### 2. `CricketParticipant` — kohtumise osaleja

- `id`: UUID; mängumootori püsiv osaleja-ID, mitte ümberjärjestamisel muutuv järjekorranumber.
- `sessionId`: kohustuslik kohtumise seos.
- `playerId`: valikuline seos `Player` kirjega. `NULL` tähendab külalist.
- `displayNameSnapshot`: nimi mängu alustamise ajal, et profiili hilisem muutmine ajalugu ei kirjutaks ümber.
- `seat`: mängijate lõplik järjekord kohtumise alustamisel.
- `marksToClose`: 1–9, fikseeritud selleks kohtumiseks.
- `createdAt`.

Unikaalsus: `(sessionId, seat)` ja `(sessionId, playerId)`; PostgreSQL lubab viimase puhul mitut `NULL` väärtust ehk mitut külalist. Sama profiili kaks korda lisamine on keelatud. Külaliste samanimelisust ei pea keelama, sest identiteet tuleb ID-st.

`Player` kustutamisel kasutada `SET NULL`, säilitades nime ja mänguajaloo. Külalisest profiili tegemine on eraldi selgesõnaline toiming; sama nimi ei tõesta sama isikut.

### 3. `CricketLeg` — üks leg

- `id`, `sessionId`, `number`.
- `startingParticipantId`: selle legi alustaja.
- `winnerParticipantId`: valikuline võitja.
- `status`: `IN_PROGRESS` või `COMPLETED`.
- `startedAt`, `completedAt`.

Unikaalsus: `(sessionId, number)`. Alustaja vahetub praeguse mängumootori järgi. Võitja ja alustaja peavad kuuluma samasse kohtumisse. Legi punktiseis ja märgid arvutatakse sisenditest; esimene versioon ei vaja eraldi märkide, visete ega käikude tabeleid.

### 4. `CricketResult` — osaleja lõpptulemus

- `id`, `sessionId`, `participantId`.
- `legsWon`: võidetud legide arv; kohtumise tulemus ei ole viimase legi punktisumma.
- `isWinner`: serveris arvutatud kohtumise võitja tunnus.
- `completedAt`.

Unikaalsus: `(sessionId, participantId)`. Osaleja peab kuuluma samasse kohtumisse. Kirjed luuakse kõigile osalejatele kohtumise lõpetamisel, samas tehingus JSON-i ja kohtumise olekuga. Osaleja `playerId` kaudu saab tulemusi profiili ja statistika jaoks otsida. Legivõitjad on eraldi `CricketLeg` tabelis; detailne punktiseis arvutatakse vajadusel JSON-ist. Täpsemaid statistikavälju lisada ainult määratletud mõõdikute jaoks.

### Undo/redo ja kohalik varukoopia

Undo/redo kasutab brauseris praegust mängumootorit. Pärast parandust saadetakse serverisse aktiivse mängu uus JSON-versioon. Uus sisend pärast undo-d tühjendab redo-haru nagu praegu. Server ei salvesta eemaldatud sisendeid ega eraldi paranduste ajalugu.

Brauseri varukoopia (esialgu `localStorage`, mahu kasvades IndexedDB) sisaldab mängu ID-d, JSON-i, redo-haru, serveri viimast kinnitatud revisioni ja kinnitamata salvestust. Serverist taastatud mängu saab jätkata ja selle aktiivseid sisendeid tagasi võtta; varem eemaldatud sisendite redo on võimalik ainult siis, kui brauseri varukoopias on see haru alles. Teises brauseris redo-haru ei taastata. Kohalikku varukoopiat ei käsitleta garanteeritud püsisalvestusena.

Ka eelmise legi võidu tagasivõtmine peab uuendama JSON-i, legide ridu ja kohtumise tulemust. Kui lõpetatud mäng taasavatakse, eemaldatakse selle `CricketResult` kirjed; uuel lõpetamisel arvutatakse need uuesti. Kõik need muudatused tehakse ühes serveritehingus. `CricketAction` tabel jääb hilisemaks võimaluseks, kui tekib nõue auditeerida iga muudatust või töödelda mitme sisestaja tegevusi.

## Piirangud ja ajaloo säilitamine

- Kontrollida 2–6 osalejat kohtumise loomise tehingus; praeguse mootori alumisest piirist üksi ei piisa, sest ülemine piir on kasutajaliideses.
- Lisada SQL `CHECK` piirangud `marksToClose`, mittenegatiivse `legsWon`, positiivsete järjekorranumbrite ja nime pikkuse jaoks. JSON-i struktuuri, formaati `bestOf` ning sihtmärkide lubatud väärtusi, arvu ja kordumatust kontrollida serveris olemasoleva normaliseerimisloogikaga. Piirata ka salvestuspäringu suurust.
- Kasutada liitvälisvõtmeid või samaväärseid andmebaasipiiranguid, et võitja, alustaja ja lõpptulemuse osaleja kuuluksid samasse kohtumisse. Üksnes eraldi ID olemasolu kontrollist ei piisa. JSON-i osalejad ja seadistus peavad vastama osalejate tabeli kirjetele; pärast alustamist ei muudeta profiiliseoseid ega reegleid suvalise seisu salvestamisega.
- Kohtumise lõpetamisel peavad võitja ja aeg olema täidetud; poolelioleva või katkestatud kohtumise üldvõitja jääb tühjaks.
- Mänguliigi või seotud võistluse kustutamine ei tohi kustutada mänguajalugu: valida `RESTRICT` kohustuslikule `Game` seosele ning `SET NULL` valikulistele `Event` ja `User` seostele.
- Kohtumise kustutamine koos alamkirjetega on eraldi administraatori toiming, mitte tavaline tagasivõtmine. Avalikku füüsilise kustutamise API-t esimeses etapis ei lisata.

## Millal mida salvestada?

| Kasutaja tegevus | Kirjutamine |
| --- | --- |
| Nime otsimine või mängueelse järjekorra muutmine | Ainult lugemine; serverisse mängu veel ei looda. |
| „Alusta mängu” | Ühes tehingus `CricketSession`, 2–6 `CricketParticipant` kirjet ja esimene `CricketLeg`. |
| Tabamus, möödavise, märgi sisestamine või käigu lõpetamine | Kohe kohalik varukoopia ja järjestatud automaatsalvestus serverisse: uus `state` JSON, serveri reeglikontroll ja `revision` suurendamine. Vajadusel legi/kohtumise lõpetamine ning `CricketResult` kirjete loomine samas tehingus. |
| Undo või redo | Uus aktiivse mängu JSON-versioon; legide ja tulemuste uuendamine samas tehingus. Eraldi tegevusrida ei teki. |
| Järgmine leg | Uuendatud JSON ja uus `CricketLeg`, kui eelmine on võidetud ja kohtumine jätkub. |
| Kordusmäng | Uus kohtumine koos osalejate ja esimese legiga; eelmine mäng säilib. |
| Tagasi seadistusse või mängust lahkumine | Lahkumine ei tähenda automaatselt katkestamist. Poolik mäng jääb jätkatavaks; „Katkesta mäng” muudab oleku teadlikult. |
| Sündmuse lõpliku paremusjärjestuse kinnitamine | Hilisemas võistlusetapis `EventResult` koondkirjete loomine/muutmine; külalisele ei saa luua `Player` seoseta tulemust. |

Server kasutab sama versioonitud arvutusloogikat mis klient. Kliendi saadetud punktisummat või võitjat ei usaldata. `COMPLETED` mängu sisendid on lukus, kuid praeguse kasutusviisi säilitamiseks võib volitatud sisestaja teha undo; see taasavab mängu ja võtab lõpetamisandmed tagasi. Võistluse kinnitatud tulemuste parandamine nõuab hiljem eraldi õigust ning `EventResult` uuesti arvutamist.

## API, turve ja taastamine

1. `POST /api/cricket/sessions`: valideeritud seadistus, profiilide olemasolu, külalised, algseis; loomisel kliendi UUID tagab korduspäringu ohutuse.
2. `GET /api/cricket/sessions/:id`: taastab mängu JSON-ist ja tagastab serveri revisioni. Esialgu sama omaniku või mängutokeni ligipääs, mitte automaatselt avalik ajalugu.
3. `PUT /api/cricket/sessions/:id/state`: aktiivne mängu JSON, salvestuse UUID ja `expectedRevision`. Server valideerib ja mängib ajaloo uuesti läbi. Revisioni konflikt annab 409; kohalik kinnitamata seis säilitatakse ja serveriversiooniga konflikti ei lahendata vaikse ülekirjutamisega. Sama viimase UUID ja sisuga kordus tagastab varasema kinnituse; teistsuguse sisuga UUID korduskasutus lükatakse tagasi. Vanemad salvestused peatab revisioni kontroll. Kirjutamine serialiseeritakse kohtumise rea lukustamise või atomaarse revisioni kontrolliga.
4. Brauser hoiab korraga üht serverisse minevat salvestust, säilitab uuemad kohalikud muudatused järgmise salvestuse jaoks ning uuendab kinnitatud revisioni vastuse põhjal. Kuvada tuleb salvestamisel tekkinud viga; sulgemata päring ei tohi anda muljet õnnestunud salvestusest. Korduskatse kasutab sama salvestuse UUID-d. Taastamisel võrreldakse kohalikku ja serveri revisioni; uuemat kinnitamata varukoopiat ei kustutata automaatselt.
5. Enne avaliku kirjutava API avaldamist rakendada omanikuõiguste kontroll, päringute mahu piirang ja brauseri kirjutavate päringute päritolu/CSRF-kaitse vastavalt valitud autentimisele.

Praeguses API-s pole kasutaja autentimist näha. Esimese versiooni praktiline lahendus on mängu loomisel juhuslik toimetamistoken: brauser saab selle turvalise HttpOnly küpsisena, andmebaas ainult räsi. Küpsise ulatus, mitme mängu tokenite haldus ja taastamise käitumine tuleb teostuses määrata. Mängu UUID ei ole kirjutamisõigus. Sisselogitud kasutaja seos lisandub siis, kui autentimine on olemas; `playerId` valimine otsingust ei anna õigust selle inimese kontole.

Praegune rakenduse DB-roll saab kõigis rakendustabelites CRUD-i. Uued tabelid saavad olemasolevate migratsiooniõiguste kaudu sama ligipääsu; superkasutaja ega DDL õigusi ei lisandu. See ei asenda API taseme omanikuõigusi. JSON-versioonide ülekirjutamine ei anna muutmatut auditiajalugu; esimeses etapis seda ei nõuta.

## Teostamise järjekord

1. Lähtuda valitud lihtsamast lahendusest: undo/redo brauseris, aktiivne mäng JSON-ina andmebaasis, kohalik varukoopia ning osalejad ja lõpptulemused eraldi tabelites. Võistluse koondarvestus jääb hilisemaks.
2. Säilitada andmebaasi `playerId` mängu seadistusest kogu kohtumise ja kordusmängu vältel. Praegune `createCricketGame` loob uued `player-N` ID-d ning jätab profiili-ID kõrvale; lisada eraldi profiiliseos ja stabiilne osaleja-ID, mida legivahetus ei kaota.
3. Laiendada [tööskeemi](../prisma/schema.prisma) nelja tabeli ja seostega, koostada uus ülevaadatav migratsioon ning lisada puuduv Cricketi kataloogikirje. [Algne lähteskeem](../.codex/schema.prisma) jääb muutmata; dokumenteerida tööskeemi teadlik lahknemine.
4. Rakendada JSON-i valideerimine, serveri ajaloo taasesitus ja tehingud. Lisada taastamise, korduvate salvestuste, revisionikonflikti, külaliste, profiiliseoste ja undo/redo testid; kontrollida JSON-i ning eraldi tulemuste kooskõla.
5. Lisada omanikuõigused ja API; ühendada olemasolevad mängunupud salvestamise ning taastamisega. Hoida kasutajaliidese eelistused (nt kompaktvaade) esialgu brauseris.
6. Lisada mängude ajaloo ja mängijaprofiili tulemuste vaade uue mudeli põhjal.
7. Eraldi etapis siduda korraldaja võistlused, registreerumine, kohtumiste kinnitus ja `EventResult` koondarvestus. Kontrollida olemasolevate päringute sobivust enne mõne võistluse Cricketile avamist.

## Vastuvõtukriteeriumid

- 2 ja 6 mängijaga mäng, mõlemad variandid, kõik formaadid, külalised ja profiilid taastuvad pärast lehe värskendamist samasse seisu.
- Profiili-ID ja mänguaegne nimi säilivad järgmises legis ning kordusmängus; külaline ei muutu automaatselt kontoks.
- Korduv päring ei dubleeri mängu, legi ega sisendit; kaks sama revisioniga kirjutajat ei kirjuta teineteise tulemust üle.
- Undo töötab mõlemas sisestusviisis, võidu järel ja üle legipiiri ka pärast serverist taastamist. Redo-haru taastub samas brauseris kohaliku varukoopia olemasolul; serverist üksi seda ei nõuta.
- JSON, legide read ja lõpptulemused muutuvad atomaarse tehinguna; lõpetatud mängu taasavamine eemaldab vanad lõpptulemused.
- Võrguvea ja lehe värskendamise järel säilib kinnitamata kohalik mäng; serveri ja brauseri konflikt ei kaota muudatusi vaikse ülekirjutamisega.
- Cutthroat'i puhul võib võita ka parajasti mitte viskav osaleja; server salvestab arvutatud õige võitja.
- Märkide sisestusviisist ei tuletata väljamõeldud täpset visete arvu ega viskepõhist keskmist. Vajalik statistika arvutatakse ainult piisava detailsusega sisenditest.
- Teise mängu token, vale kasutaja, võõra kohtumise osaleja/leg ja vigane sisend lükatakse tagasi.
- Võistluse tulemused ei dubleeru `Match` ja Cricketi tabelite vahel; sõprusmäng ei loo `EventResult` kirjeid.

Esimene versioon vajab nelja uut tabelit: `CricketSession`, `CricketParticipant`, `CricketLeg` ja `CricketResult`. `CricketAction` tabelit ei lisata. Eraldi punktide, märkide, statistika, käikude ja visete tabelid ei ole praeguse funktsionaalsuse jaoks vajalikud; need lisada alles siis, kui mõõdetud päringuvajadus seda õigustab.
