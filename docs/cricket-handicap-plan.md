# Plaan: mängijapõhine Cricketi handicap

## Eesmärk ja reeglid

Lisa valitud mängijate nime taha seadistus „Sulgemiseks”, mis määrab, mitu tabamusmärki vajab see mängija iga sihtmärgi sulgemiseks. Vaikimisi on kõigil **3**. Seadistus kehtib sihtmärkidele 20–15 ja Bull ning nii Standard- kui ka Cutthroat-variandile, 2–6 mängijaga.

„Visete arv” tähendab selles plaanis Cricketi tabamusmärke: single annab 1, double 2 ja triple 3 märki; Bull vastavalt 1 või 2. Näiteks piiriga 4 mängija sulgeb numbri triple’i ja single’iga. Käigus on endiselt kolm noolt; kompaktse sisestuse piir on endiselt üheksa märki.

Plaani ettepanek on pakkuda täisarve **1–9**. Väiksem väärtus teeb sulgemise lihtsamaks, suurem raskemaks. Vahemik on rakendusvalik, kasutaja määratud nõuded on mängijapõhine valik ja vaikeväärtus 3.

See dokument on rakendusplaan; rakenduse koodi selle koostamisel ei muudeta.

## 1. Seadistus mängija nime järel

Muuda [mängu seadistust](../src/app/play/cricket/cricket-setup.tsx):

- Lisa valitud mängija objektile `marksToClose`, uue mängija lisamisel väärtusega 3.
- Kuva nime järel väike valik „Sulgemiseks” väärtustega 1–9, vaikimisi 3. Lisa selgitus „Tabamusmärke iga sihtmärgi sulgemiseks”.
- Seo valik konkreetse mängija objektiga, et nime muutmine, üles/alla liigutamine ja algusmängija vahetamine säilitaksid tema väärtuse. Eemaldatud mängija uuesti lisamisel on vaikeväärtus taas 3.
- Anna valikule mängijat eristav ligipääsetav nimi. Säilita nimevälja Enteriga navigeerimine ja olemasolev fookuse haldus ka siis, kui reas on uus sisestuselement.
- Väikesel ekraanil peab valik ja rea toimingud mahtuma ilma horisontaalse kerimiseta; vajadusel paiguta toimingud teisele reale. Kujundus lisa [Cricketi stiilidesse](../styles/cricket.css).
- Mängu alustamisel kopeeri valitud väärtused mängu konfiguratsiooni. Mängu ajal on need selle mängu jaoks fikseeritud; muutmine toimub seadistusvaates enne uue mängu alustamist.

## 2. Mängumudel ja sulgemise loogika

Täienda [Cricketi mudelit](../src/lib/cricket.ts):

- Lisa mängu konfiguratsiooni mängijale valikuline `marksToClose` ja tuletatud `CricketPlayer` olekusse alati normaliseeritud arv. Puuduv väärtus tähendab 3, et olemasolevad mänguobjektid ja testid töötaksid edasi. Selgesõnaliselt vigane väärtus lükatakse tagasi: lubatud on ainult täisarv 1–9.
- Laienda mängu ja matši loomise funktsioone mängijate seadistuste vastuvõtmiseks, säilitades olemasolevad ainult nimedega väljakutsed. Ära seo handicap’i mängija nimega ega loo nimepõhist sõnastikku: nimed võivad korduda.
- Koonda sihtmärgi sulgemise kontroll ühte abifunktsiooni: mängija märgid on vähemalt tema `marksToClose`.
- Kogunenud sulgemismärgid piirduvad mängija enda piiriga. Punkte andvad lisamärgid arvutatakse valemiga `max(0, senisedMärgid + lisatudMärgid - marksToClose)` ja kogutakse endiselt eraldi `scoringMarks` väljale.
- Hinda iga vastase avatust tema enda piiri järgi. Standardis saab viskaja lisapunktid ühe korra, kui vähemalt üks vastane on avatud; Cutthroatis saab neid iga avatud vastane.
- Sihtmärk sulgub kõigi jaoks alles siis, kui iga mängija on täitnud enda piiri. Seni saab juba sulgenud mängija sellelt punkte koguda.
- Võidu kontroll kasutab kandidaadi enda sulgemispiiri kõigil seitsmel sihtmärgil ning seniseid punktireegleid. Säilita ka Cutthroati võimalus, et sündmus annab võidu teisele mängijale.

Näide: A piir on 2, B piir 4. A viskab tühjale 20-le triple’i: 2 märki sulgeb numbri ja üks lisamärk annab 20 punkti. B kolme märgi juures on 20 endiselt avatud. Cutthroatis läheksid need 20 punkti B-le.

## 3. Tulemustabel ja sisestus

Muuda [1v1 tulemustabelit](../src/app/play/cricket/cricket-scoreboard.tsx), [mitme mängija tulemustabelit](../src/app/play/cricket/cricket-multiplayer-scoreboard.tsx), [sihtmärgi stiili](../src/app/play/cricket/cricket-target-style.ts), [tabamusnuppu](../src/app/play/cricket/cricket-mark-button.tsx) ja [mänguvaadet](../src/app/play/cricket/cricket-game.tsx):

