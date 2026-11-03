# Koodibaasi struktuurne ülevaade

Kuupäev: 2026-11-02. Ülevaade hõlmab rakenduse lähtekoodi, stiile, teste, seadistust, Prisma skeeme, migratsioone, andmebaasiskripte ja arendusdokumentatsiooni. Rakenduskoodi ei muudetud.

## Hinnang

Praegune ülesehitus sobib väikese kohaliku mängurakenduse jaoks. Tugevused on eraldi sündmuspõhine Cricketi reeglimootor, selle põhjalikud testid, tüübitud tõlked ning serverisse piiratud Prisma klient. Täielikku ümberkirjutamist ega üldist mänguraamistikku pole vaja. Suurim kasu tuleb Cricketi seadistuse vastutuste eraldamisest, mõne käitumise täpsustamisest ja stiilide korrastamisest enne salvestamise lisamist.

Kõige olulisemad parandused on allpool eristatud praegusteks vigadeks, struktuurivõlaks ja tulevase arenduse eeldusteks.

## 1. Mitme mängija leginäit on eksitav

**Praegune kuvamisviga; parandada esimesena.** [Mänguvaade](../src/app/play/cricket/cricket-game.tsx#L79) kasutab alati tõlget „Leg {leg}/{total}”, kus total on bestOf. Kolme või enama mängijaga tähendab see seadistus tegelikult vajalikku legivõitude arvu, mitte mängitavate legide ülempiiri.

Kinnitatud näide: kolm mängijat, formaat 3, igaüks võidab ühe legi. Seis on `[1, 1, 1]`, algab neljas leg ja kohtumise võitjat veel pole. Päis moodustab „Leg 4/3”. Reeglimootori käitumine on õige ning [mitme mängija test](../tests/cricket-multiplayer.test.mjs#L54) katab neljalegise seeria.

Soovitus: rohkemate mängijatega kuvada näiteks „Leg 4 · 2 legivõiduni”. Kahe mängija puhul võib praegune näit säilida. Talletatud bestOf välja ümbernimetamine pole kuvamisparanduse eeltingimus.

## 2. CricketSetup haldab liiga paljusid vastutusi

**Struktuurivõlg; suurim refaktoreerimise võit.** [CricketSetup](../src/app/play/cricket/cricket-setup.tsx) sisaldab korraga mängijate otsingut ja lisamist, järjekorda, fookuse juhtimist, vormiseadeid, juhuslikke sihtmärke, kohtumise olekut, Undo/Redo ajalugu, lahkumiskinnitust ning seadistus- ja mänguvaate vahetamist.

Soovitus eraldada:

- mängijaotsingu hook: viivitus, päringu tühistamine, laadimine ja viga;
- mängijavaliku komponent: külalised, profiilid, nimed, järjekord ja händikäpp;
- seadistusvorm: formaat, variant, sihtmärgid ja vaateeelistus;
- kohtumise juhtimise hook või reducer: sisestamine, järgmine leg, Undo/Redo ja kordusmäng;
- õhuke ühendav komponent, mis valib seadistuse ja mänguvaate vahel.

Olemasolevad väikesed tabeli- ja nupukomponendid on juba mõistlikult eraldatud; neid pole vaja kunstlikult juurde tükeldada.

## 3. Ekraanisuurus muudab sisestamise ja Undo tähendust

**Teadlik praegune käitumine, mis vajab selgemat kasutusloogikat.** [useCricketInputMode](../src/app/play/cricket/use-cricket-input-mode.ts#L9) valib väiksema ekraani korral märkide sisestuse, muidu noolte sisestuse. [Mootoris](../src/lib/cricket.ts#L240) võtab Undo märkide režiimis tagasi ühe sündmuse, noolte režiimis terve käigu. Käigu jooksul säilib režiim ka ekraani muutumisel; see kaitse tasub alles jätta.

Mängija võib seega sama Undo nupu all eri seadmetes saada erineva tulemuse. Kompaktne vaade lubab üheksa märki ja kuni kolme erinevat sihtmärki ning vajab käsitsi käigu kinnitamist; noolte vaade vahetab käiku kolme noole järel. Need pole ainult paigutuse erinevused. [Abitekstides](../src/lib/locales/et.ts#L120) kirjeldatakse veel terve käigu tühistamist ning abi võtmed pole praegu komponentidest kasutatud.

Soovitus: teha režiim nähtavaks ja selle tegevused arusaadavaks, nt „Tühista märk” / „Tühista käik”. Pakkuda mõlema režiimi selgitust ja kaaluda kasutaja valitavat sisestusviisi, millele ekraanisuurus annab algse soovituse. Reeglite muutmine vajab eraldi tooteotsust; olemasolev käitumine on testidega kaetud.

## 4. Valitud profiili seos kaob mängu andmetest

**Salvestamise eeltingimus; praegust punktiarvestust ei riku.** [Seadistus](../src/app/play/cricket/cricket-setup.tsx#L13) hoiab andmebaasi playerId välja, kuid [createCricketGame](../src/lib/cricket.ts#L63) võtab kaasa ainult nime ja sulgemispiiri ning genereerib järjekorrapõhise player-N ID. Kontrollitud näites kadus playerId 42 loodud mängust.

Nii ei saa mängu JSON-i põhjal hiljem kindlalt eristada profiili ja külalist ega siduda samanimeliste mängijate tulemusi. Praegu jääb profiiliseos seadistuskomponendi mällu, kuid see ei ole salvestatav kohtumise identiteet. Probleem on juba märgitud [andmebaasiplaanis](./cricket-database-plan.md#L144).

Soovitus: enne salvestamist eristada stabiilne kohtumise osaleja-ID, valikuline profiili-ID ja mänguaegse nime koopia. Säilitada need järgmises legis ja kordusmängus. Üksnes nime järgi profiili taastada ei saa.

## 5. Kohtumise seisu arvutamisel tehakse tarbetut kordustööd

**Koodist nähtav optimeerimiskoht; aeglust pole mõõdetud.** [getCricketMatchState](../src/lib/cricket.ts#L193) mängib iga legi ajaloo iga mängija jaoks uuesti läbi. Sama funktsiooni kutsuvad ühe sisestuse käsitlemisel omakorda seadistuskomponent ja sündmuse lisamise funktsioonid. Lõpetatud legide läbimängimisi korrutatakse mängijate arvuga.

Soovitus: arvutada iga legi seis ühes funktsioonikutses üks kord ja leida võitude arv ühe läbimisega. Renderdamisel tuletada kohtumise seis match väärtusest, vajadusel useMemo abil. Sündmuste logi jäägu tõeallikaks; eraldi muudetavat punktiseisu pole selle paranduse jaoks vaja. Püsivat vahemälu lisada alles mõõdetud vajaduse korral.

## 6. Sisestusvead peidetakse ja kasutajaliides võib teatada õnnestumisest

**Veakäsitluse puudus.** [record](../src/app/play/cricket/cricket-setup.tsx#L87) püüab kõik mootori vead kinni ja jätab seisu muutmata. [Mänguvaade](../src/app/play/cricket/cricket-game.tsx#L38) seab pärast callback'i siiski teate, et sisestus on salvestatud. Tagastustüüp void ei võimalda eristada õnnestumist ja tagasilükatud sisestust.

Tavalised keelatud tegevused on nuppudel juba piiratud; see puudus muutub nähtavaks siis, kui mootori valideerimine ikkagi ebaõnnestub. Soovitus: kasutada selget tulemuse- või veakoodi ning näidata õnnestumisteadet ainult vastuvõetud tegevuse korral. Ootamatut viga ei tohiks arendaja eest täielikult peita. Reacti oleku uuendaja peab jääma kõrvalmõjudeta.

## 7. Mängureeglid sõltuvad tõlkekihist

**Struktuurivõlg.** [Reeglimootor](../src/lib/cricket.ts#L1) impordib tõlkefunktsiooni nii vigade kui ka vaikimisi nimede jaoks. [Osa teste](../tests/cricket-handicap.test.mjs#L26) tuvastab vea eestikeelse sõna järgi. See seob serveri valideerimise ja tulevase salvestatud ajaloo töötluse kasutajaliidese keelega.

Soovitus: anda domeenivigadele stabiilsed koodid ja tõlkida need kuvamisel. Vaikenimi määrata seadistuse piiril või anda loomisele sisendina. Praegune sündmusajalugu ise on juba keelest sõltumatu ja tasub sellisena säilitada.

## 8. Stiilide asukoht ja kihid vajavad korrastamist

**Struktuurivõlg ülevaate koostamise ajal.** [Juurpaigutus](../src/app/layout.tsx#L4) impordib umbes 51 KB kasutaja antud kompileeritud [ühisstiili](../styles/strike-first.css). [Globaalne CSS](../src/app/globals.css) sisaldas nii üldpaigutust, mänguvalikut kui X01 stiile. Cricketi tollane põhistiil oli 1153 rida ja sisaldas mitmes kohas sama vaate tingimuslikke täiendusi, näiteks 761 px ja lühikese ekraani reegleid.

03.11.2026: mänguspetsiifilised stiilid paigutati komponentide juurde. Cricketi [ühistiil](../src/app/play/cricket/cricket.css), [seadistus](../src/app/play/cricket/cricket-setup.css), [mänguvaade](../src/app/play/cricket/cricket-game.css), [tabelid](../src/app/play/cricket/cricket-scoreboard.css), [sisestus](../src/app/play/cricket/cricket-controls.css) ja [tüpograafia](../src/app/play/cricket/cricket-typography.css) on eraldi failides. Allpool olevad tähelepanekud kirjeldavad algset seisu; kinnitatud kasutamata reeglid ja korduvad baasreeglid on korrastamisel eemaldatud või koondatud. Kasutaja antud ühiskujundus säilis.

Leidus ka lähtekoodis kasutamata valijaid: game-dialog, play-guide ja play-number globaalses stiilis ning cricket-field, cricket-handicap-summary ja cricket-keyboard-help Cricketi stiilis. Need on puhastamise kandidaadid, mitte automaatse kustutamise korraldus.

Soovitus: hoida üldine reset, fondid ja teemaväärtused ühes ühises kihis; mänguspetsiifilised stiilid vastava funktsiooni juures. Cricketi stiil jagada seadistuse, tabeli, sisestuse ja tüpograafia vastutuste järgi ning koondada korduvad kohandused. Kompileeritud võrdlusstiilist eemaldada mittevajalik ainult pärast kasutuse kontrolli, sest praegused lehed toetuvad ka selle utiliitidele. CSS Modules on üks võimalus, kuid selgelt piiratud klassidega CSS sobib samuti.

## 9. Testid katavad mootorit, kasutajaliidese ühendusi mitte

**Regressioonirisk refaktoreerimisel.** Kõik kümme [testifaili](../tests/) kontrollivad mootorit või tõlkeid. Need ei renderda Reacti komponente ega kata otsingu vastuseid, profiili valimist, päris Undo/Redo nuppude olekut, ekraani muutmist või navigeerimist. Redo seisu testimine JSON-koopiaga ei kontrolli komponendis hallatavat redo-haru.

Soovitus: jätta olemasolevad kiired mootoritestid alles ja lisada väike arv sisulisi kasutajaliidese või brauseri teste: profiili/külalise lisamine, otsinguviga, sisestus → Undo → Redo → uus sisestus, mitme mängija neljas leg, režiimivahetus käigu piiril ja lahkumise kinnituse tühistamine. Repositooriumis ei ole praegu CI töövoogu ega lint-käsku. CI-s võiksid vähemalt olemasolevad testid, tüübikontroll ja ehitus automaatselt joosta.

## 10. Andmebaasi taristu peab eristama kohalikku ja tootmise seadistust

**Enne pilve kasutuselevõttu.** [Migratsiooniskript](../scripts/migrate-db.cjs#L12) käivitab iga kord ka [kohalikud õigused](../prisma/permissions.sql), mis eeldavad strikefirst andmebaasi ja konkreetseid rolle. [Kontrollskript](../scripts/verify-db.cjs) kontrollib samuti kohalikke rolle, loopback-aadresse ning IPv4/IPv6 ühendusi. See on kohaliku keskkonna jaoks põhjendatud, kuid ei ole muutmata kujul Neoni migratsiooniprotsess.

Lisaks lisab [näidismängijate migratsioon](../prisma/migrations/20261102000100_demo_players/migration.sql) demoprofiilid igasse keskkonda, kus kogu migratsiooniajalugu rakendatakse.

Soovitus: eristada skeemimigratsioon, kohaliku PostgreSQL-i õiguste seadistus ja vabatahtlikud demoandmed eraldi käskudeks. Juba rakendatud migratsioone mitte ümber kirjutada; tootmise algandmed ja olemasolevate demokirjete saatus lahendada teadlikult. Praegust töötavat kohalikku õigustemudelit pole ülevaate põhjal vaja muuta.

[Lähteskeem](../.codex/schema.prisma) ja [tööskeem](../prisma/schema.prisma) on praegu failiräsi järgi identsed. Nende erinevad rollid on dokumenteeritud; lähteskeemi ei pea eemaldama. Cricketi salvestamise jaoks ei sobi olemasolev kahe mängija lõpptulemuse Match mudel muutmata kujul. [Olemasolev salvestusplaan](./cricket-database-plan.md) käsitleb seda juba piisavalt; uut konkureerivat plaani pole vaja.

## 11. README sisaldab üksteisele vasturääkivaid ajalookirjeid

**Kiire hooldatavuse parandus.** [README](../README.md) segab käivitusjuhendit, praegust käitumist ja eri arendusetappide kontrollitulemusi. Seal leidub veel väiteid, et andmebaasiühendust ei kasutata, mängijate arvu varasemat kirjeldust ning eemaldatud alustajavaliku juhiseid. Samas kirjeldatakse hiljem toimivat andmebaasi ja uut seadistust. Testide eri ajaloolised arvud muudavad praeguse seisu leidmise keeruliseks.

Soovitus: jätta README-sse praegune ulatus, käivitamine, kontrollimine ja lingid. Ajaloolised brauserikontrollid viia eraldi kontrollilogisse. Eristada dokumentides „praegu töötab”, „plaan” ja „varem kontrollitud”. Rakenduse kohta ei tohiks olla mitut vastuolulist tõeallikat.

## 12. Väiksemad seadistuse ja töökindluse parandused

- [tsconfig](../tsconfig.json) loetleb mitu varasemat ajutist Nexti ehituskausta ning üldine TS/TSX muster hõlmab neid samuti. Praeguses projektis on mitu vana väljundkausta. Leppida kokku püsivad dev/build kaustad ja vältida vanade genereeritud tüüpide sattumist kontrolli; aktiivseid väljundeid mitte pimesi eemaldada. Dev- ja tootmisehituse eraldi hoidmine on juba [hästi lahendatud](../next.config.ts).
- [Paketi seadistuses](../package.json) puudub Node'i engines nõue, kuigi README nõuab Node 22.18+ sisseehitatud TypeScripti tõttu. Testid väljastavad MODULE_TYPELESS_PACKAGE_JSON hoiatust. Määrata toetatud Node'i versioon ja ühtne moodulivorming; enne type: module lisamist kontrollida kogu tööriistaahelat. Andmebaasiskriptidel on juba selge .cjs laiend.
- [Mängijaotsingul](../src/app/play/cricket/cricket-setup.tsx#L20) on hea debounce ja katkestamine, kuid puudub nähtav laadimisolek ning varasema ebaõnnestunud sama päringu teade võib korduspäringu ajal nähtavaks jääda. Eraldi hook võimaldab need olekud selgelt modelleerida. API valideerib sisendi ning valib ainult ID ja nime; eraldi teenusekihti pole ühe lihtsa päringu pärast veel vaja.
- [Mänguseis](../src/app/play/cricket/cricket-setup.tsx#L42) on ainult Reacti mälus. Värskendamine või brauseri Back võib poolelioleva mängu kaotada; praegune kinnitus kaitseb ainult selle komponendi enda linki. See on dokumenteeritud piirang. Taastamise lisamisel lähtuda olemasolevast salvestusplaanist ning anda kasutajale seni selge teave, et mäng pole salvestatud.
- [useCricketTextFit](../src/app/play/cricket/use-cricket-text-fit.ts) mõõdab DOM-i ja muudab fondiskaalat ResizeObserver'i kaudu. Säilitada see eraldi hook'ina, kuid stiilide refaktoreerimisel kontrollida päris brauseris pikki nimesid, fondi laadimist ja väikest ekraani. Koodilugemine ei kinnita selle visuaalset stabiilsust.

## Soovitatud asukohad

Järgmine jaotus on ettepanek, mitte juba olemasolev kataloogipuu:

```text
src/
  app/                         # Nexti marsruudid, metaandmed ja õhukesed API adapterid
  features/
    cricket/
      domain/                  # tüübid, reeglid, kohtumine ja ajaloo toimingud
      components/              # seadistus, mänguvaade, tabelid ja sisestus
      hooks/                   # kohtumise juhtimine, fookus, vaateeelistused
      styles/                  # Cricketi stiilid ja tüpograafia
    players/                   # mängijavalik ja otsingu hook
    game-selection/            # kohalik mängukataloog ja selle vaade
  server/
    db.ts                      # server-only Prisma klient
  lib/
    i18n.ts
    locales/
  styles/                      # ühine reset ja kujundusteema
tests/
  cricket/                     # olemasolevad mootoritestid
  i18n/
  e2e/                         # valitud kasutajateekonnad, kui testitööriist lisatakse
scripts/
  db/                          # migratsioonid, kohalik seadistus ja kontrollid
```

Funktsioonikeskne jaotus hoiab Cricketi loogika ja UI koos, jättes marsruudid lihtsaks. Ka Nexti marsruudi all privaatsesse alamkausta koondamine oleks lubatav; tähtis on ühtne vastutuste jaotus. Kõiki kaustu ei pea kohe looma: alustada Cricketist. Üldisi Button, Icon, repository ja service kihte lisada alles tegeliku jagatud vajaduse korral.

## Teostamise järjekord

1. Parandada mitme mängija legipäis ning sisestuse veatulemuse ja õnnestumisteate vastuolu.
2. Eraldada Cricketi juhtimine ja seadistusvorm; säilitada praegune mängukäitumine ja mootoritestid.
3. Selgitada sisestusrežiimi ning Undo tähendust, lisada kriitiliste teekondade UI kontrollid.
4. Koondada stiilid vastutuste juurde ja eemaldada kinnitatud kasutamata reeglid.
5. Lihtsustada README ja ehitusseadistust, lisada automatiseeritud kontrollid.
6. Enne mängude salvestamist säilitada profiiliseosed, versioonida sisendite valideerimine ja rakendada olemasolev andmebaasiplaan.

Failide ümbertõstmine ja käitumismuudatused tasub teha eraldi väikeste muudatustena, et regressiooni põhjust oleks lihtne leida.

## Kontrollimise ulatus

- `npm test`: **74/74 läbisid**.
- `npm run typecheck`: **läbis**.
- Eraldi Node'i kontroll kinnitas profiili-ID kadumise ja kolme mängija seeria neljanda legi oleku.
- Skeemide failiräsid kattusid.
- Tootmisehitust, brauserit ja elusa andmebaasi kontrolle selles ülevaates ei käivitatud. Visuaalsed ja navigeerimise järeldused põhinevad lähtekoodil.
- Enne ülevaatefaili loomist oli tööpuus olemas kasutaja muudatus [tõlkefailis](../src/lib/locales/et.ts); seda ei muudetud.
