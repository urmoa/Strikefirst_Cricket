# Cricketi teostusplaan

## Lähtekoht

**Valminud täpsustus: tõlkefail ja Cutthroat.** Rakenduse eestikeelsed tekstid on [eesti sõnastikus](../src/lib/locales/et.ts); [tõlkefunktsioon](../src/lib/i18n.ts) toetab tüübitud võtmeid, nimelisi kohatäiteid ja hiljem lisatavaid keeli. Hetkel kasutatakse ainult eesti keelt. „Täpsemad seaded” sisaldab **Punktimängu** (Scoring) ja **Kõrilõikaja** (Cutthroat) valikut. Cutthroat järgib [reeglite](./cricket.txt) 7. jaotist: ülejäägipunktid igale avatud vastasele, võiduks kõik sihtmärgid suletud ning punktisumma kõige väiksem või viigis. Kontroll hõlmab pärast iga noolt kõiki mängijaid. Variant säilib legides ja kordusmängus; Undo/Redo taastab ka vastaste punktid. 39 testi, tüübikontroll ja tootmisehitus läbisid; brauseris kontrollitud mõlema variandi punktid, kaks ja kolm mängijat, seeria, võit, Undo/Redo, kordusmäng ning mobiil ja töölaud. Salvestamine jääb neljandasse sammu.

**Sisestuse ühtlustus kasutaja soovil:** nii kahe kui ka enama mängija vaates kasutatakse sama otsest noolesisestust nuppudega 20 / D20 / T20 kuni 15 / D15 / T15, bull ja möödavise. Varasem mitme mängija kaheastmeline sihtmärgi valik on eemaldatud. Eraldi mitme mängija tulemustabel säilib, sisestuse juures kuvatakse aktiivse mängija nimi ja number.

**Valminud täpsustus: Undo/Redo sisestuspaneelis.** Undo tühistab terve käigu sisestuse; tühja käigu korral viib eelmise käigu algusse. Redo taastab tühistatud seisu, sealhulgas käiguvahetuse või võidu. Uus sisestus alustab uut ajaloo haru; uus mäng ja kordusmäng lähtestavad ajaloo. Kontrollitud 30 testi, tüübikontrolli, tootmisehituse ning mõlema mänguvaate brauserivoogude ja mobiilipaigutusega. Brauserisse salvestamine jääb endiselt neljandasse sammu.

Reeglite alus on [cricket.txt](./cricket.txt). Rakendus kasutab Next.js 15, React 19 ja TypeScripti. [Mängude loend](../src/lib/games.ts) sisaldab X01 ja Cricketit; [X01 vaade](../src/app/play/x01/page.tsx) on seadistusvaate algus, Cricket on kolmanda sammu järel mälus algusest võiduni mängitav.

Standardne punktidega Cricket ja Cutthroat kahele või enamale mängijale ühes seadmes, käsitsi tabamuste sisestamisega. Kasutaja soovil on lisatud rohkem osalejaid ning eraldi kahe ja mitme mängija vaated. Võistkonnad, võrgumäng ja ülejäänud erivariandid jäävad hilisemaks. Alustaja valitakse seadistuses; füüsilise bulliviske tulemuse saavad mängijad ise kokku leppida.

## 1. Mängumootor ja olekumudel

Loo kasutajaliidesest sõltumatu TypeScripti moodul `src/lib/cricket.ts`.

- Sihtmärgid: 20, 19, 18, 17, 16, 15 ja bull väärtusega 25.
- Tabamus: sihtmärk ja kordaja; numbritel 1–3, bullil 1–2, lisaks tulemuseta vise. Triple bull ei ole lubatud.
- Mängija: püsiv mängusisene ID, nimi, punktid ja iga sihtmärgi märgid vahemikus 0–3.
- Mäng: skeemiversioon, reeglivariant, mängijate järjekord, alustaja, visete sündmusajalugu.
- Tuletatud seis: aktiivne mängija, vooru number, käigus kasutatud nooled, punktid, märgid ja võitja.
- Mängusisene ID ei eelda andmebaasi mängijaprofiili olemasolu.

Iga noole töötlemine:

1. Kontrolli, et mäng kestab ja sisend on lubatud.
2. Arvuta sulgemiseks vajalikud märgid ning tabamuse ülejääk: `max(0, senisedMärgid + tabamuseMärgid - 3)`.
3. Piira mängija märgid kolmega. Kui mõnel vastasel on sihtmärk veel avatud, lisa ülejääk × sihtmärgi väärtus viskaja punktidele.
4. Kontrolli pärast noolt võitu: kõik seitse sihtmärki suletud ja punktisumma vähemalt võrdne iga vastase omaga.
5. Võidu puudumisel lõpeta käik pärast kolmandat noolt ja liigu järgmise mängija juurde.