- Asenda fikseeritud `/3` mängija piiriga, näiteks `2/2`, `3/4` või `5/4`. Lugeja jääb seniseks sulgemismärkide ja punkte andnud lisamärkide summaks.
- Kuva mängija nime juures kompaktselt tema sulgemispiir, näiteks „Sulgemiseks 4”, mõlemas tulemustabeli vaates.
- Kasuta ühist sulgemiskontrolli nii värvide, suletud rea, hoiatuste kui ka keelatud sihtmärginuppude jaoks.
- Kompaktse sisestuse üheksa märgi piir, käigu loendur ja käigus tehtud sisestuste raamid jäävad käigu tegelike tabamuste põhisteks. Sulgemispiir ei muuda neid.
- Tavalise sisestuse kordajad 1/2/3 ja kolme noolega käigu lõpp jäävad kehtima ka siis, kui mängija sulgemispiir on näiteks 1 või 5.
- Uuenda [eestikeelseid tekste](../src/lib/locales/et.ts): reeglid, sulgemise abitekst ja tulemustabeli juhised peavad kirjeldama mängija valitud piiri; eemalda eeldus, et sulgemine on alati 3/3.

## 4. Leg’id, kordusmäng ja ajalugu

- Järgmine leg kopeerib mängijate sulgemispiirid koos mängijate järjestusega. Praegune järgmise legi loomine kannab edasi ainult nimed, seega tuleb seda eraldi täiendada.
- Kordusmäng alustab samade mängijate ja samade piiridega, nullitud märkide ja punktidega.
- Seadistusse naastes säilivad valitud väärtused.
- Undo/Redo taastab mängu konfiguratsiooni ja sündmused tervikuna. Kontrolli ka Undo-d järgmise legi algusest eelmise legi võiduviskeni.
- Vana mängu taasesitus ilma `marksToClose` väljadeta annab igale mängijale piiri 3. Uues konfiguratsioonis on piirid selgesõnaliselt olemas.

## 5. Andmete säilitamine

Praegune mäng ja mängijavalik on Reacti lokaalses olekus. Handicap salvestatakse selle mängu konfiguratsiooni; lehe värskendamise ülese säilitamise lisamine ei kuulu sellesse muudatusse.

[Prisma skeem](../.codex/schema.prisma) ja [andmebaasi kontekst](../.codex/README.md) on üle vaadatud. Skeemis puudub kohaliku Cricketi seansi mudel. Selle funktsiooni jaoks pole andmebaasimuudatust vaja: valik kirjeldab konkreetse mängu mängijat. Profiilipõhise püsiva vaikeväärtuse lisamine oleks eraldi arendus.

## Kontrollid ja vastuvõtukriteeriumid

Lisa sisulised mudelitestid olemasolevate [testide](../tests) kõrvale:

1. Kõigil vaikepiir 3; vana konfiguratsiooni taasesitus ja olemasolevad testid annavad senised tulemused.
2. Samas mängus piirid 1, 2, 3, 4 ja 9; sulgemine, sulgemispiiri ületav duubel/triple ning Bull arvestatakse õigesti.
3. Standardi ja Cutthroati punktid arvestavad iga vastase enda piiri. Kaasa juhtum, kus ühel vastasel on sihtmärk suletud ja teisel avatud.
4. Kõigi sulgemine keelab kompaktse sisestuse; ühe avatud vastase korral saab suletud sihtmärgilt endiselt punkte.
5. Erinevate piiridega mängijate võit ja Cutthroatis teise mängija võit leitakse õigesti; võidujärgne sisestus on keelatud.
6. Uus leg, kordusmäng, Undo ja Redo säilitavad piirid ning õige punktiarvestuse.
7. Null, negatiivne arv, murdarv, üle 9 väärtus, tekst ja `null` lükatakse mudelis tagasi; ainult puuduv väärtus kasutab vaikeväärtust 3.

Brauseris kontrolli 2 ja 6 mängijaga tavalist ning kompaktset vaadet:

- Nime järel on vaikimisi 3; ühe mängija muutmine ei muuda teisi. Järjestamine ja korduvad nimed ei vaheta piiride omanikke.
- Näidud, värvid, sihtmärkide keelamine ja abitekstid vastavad iga mängija piirile.
- Pikad nimed ja suuremad loendurid mahuvad ka 375 px laiusele; kõik valikud on klaviatuuriga kasutatavad ja fookus nähtav.
- Mõlema sisestusviisi käigupiirid ning Undo/Redo säilivad.

Pärast rakendamist käivita `npm test`, `npm run typecheck` ja `npm run build`. Plaani koostamisel neid ei käivitata, sest rakenduse käitumist ei muudeta.

## Rakendamise järjekord

1. Mängija konfiguratsioon, vaikimisi väärtus, valideerimine ja keskne sulgemiskontroll koos mudelitestidega.
2. Punktiarvestus, võidu kontroll ning konfiguratsiooni edasiandmine järgmisesse leg’i.
3. Seadistusvaate mängijapõhine valik, mängu alustamine ja kordusmäng.
4. Mõlemad tulemustabelid, sisestuse sulgemiskontrollid, tekstid ja kohanduv kujundus.
5. Brauserikontrollid ja projekti automaatsed kontrollid.
