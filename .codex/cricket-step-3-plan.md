# Cricketi 3. sammu alamplaan: mänguvaade

## Eesmärk ja ulatus

**Staatus: tehtud (01.11.2026).** Mäng on seadistusest võiduni mängitav. Salvestamist ega taastamist ei lisatud.

Asendada praegune seadistuse kinnitus mänguvaatega, kus kaks mängijat saavad standardse Cricketi mängu algusest võiduni mängida. Aluseks on [põhiplaan](./cricket-plan.md), [reeglid](./cricket.txt) ja olemasolev [reeglimootor](../src/lib/cricket.ts).

Selles etapis valmivad tulemustabel, noolekaupa sisestamine, käigu juhtimine ja võiduvaade. Kaasa tulevad ka põhiplaani 3. jaotises nimetatud tagasivõtmise nupp, uue mängu kinnitus ning kordusmäng: need teevad mänguvaate kohe kasutatavaks. Neljandas etapis jäävad teha brauserisse salvestamine, taastamine ning nende kontrollid. Seis säilib selles etapis ainult avatud lehe mälus.

## 3.1. Ühenda seadistus ja mänguvaade

- Hoia `CricketGame` olekut ühes kliendikomponendis. Olemasolev [CricketSetup](../src/app/play/cricket/cricket-setup.tsx) sobib alguses selleks omanikuks; nime ja vastutust saab komponentide eraldamisel täpsustada.
- „Alusta mängu” loob mängu ja avab kohe mänguvaate. Eemalda seadistuselt ajutised teated järgmises etapis lisanduva mänguvaate kohta.
- Tuleta punktid, märgid, aktiivne mängija, voor ja võitja alati `getCricketState` kaudu. Ära hoia neist teist sõltumatut koopiat Reacti olekus.
- Töötle tegevusi Reacti funktsionaalse olekuuuendusega, kasutades `recordCricketEvent` funktsiooni. Nii lähtuvad ka järjestikused vajutused kõige uuemast ajaloost.
- Iga lubatud vajutus tähendab üht noolt. Ära lisa ajalist piirangut, mis takistaks sama tabamuse korduvat sisestamist.
- Kui mäng on juba lõppenud, ära lisa järjekorras oleva vajutuse tõttu uut sündmust. Vigane tegevus ei tohi lehte lõhkuda ega ajalugu osaliselt muuta.

**Valmis, kui:** nimed ja alustaja kanduvad seadistusest mänguvaatesse ning mõlema mängija algseis on null.

## 3.2. Ehita tulemustabel

- Näita tabelit veergudega „Mängija 1”, „Sihtmärk”, „Mängija 2”; kasuta veerupäistes sisestatud nimesid.
- Reasta sihtmärgid: 20, 19, 18, 17, 16, 15, Bull.
- Näita esimeses versioonis märke arvudega `0/3` kuni `3/3`. See väldib eraldi sümbolite õppimise vajadust.
- Kuva mõlema mängija punktisumma ja märgi aktiivne mängija tekstiga „Viskab”. Lisa vooru number.
- Märk `3/3` tähendab mängija jaoks suletud sihtmärki. Kui mõlemal on `3/3`, lisa reale „Mängust väljas”. Ära kasuta oleku ainsa tunnusena värvi.
- Pärast võitu asenda aktiivse viskaja tähis võitja tähisega.
- Kasuta semantilist tabelit, veeru- ja reapäiseid ning arusaadavat tabeli pealkirja. Pikad ja ka võrdsed mängijanimed ei tohi paigutust rikkuda; sisemiselt erista mängijaid ID järgi.

**Valmis, kui:** üks tabamus uuendab õige mängija märke ja punkte ning mõlema sulgemine muudab sihtmärgirea olekut.

## 3.3. Lisa noole sisestamine

- Iga numbri 20–15 jaoks kolm nuppu: S, D ja T. Ligipääsetav nimi sisaldab sihtmärki ja kordajat, näiteks „Triple 20”. Lisa S/D/T lühiselgitus.
- Lisa eraldi „Bull 25” ja „Bull 50”; triple bulli valikut ei ole.
- Lisa „Mööda / muu number” tulemuseta noole jaoks. Numbrid 1–14 ja märklaualt välja põrganud nooled sisestatakse sama valikuga.
- Ära keela kõigi suletud numbri sisestamist: tabamus kasutab noole ka siis, kui see punkte ei anna.
- Näita aktiivse käigu kolme noolekohta: sisestatud tabamused ning kasutamata kohtadel kriips. Näita järgmise noole järjekorranumbrit.
- Hoia sisestusnupud paigal ja nähtaval kogu mängu jooksul, et tabeli muutumine ei nihutaks neid sõrme alt.

**Valmis, kui:** iga vajutus kasutab täpselt ühe noole ning õige sündmus jõuab olemasoleva mootori kaudu ajalukku.

