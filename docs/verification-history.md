# Varasemate kontrollide ajalugu

Siia on 03.11.2026 tõstetud varasema README kontrollikirjed. Need kirjeldavad kontrollimise hetkel olemas olnud arendusetappe, mitte praeguse tööpuu kontrollitust. Testide arvud, mängijate piirangud ja kasutajaliidese kirjeldused võivad olla vananenud. Kuupäev on märgitud ainult siis, kui see oli algses kirjes teada; allolev järjekord ei kinnita kronoloogiat.

Praegune kasutus- ja käivitusjuhend on [README-s](../README.md). Kuupäevata lõikude sõnastus on säilitatud, sealhulgas nende toonane „viimane kontroll”. Neid brauseri-, ehitus- ega andmebaasikontrolle dokumentatsiooni korrastamisel uuesti ei käivitatud.

## 02.11.2026 — tagasiliikumise kontroll

Mänguvaliku „Tagasi” link suunas ekslikult samale `/play` lehele; nüüd viib see avalehele `/`. Korduvad päringud marsruutidele `/play/cricket`, `/play`, `/` ja `/play/x01` tagastasid HTTP 200. Kõik 72 testi, tüübikontroll ja eraldi väljundkaustaga tootmisehitus läbisid. Interaktiivne brauserikontroll jäi pooleli: integreeritud brauseri avamine ebaõnnestus. Brauseri Back/Forward, mängust lahkumise kinnitus ning võiduvaatest naasmine vajavad veel brauseris kontrollimist; HTTP päringud neid ei kata.

## Kuupäevata — Kõrilõikaja ja tõlked

Viimane kontroll: **39/39 testi**, `npm run typecheck` ja tootmisehitus läbisid. Brauseris kontrolliti tavalise mängu ja Cutthroati punktijaotust, kahe ja kolme mängija vaateid, Undo/Redo, kolme legi seeriat, võidu tagasivõtmist, kordusmängu ja mänguviisi säilimist. Kontrolliti 375 px mobiilivaadet (sisestusnupud vähemalt 48 px kõrged, horisontaalset kerimist pole), töölauapaigutust ning avalehe, mänguvaliku ja X01 tõlgitud tekste.

## Kuupäevata — Undo/Redo

Undo/Redo kontroll: **30/30 testi**, `npm run typecheck` ja tootmisehitus läbisid. Brauseris kontrolliti mõlemas mänguvaates tervikkäigu tühistamist, automaatset ja enneaegset käiguvahetust, korduvat Undo/Redo kasutust, uue sisestuse mõju Redole, võidu taastamist ning 375 px mobiilipaigutust. Eraldi kontrollserver: port 3004.

## Kuupäevata — legiformaadid

Legiformaatide kontroll: 22/22 testi, tüübikontroll ja tootmisehitus läbisid. Viimases brauserikontrollis läbiti viie legi formaadi 3 : 0 võit, kordusmäng, valikute säilimine ning „Täpsemad seaded” avamine ja sulgemine; kontrolliti 375 px ja 1280 px paigutust. Automaattestid katavad ka 3 : 2 lõpptulemuse ja selle tagasivõtmise. Varasemalt kontrolliti brauseris ühe ja kolme legi formaate.

## Kuupäevata — mitme mängija laiendus

Mitme mängija laienduse kontroll: **27/27 testi**, tüübikontroll ja eraldi ehituskaustaga tootmisehitus läbisid. Brauseris läbiti nelja mängijaga punktiarvestus, käigu- ja legivahetus, seeriavõit, tagasivõtmine üle legipiiri ja kordusmäng. Kontrolliti kahe mängija vaatesse naasmist, alustaja säilimist mängija eemaldamisel ning kaheksa pika võrdse nimega mängija 375 px paigutust. Sisestusnupud on vähemalt 44 × 44 px ning horisontaalset kerimist pole.

## Kuupäevata — Cricketi kujundus

Cricketi kujunduse eeskuju on [Strike Firsti Dart Tennis](https://www.strikefirst.ee/play/dart-tennis): must mängupind, Montserrat, kompaktsed rasked pealkirjad, väikesed suurtähtedes jaotisenimed, hallid ümardatud sisestusnupud ning punased põhitegevused (`#ba0c2f`). Kujundus on piiratud Cricketi vaatega. Pärast kohandamist läbisid tüübikontroll ja tootmisehitus; brauseris kontrolliti 375 px ja 1280 px paigutust, pikki võrdseid nimesid, vähemalt 44 × 44 px nuppe, punktiarvestust, tagasivõtmist, võitu ja kordusmängu.

## Kuupäevata — Cricketi kolmas samm

Cricketi kolmanda sammu kontroll: 18 automaattesti (sh algsed 14), tüübikontroll ja tootmisehitus läbisid. Brauseris kontrolliti punktiarvestust, käiguvahetust ja kokkuvõtet, tagasivõtmist, võitu kõigi kolme noolekohaga, kordusmängu, mõlema kinnituse nõustumist ja tühistamist, klaviatuuri ning 375 px ja töölauavaadet. Pikad võrdsed nimed ei põhjusta horisontaalset kerimist ning mängunupud on vähemalt 44 × 44 px.

## 02.11.2026 — koodibaasi struktuurne ülevaade

[Struktuurse ülevaate](./structural-review.md) ajal läbisid 74/74 automaattesti ja TypeScripti tüübikontroll. Eraldi Node'i kontroll kinnitas mängijaprofiili ID kadumise mängu loomisel ning kolme mängija seeria neljanda legi oleku. Tootmisehitust, brauserit ega elusa andmebaasi kontrolle selles ülevaates ei käivitatud. Need tulemused eelnevad järgnevatele koodimuudatustele.

## 03.11.2026 — dokumentatsiooni korrastamine

README praeguse käitumise kirjeldusi võrreldi lähtekoodi, paketi käskude, Nexti seadistuse ja kohaliku andmebaasi juhendiga. Ajaloolised kontrollikirjed toodi siia ning dokumentide kohalikud lingid kontrolliti. Rakenduse teste, tootmisehitust ega brauserikontrolle selle dokumentatsioonimuudatuse jaoks uuesti ei käivitatud.