Tulemuseta vise kasutab samuti ühe noole. Kõigi suletud sihtmärgi tabamine kasutab noole, kuid ei lisa märke ega punkte. Käigu enneaegne lõpetamine on eraldi sündmus, mitte väljamõeldud möödavisked. Võit lõpetab mängu kohe, ka esimese või teise noole järel.

## 2. Seadistus ja mänguni liikumine

- Lisa Cricket olemasolevasse [mängude loendisse](../src/lib/games.ts).
- Loo leht aadressil `/play/cricket`; serverikomponent annab metaandmed, kliendikomponent haldab mängu.
- Seadistuses sisesta kahe mängija nimed ja vali alustaja. Tühjad nimed saavad vaikimisi nimed „Mängija 1” ning „Mängija 2”.
- Näita standardreeglite lühikirjeldust ja nuppu „Alusta mängu”.
- Muuda [mänguvaliku komponendi](../src/app/play/game-selection.tsx) kirjeldus mängupõhiseks, et valmis Cricketi kaart ei näitaks „Arendamisel”.

## 3. Tulemustabel ja sisestamine

- Tabelis seitse sihtmärgirida ning mõlema mängija märgid ja punktid; aktiivne mängija on selgelt eristatav.
- Näita märke kujul 0–3 või traditsiooniliste sümbolitena koos arusaadava ligipääsetava nimetusega.
- Erista mängija enda suletud sihtmärk ja kõigi jaoks mängust väljas sihtmärk.
- Sisesta iga nool ühe nupuvajutusega: iga numbri juures S/D/T ning eraldi bull 25, bull 50 ja möödavise. Nii ei jää eelmise noole kordaja kogemata valituks.
- Näita aktiivse käigu kuni kolme noolt ja mängija hetke punktisummat.
- Lisa „Lõpeta käik”, „Võta viimane tegevus tagasi” ja kinnitusega „Uus mäng”. Lõppenud mängus saab viimase viske parandamiseks samuti tagasi võtta.
- Võidu korral kuva võitja ja lõppseis; peata edasiste visete sisestamine. Paku kordusmängu ja seadistusse naasmist.
- Järgi olemasolevat musta, punase ja halli kujundust. Kontrolli mobiilivaadet, puutenuppude suurust, klaviatuurikasutust ning värvist sõltumatuid olekutähiseid.

## 4. Tagasivõtmine ja brauseris säilitamine

- Kasuta seadistust ja sündmusajalugu ühe tõeallikana; arvuta mänguseis deterministlikult nende põhjal.
- Tagasivõtmine eemaldab viimase sündmuse ning taastab ka käiguvahetuse või võidule eelnenud olukorra.
- Säilita pooleliolev mäng Cricketi eraldi versioonitud `localStorage` võtmega. Loe brauserisalvestust alles kliendil pärast esmast laadimist.
- Paku lehe avamisel poolelioleva mängu jätkamist või uut mängu.
- Valideeri taastatav seadistus ja sündmused: tundmatu versioon, vigased tabamused ja võidu järel lisatud tegevused ei tohi tekitada vigast seisu.
- Kui salvestamine ebaõnnestub, lase mängul mälus jätkuda ning teavita, et seisu ei taastata pärast lehe sulgemist.

## 5. Kontrollimine ja valmiskriteeriumid

Reeglimootorit kontrollib `npm test`, mis kasutab Node.js >=22.18 sisseehitatud TypeScripti tuge ja testikäivitajat. Kolmanda sammu järel on 18 testi.

Olulised automaattestid:

- S/D/T annavad vastavalt 1/2/3 märki; bull annab 1 või 2 märki.
- Kaks märki + T20 sulgeb sihtmärgi ja annab avatud vastase korral 40 punkti.
- Suletud 20 + T20 annab 60 punkti; kõigi suletud 20 korral 0 punkti.
- Kaks bullimärki + bull 50 annab sulgemise ja 25 lisapunkti.
- Kõigi sihtmärkide sulgemine punktidega taga olles ei lõpeta mängu; punktiviik koos sulgemisega annab võidu.
- Võit esimese või teise noole järel peatab käigu kohe ja välistab tasandusvooru.
- Möödavise kasutab noole; kolmas nool vahetab mängijat; enneaegne lõpetamine lõpetab käigu.
- Tagasivõtmine taastab punktid, märgid, aktiivse mängija ja võitja oleku, sealhulgas käiguvahetuse järel.
- Vigane sisend, triple bull ja tegevus pärast võitu lükatakse tagasi; salvestuse taastamine annab sama seisu.

Valmimisel käivita automaattestid, `npm run typecheck` ja `npm run build`. Kontrolli brauseris tervet mängu seadistusest võiduni, kordusmängu, tagasivõtmist, lehe värskendamist ning mobiili- ja klaviatuurikasutust.