## 3.4. Tee käiguvahetus arusaadavaks

- Kolmanda noole järel vahetab mootori olemasolev loogika mängija automaatselt; eraldi kinnitust ei nõuta.
- „Lõpeta käik” lisab ühe `end-turn` sündmuse ja annab järje vastasele. Nupp on kasutatav ka nulli sisestatud noolega, kui mängija soovib terve käigu vahele jätta.
- Kuva eelmise käigu viskaja ja tabamused lühikokkuvõttena ka pärast seda, kui aktiivse käigu noolekohad tühjenevad. Tuleta kokkuvõte sündmuste taasesitusest, arvestades nii kolmandat noolt kui enneaegset lõpetamist; ära loo teist mänguajaloo koopiat.
- Teata käiguvahetusest ja punktide muutusest ühe lühikese `aria-live="polite"` teatega.

**Valmis, kui:** kolmas nool või käigu lõpetamine annab järje õigele mängijale ja lõppenud käigu tulemus jääb kontrollitavaks.

## 3.5. Lisa parandamine ja mängust väljumine

**Kasutaja täpsustus: tehtud.** Varasema ühe tegevuse tagasivõtmise asemel on sisestuspaneeli kohal Undo/Redo. Undo eemaldab terve poolelioleva käigu või tühja käigu korral eelmise käigu koos käiguvahetusega; sama kehtib võidukäigule ja tühjale järgmisele legile. Redo taastab täieliku varasema seisu ning toetab mitut järjestikust taastamist. Uus sisestus või järgmine leg kustutab Redo haru. Uus mäng ja kordusmäng lähtestavad ajaloo. Nupud on võidu järel kasutatavad. Kontroll: 30 testi, tüübikontroll, tootmisehitus ning kahe ja mitme mängija brauserivood koos 375 px paigutusega läbisid. Alljärgnev ühe sündmuse kirjeldus kajastab algset alamplaani.

- „Võta viimane tegevus tagasi” eemaldab ajaloost ühe sündmuse. Tühja ajaloo korral on nupp keelatud.
- Taasesitus taastab märgid, punktid, käigu, vooru ja võitja oleku. `end-turn` tagasivõtmine taastab käigu kasutamata nooled; kolmanda noole tagasivõtmine taastab eelmise mängija kahe noolega käigu.
- Võiduvaates jääb tagasivõtmine kättesaadavaks: eksliku võiduviske eemaldamine avab mängu uuesti.
- „Uus mäng” küsib poolelioleva mängu hülgamisel kinnitust ning viib nõustumisel seadistusse; nimed ja alustaja jäävad eeltäidetuks. Tühistamine säilitab seisu.
- Lehe „Tagasi mängude juurde” link kasutab poolelioleva, vähemalt ühe sündmusega mängu korral sama hülgamise kinnitust. Brauseri üldine sulgemise ja värskendamise kaitse ei kuulu sellesse etappi.

**Valmis, kui:** ekslik vise ja käiguvahetus on parandatavad ning uue mängu tühistamine ei kustuta seisu.

## 3.6. Lisa võiduvaade ja kordusmäng

- Võitja määrab ainult mootori `winnerId`; kasutajaliides ei dubleeri võidureegleid.
- Näita võitja nime, mõlema mängija lõpp-punkte ja lõplikku märgitabelit. Vii fookus võidu pealkirjale.
- Keela tabamuste ja käigu lõpetamise nupud kohe pärast võitu. Ära vaheta mängijat ega luba tasandusvooru.
- „Kordusmäng” loob tühja ajalooga mängu samade nimede ja sama seadistuses valitud alustajaga. Alustaja vahetamiseks saab naasta seadistusse.
- „Muuda seadistust” avab eeltäidetud seadistuse. Lõppenud mängu järel ei ole hülgamise kinnitust vaja.

**Valmis, kui:** võit esimese, teise või kolmanda noolega lõpetab mängu kohe ning kordusmäng lähtestab kogu mänguseisu.

## 3.7. Failide jaotus

Muudetavad olemasolevad failid:

- [cricket-setup.tsx](../src/app/play/cricket/cricket-setup.tsx): seadistuse ja mängu ühendamine, ühine olek ning tegevuste töötlemine.
- [page.tsx](../src/app/play/cricket/page.tsx): vajadusel staatilise sissejuhatuse lühendamine, et mängunupud oleksid mobiilis paremini nähtavad.
- [globals.css](../src/app/globals.css): Cricketi tabel, sisestusnupud, fookus, aktiivne mängija ja mobiilipaigutus.
- [cricket.test.mjs](../tests/cricket.test.mjs): olemasolevate reeglitestide täiendamine ainult seni katmata juhtudega.
- [README.md](../README.md): tegeliku mängitava ulatuse ja mälus säilimise kirjelduse uuendamine.

