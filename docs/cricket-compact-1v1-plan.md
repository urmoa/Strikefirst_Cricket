# Ülesanne järgmisele agendile: kompaktne 1v1 Cricketi sisestus

## Eesmärk

Rakenda olemasolevas Cricketi mängus väikese ekraani 1v1 vaade, kus tabamused sisestatakse otse skooritabeli keskmise veeru sihtmärkide kaudu. Eraldi skoori sisestusplokk kaob ning käik antakse üle tabeli „Sihtmärk” päisele vajutades.

Projekt: `C:/Projects/StrikeFrist`. Loe enne tööd projekti `AGENTS.md`. Andmebaasimuudatusi pole selle ülesande jaoks vaja. See dokument on rakendusplaan; selle loomisel mängu koodi ei muudetud.

## Kasutaja nõuded

- Uus vaade rakendub täpselt kahe mängijaga, kui vaateala laius on **alla 760 CSS-piksli JA kõrgus alla 1020 CSS-piksli**.
- Piirid on ranged: 760 px laiuse või 1020 px kõrguse puhul uus vaade ei aktiveeru.
- Eraldi sisestusplokk eemaldatakse selles vaates ka paigutusest ja klaviatuuriga navigeerimisest.
- Keskmise sihtmärginumbri vajutus lisab aktiivsele mängijale ühe tabamusmärgi. Bulli üks vajutus tähendab ühte 25 tabamust.
- Ühes käigus võib kõikidele sihtmärkidele kokku vajutada kuni üheksa korda. Üheksas vajutus ei vaheta mängijat; kümnes ei muuda mänguseisu.
- Käik antakse üle ainult „Sihtmärk” päisele vajutades, välja arvatud mängu võiduga lõppemine.
- Päisele saab vajutada ka nulli või vähem kui üheksa tabamusega. Eraldi „Mööda” nuppu pole vaja.
- Mõlema mängija suletud sihtmärgile ei saa sisestada.
- Olemasolev punktiarvestus, legivõidud, mängu võitmine ning aktiivse mängija esiletõstmine säilivad.
- Mitme mängijaga ja suurema ekraani tavalise sisestusega vaade säilib.
- Stiilid ja fondisuurused peavad jääma kesksetesse stiilifailidesse.

## Plaani täpsustused

Need on eelmises plaanis pakutud rakendusvalikud, mitte kasutaja eraldi sõnastatud nõuded:

- Päise juures kuvatakse kompaktne käigu loendur, näiteks `4/9`.
- Kompaktses sisestuses eemaldab Undo ühe tabamuse või taastab viimase üleandmise eelse seisu; Redo taastab muudatuse.
- Tavalise sisestuse olemasolev terve käigu Undo säilib.
- Üksiktabamustest ei rekonstrueerita oletuslikke single/double/triple nooli. Kompaktse käigu kokkuvõte näitab sihtmärkide tabamuste arve, mitte kolme väljamõeldud noolt ega puuduvaid nooli „mööda”.
- Üheksa piir kehtib ka Bulli sisaldavas käigus. See on lihtsustatud tabamuspõhine sisestus, mis ei kontrolli, kas märgid said tekkida täpselt kolme füüsilise noolega.

## Praegune kood ja oluline piirang

- [Mängureeglid ja sündmuste taasesitus](../src/lib/cricket.ts): `CricketEvent` on praegu tabamus, möödavise või käigu lõpetamine. `applyEvent` vahetab mängijat automaatselt pärast kolmandat noolt. Üheksa tavalise single-hit sündmuse saatmine seega ei sobi.
- [Mänguvaade](../src/app/play/cricket/cricket-game.tsx): renderdab tabeli, eraldi sisestuspaneeli, päise ning eelmise käigu kokkuvõtte. Viimane eeldab praegu kolme noolt.
- [1v1 tabel](../src/app/play/cricket/cricket-scoreboard.tsx): keskmised sihtmärgid ja päis on praegu tavalised tabelilahtrid.
- [Tavalised sisestusnupud](../src/app/play/cricket/cricket-controls.tsx).
- [Seadistus, mängu olek ja Undo/Redo ajalugu](../src/app/play/cricket/cricket-setup.tsx): Undo kasutab praegu `undoCricketMatchTurn`, mitte üksiksündmuse Undo funktsiooni. Redo talletab matši olekute koopiad.
- [Tabeli kujundus](../src/app/play/cricket/cricket-scoreboard.css) ja [sisestusnupud](../src/app/play/cricket/cricket-controls.css).
- [Keskne tüpograafia](../src/app/play/cricket/cricket-typography.css).
- [Ruumi järgi fondi vähendamine](../src/app/play/cricket/use-cricket-text-fit.ts).
- Olemasolevad testid asuvad [tests kaustas](../tests/), sealhulgas `cricket-turn-undo.test.mjs` ja teised `cricket-*.test.mjs` failid.
- Tavalise paigutuse praegune murdepunkt on 760/761 px. Ära muuda seda uue sisestusviisi lisamise käigus.