## 6. Hilisemad laiendused

**Tehtud kasutaja soovil: mitme mängija tugi.** Nupp „+ Lisa mängija” lisab uue nimevälja; lisatud osalejaid saab eemaldada. Kaks mängijat kasutavad vastamisi tabelit ja otsest noolesisestust. Kolmest mängijast alates kasutatakse eraldi mängijakaartidega tulemustabelit ja sihtmärgi valikule järgnevat S/D/T sisestust; bull ning möödavise on otse sisestatavad. Reeglimootor lubab vähemalt kahte mängijat, käigud ja legide alustajad liiguvad kogu osalejate ringis. Punktid lisatakse üks kord, kui vähemalt üks vastane on sihtmärgil avatud; võit eeldab kõigi vastastega vähemalt võrdset punktisummat. Mitme mängijaga kuvatakse seeria formaati võidukünnisena (1/2/3 legivõitu), sest seeria võib vajada rohkem lege kui kahe mängija vastav parim-seeriast formaat. 27 testi, tüübikontroll ja tootmisehitus läbisid; nelja mängija tervikvoog, kahe mängija vaatesse naasmine ning kaheksa mängija mobiilivaade kontrolliti brauseris.

**Lisatud kasutaja soovil:** seadistuse legiformaadid „1 leg”, „3 legi (2 võitu)” ja „5 legi (3 võitu)”. Nende all on avatav „Täpsemad seaded”, mis sisaldab esimese legi alustaja valikut. Seeria võidud tuletatakse legide sündmuste taasesitusest; alustaja vaheldub iga legiga. Tagasivõtmine toimib ka legide vahel ning kordusmäng lähtestab kogu seeria sama formaadiga. See ei muuda legisiseseid Cricketi reegleid ega lisa voorupiirangut. Kokku 22 testi, tüübikontroll ja tootmisehitus läbisid; brauseris kontrolliti ka viie legi formaati, avatavat seadistust ning 375 px ja 1280 px paigutust.

1. Rohkem mängijaid ja võistkonnad koos liikmete viskejärjekorraga. Mootori reeglid tasub juba alguses sõnastada kõigi vastaste suhtes; standardmängus vastaste arv punkte ei korruta.
2. Cut-throat on kasutaja soovil tehtud. Hilisemaks jääb No-score eraldi võidutingimusega; järjekorraga mäng ja voorupiirang vajavad enne teostust täpseid lisareegleid.
3. Kontodega seotud mänguajalugu, statistika ja serverisse salvestamine.

[Prisma lähtekeemi](./schema.prisma) `Game` kirjeldab mängukataloogi. `Match` kirjeldab kahe andmebaasi mängija lõpptulemust ning ei sisalda Cricketi märke, nooleajalugu ega pooleliolevat mängu. Esimene kohalik versioon ei vaja migratsiooni. Serverisse salvestamisel tuleb eraldi kavandada mängusessiooni, osalejate ja visete mudelid ning määrata `Match` tulemuse väljade tähendus; külalismängijaid ei tohi eeldada olemasolevateks `Player` kirjeteks.

## Soovitatud tööjärjekord

1. **Tehtud:** reeglimootor ja 14 automaattesti.
2. **Tehtud:** Cricketi leht, mängude loend ja kahe mängija seadistus. Alustamine avab nüüd mänguvaate.
3. **Tehtud:** tulemustabel, noole sisestamine, käiguvahetus ja eelmise käigu kokkuvõte, võiduvaade, tagasivõtmine, hülgamise kinnitused ning kordusmäng; täpsem tööjaotus ja kontrollitulemused on [3. sammu alamplaanis](./cricket-step-3-plan.md).
4. Brauseris säilitamine ja taastamine koos salvestuse valideerimise ning tagasivõtmise kontrolliga taastatud mängus.
5. Tervikvoo, ligipääsetavuse ja mobiilivaate kontroll; tüübi- ja ehituskontroll.

Esimene versioon on valmis, kui kaks mängijat saavad ühe seadmega standardse Cricketi mängu algusest lõpuni mängida, ekslikke sisestusi parandada ning pärast lehe värskendamist jätkata.

Esimese kahe sammu kontroll: `npm test`, `npm run typecheck` ja `npm run build` läbisid. Brauseris kontrolliti mängude valikust liikumist, nimesid, alustaja valikut, vaikenimesid, seadistuse muutmist, klaviatuuriga kinnitamist ja 375 px laiust mobiilivaadet.

Kolmanda sammu kontroll: kõik 18 testi, `npm run typecheck` ja `npm run build` läbisid. Brauseris kontrolliti alamplaani üheksat kasutajavoogu, 375 px mobiili- ja 1280 px töölauavaadet. Salvestamine, värskendamise järel taastamine ning taastatud mängu kontrollid on endiselt neljanda sammu töö.