Uute komponentide kavandatavad nimed: `cricket-game.tsx` mänguvaate jaoks, `cricket-scoreboard.tsx` tabeli jaoks ning `cricket-controls.tsx` tabamuste jaoks. Hoia need Cricketi lehe kõrval. Eralda korduvloogika ainult vajaduse korral; eelmise käigu tuletamise abifunktsiooni saab lisada olemasolevasse reeglimoodulisse ja testida eraldi.

## 3.8. Kontroll ja vastuvõtukriteeriumid

Täienda automaatteste tagasivõtmisega üle käiguvahetuse ja võidu, kolmanda noole võiduga ning eelmise käigu kokkuvõtte tuletamisega. Säilita olemasolevad 14 reeglitesti. Käivita `npm test`, `npm run typecheck` ja `npm run build`.

Brauseris kontrolli järgmisi kasutajavooge:

1. Seadistus → mäng → numbrite ja bulli sulgemine → võit → kordusmäng.
2. Kaks märki 20 peal + T20: 40 punkti, kui vastasel on 20 avatud.
3. Mõlemal suletud 20 tabamine: punkte ei lisandu, kuid nool kulub.
4. Kõik sihtmärgid suletud, punktidega taga: mäng jätkub; punktiviigini jõudes lõpeb.
5. Möödavise, kolmanda noole automaatne vahetus ning enneaegne käigu lõpetamine.
6. Tagasivõtmine pärast lisapunkte, kolmandat noolt, käigu lõpetamist ja võiduviset.
7. Uue mängu ning mängude valikusse naasmise kinnitamine ja tühistamine.
8. Järjestikused sama tabamuse vajutused, pikad ja võrdsed nimed, klaviatuuriga sisestamine ning võidu järel fookus.
9. Vähemalt 375 px laiune mobiilivaade ja töölauavaade: tabel mahub ekraanile, nupud on vähemalt 44 × 44 px ja olek on loetav ka värvita.

Samm on valmis, kui mäng on kasutajaliideses algusest lõpuni mängitav, iga sisestus vastab mootori seisule, eksimusi saab parandada ning võidu järel saab alustada uut mängu. Brauseri värskendamise järel taastamine jääb neljandasse sammu.

## Teostus ja kontrollitulemused

- Seadistus omab üht mänguolekut; mängu-, tabeli- ja sisestusvaade on eraldi komponendid. Hilisema legiformaadi laienduse järel on omanikuks `CricketMatch`, mille iga leg on oma `CricketGame` sündmusajalooga. Sisestus kasutab funktsionaalset uuendust ja mootori võidukontrolli. Järjekorda jäänud sisestus ei muuda lõppenud legi.
- Mootori tuletatud `lastTurn` sisaldab viimase lõppenud käigu mängija ID-d, tegelikke nooli ja enneaegse lõpetamise tunnust. See taastatakse sündmuste taasesitusest ning tagasivõtmine taastab ka varasema kokkuvõtte.
- Võidu pealkiri saab fookuse; üks viisakas reaalajas teade kajastab käiku ja punkte. Tabeli veeru- ja reapäised, tekstilised olekud ning S/D/T ligipääsetavad nimed on lisatud.
- Mõlemad hülgamise kinnitused kasutavad brauseri kinnitusdialoogi; tühistamine säilitab seisu. Lõppenud või tegevusteta mängust saab väljuda kinnituseta.
- `npm test`: 18/18 läbisid, sealhulgas kõik algsed 14 testi. Lisandusid punktide ja käiguvahetuse tagasivõtmine, kõigi kolme noolekohaga võidu tagasivõtmine ning eelmise käigu taasesitus.
- `npm run typecheck` ja `npm run build`: läbisid.
- Tootmisehituse brauserikontroll eraldi pordil 3003: 40 lisapunkti, mõlema suletud numbri tulemuseta tabamine, kõik sihtmärgid suletud punktidega taga olles ja võit punktiviigil, möödavise, automaatne ja enneaegne käiguvahetus, noolteta käik, tagasivõtmine, võit esimese/teise/kolmanda noolega, keelatud sisestus pärast võitu, fookus ja kordusmäng. Uue mängu ja lahkumise kinnituse puhul kontrolliti nõustumist ning tühistamist.
- 375 × 812 px mobiilivaade ja 1280 × 900 px töölauavaade: tabel mahub ekraanile, kõik mängunupud on vähemalt 44 × 44 px. Kontrolliti ka 60 märgi pikkuseid võrdseid nimesid, teist alustajat, korduvaid sama tabamuse vajutusi ning Enteri ja tühikuga sisestamist. Tabelirea sulgemine ei nihuta sisestusnuppe.
- Git-repositooriumi ega uut tööpuud ei loodud; teostus asub olemasolevas projektikaustas.