## Rakendamise sammud

### 1. Lisa tabamuspõhise käigu tugi mängumudelisse

Lisa selgelt eristatav sündmus ühe kompaktse tabamusmärgi jaoks ning tuleta taasesitusel käigu sisestusviis ja tabamuste arv. Kasuta sama punktide ja sihtmärkide sulgemise arvutust, mida tavaline tabamus kasutab; ära dubleeri punktireegleid.

Kompaktne sündmus ei lähe kolme noole automaatse üleandmise arvestusse. Mudel peab ise keelduma kümnendast tabamusest, suletud sihtmärgist, võidetud mängu sisestusest ja sobimatust sisestusviiside segamisest. Käigu lõpetamine puhastab käigu loenduri ning viib järgmise mängijani. Võit kontrollitakse pärast iga tabamust.

Säilita vanade mängusündmuste taasesitus ja olemasolev kolme noole käitumine. Kompaktne käik peab olema mudelis eristatav ka pärast selle lõppu, et kokkuvõte ja Undo töötaksid õigesti. Vajadusel täienda `CricketState` ja `lastTurn` tüüpe. Ära salvesta tabamusmärke eksitavalt üheksa füüsilise noolena.

### 2. Tuvasta vaateala ja käsitle suuruse muutumist

Kasuta kliendipoolset `matchMedia` päringut rangete tingimustega, näiteks `(width < 760px) and (height < 1020px)`. Arvesta SSR-i ja puhasta kuulajad komponendi eemaldamisel. Mängijate arv kontrollitakse eraldi.

Poolelioleva käigu sisestusviis lukustatakse esimese sisestuse järgi käigu lõpuni. Ekraani pööramine ei tohi kustutada tabamusi, muuta mängijat ega teisendada juba sisestatud nooli märkideks. Vajadusel lükka sisestusviisi visuaalne vahetus käigu lõpuni edasi. Järgmine tühi käik kasutab hetke vaatealale sobivat sisestust. Sama peab töötama Undo/Redo abil poolelioleva käigu taastamisel.

### 3. Tee tabelist sisestusliides

Anna 1v1 tabelile tüübistatud sisestusviis, vajalik käiguinfo ja tabamuse/üleandmise callbackid. Kasuta päris `button` elemente sihtmärgi `th` ja päise `th` sees; säilita tabeli semantika.

Sihtmärginupp peab hõlmama piisavat puuteala, säilitama keskmise joondamise ja näitama fookust ning vajutust. Tabamus lisandub kohe aktiivsele mängijale. Üheksa tabamuse järel blokeeri tabamusnupud, kuid jäta päise üleandmisnupp aktiivseks. Võidu järel blokeeri ka üleandmine.

Lisa eestikeelsed ligipääsetavad nimetused: tabamuse lisamine konkreetsele sihtmärgile, käigu üleandmine ning sisestatud tabamuste arv. Ära lisa pikki nähtavaid abitekste. Hoia mängija ja punktide reaalajateavitus sisestusviisiga kooskõlas; praegune „järgmise noole” teavitus ei sobi üheksa tabamuse loendamiseks.

### 4. Ühenda mänguvaade ja ajalugu

Peida või ära renderda kompaktse sisestuse ajal kogu eraldi sisestuspaneeli. Muuda mängu paigutus ühe tabelipaneeli laiuseks, ilma tühja teise veeruta. Säilita ülemised Undo/Redo nupud ning legi info.

Ühenda kompaktse sisestuse Undo üksiksündmuse tagasivõtmisega ja säilita tavalise sisestuse käigu Undo. Vali tagasivõtmise käitumine taastatava sündmuse/käigu järgi, mitte ainult hetke ekraanimõõtude järgi. Uus sisestus pärast Undo-d tühjendab Redo ajaloo. Kontrolli ka võidutabamuse ja järgmise legi algusest tagasi liikumist.

Kohanda eelmise käigu kokkuvõte käigu tüübile vastavaks, näiteks `Mängija 1: 20 × 3, 19 × 2`. Nulltabamusega käik võib näidata „Mööda”. Säilita olemasoleva tavalise käigu kolme noole kokkuvõte.

### 5. Hoia kujundus keskne

Lisa uue sisestusviisi klassid ja paigutus [sisestuse](../src/app/play/cricket/cricket-controls.css) ning [tabeli](../src/app/play/cricket/cricket-scoreboard.css) stiilidesse. Kasuta fontide jaoks [keskse tüpograafia](../src/app/play/cricket/cricket-typography.css) muutujaid. Väldi inline-stiile ja korduvaid fondisuuruste erandeid komponentides. Säilita olemasolev teksti automaatne vähendamine ja kontrolli selle koosmõju uue tabeliga.

## Vastuvõtukriteeriumid ja kontrollid

1. Kahe mängijaga mõõdul 759 × 1019 on tabelisisestus aktiivne; 760 × 1019 ja 759 × 1020 puhul tavaline sisestus. Kolme mängijaga uus sisestus ei aktiveeru.
2. Esimene, kolmas ja üheksas vajutus ei vaheta mängijat. Kümnes ei muuda punkte, märke ega sündmuste ajalugu.
3. „Sihtmärk” annab käigu üle 0, 1 ja 9 tabamuse korral, nullib loenduri ning uuendab vooru õigel ajal.
4. Näiteks kolm vajutust 20-le sulgeb aktiivse mängija 20; neljas annab standardvariandis 20 punkti, kui vastasel on 20 avatud. Bulli üks lisamärk annab vastavalt 25 punkti.
5. Mõlemale suletud sihtmärk on keelatud. Cutthroat-variandi olemasolev punktireegel säilib, kui see on 1v1 seadistuses valitav.
6. Võit saabub õige tabamuse järel kohe; pärast võitu ei lisandu sisestusi ega vahetu mängija päise kaudu.
7. Undo/Redo taastab õigesti tabamuse, üheksanda vajutuse, käigu üleandmise ja võidutabamuse. Tavalise sisestuse terve käigu Undo testid jäävad läbima.
8. Ekraani pööramine ja mõõtude muutmine poole käigu pealt ei kaota ega teisenda sisestusi. Sama kehtib siis, kui Undo taastab teise sisestusviisiga käigu.
9. Kompaktse käigu kokkuvõte ei esita tabamusmärke füüsiliste nooltena. Eelmised tavalised käigud kuvatakse endiselt õigesti.
10. Klaviatuuriga saab sihtmärke ja üleandmist kasutada, fookus on nähtav ning keelatud nupud ei aktiveeru.
11. Kontrolli vähemalt mõõtusid 375 × 812, 390 × 844, 759 × 1019 ja piirmõõte. Mõõda tegelikku üleulatumist, mitte ainult ekraanipildi muljet. Kontrolli ka 1v1 tavavaadet ja mitme mängijaga paigutust.

Lisa tähenduslikud mängumudeli regressioonitestid olemasoleva Node testiraamistiku abil. Käivita `npm test`, `npm run typecheck` ning projekti build tavapärasel viisil, arvestades töötava arendusserveriga. Tee brauseris puuteala, paigutuse, mõõtude muutmise ja Undo/Redo kontroll.

## Üleandmisel raporteeri

Kirjelda lühidalt rakendatud käitumist, muudetud faile, käivitatud kontrollide tulemusi ning võimalikke allesjäänud piiranguid. Ära nimeta kontrolli läbituks, kui seda tegelikult ei käivitatud.
