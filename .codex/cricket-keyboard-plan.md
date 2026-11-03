# Cricketi klaviatuurikasutuse ülevaade ja parendusplaan

## Eesmärk

Muuta olemasolev mäng klaviatuuriga sujuvalt kasutatavaks ning lisada kiire tabamuste sisestamine. Algne ülevaade ja teostusplaan on allpool; hilisema teostuse seis on selles jaotises.

### Teostuse seis

**Viimane kasutaja otsus:** eraldi klaviatuurisisestuse plokk ja selle seadistusvalik on eemaldatud. Koos nendega on eemaldatud tekstikäskude komponent, parsija ja nende testid. Alles on natiivne klaviatuuriga navigeerimine, fookuse parandused, Undo/Redo kiirklahvid ning ainult neid kirjeldav abi mängueelsetes seadetes. Allpool kirjeldatud käsuvälja kavand ja varasemad kontrollid on ajalooline info, mitte praeguse mängu funktsioonid.

- Tehtud: fookuse taastamine kuuenda mängija lisamisel, kustutamisel, loendi serva ümbertõstmisel, nuppude keelamisel ja sisestusrežiimi vahetumisel. Mängijaridadel on püsivad ID-d. Nimeväljal Enter liigub järgmisele väljale ega alusta mängu.
- Tehtud: mõlema režiimi käsuparsija, sisendi eelvaade, valideerimine, Enteriga kinnitamine, tühja välja Ctrl/Cmd+Enter, Escape ning korduvvajutuse ja IME kaitse.
- Tehtud: mängu piires toimivad Undo/Redo kiirklahvid, tekstiväljade natiivse Undo säilitamine, ligipääsetavad klahvinimed ja täiendatud mänguteated.
- Kasutaja viimase täpsustuse järgi: mänguvaate päises ei ole klaviatuuriikooni. Klaviatuuriga sisestamise märkeruut ja eraldi avatav abi asuvad enne mängu jaotises „Täpsemad seaded”. Valik on vaikimisi välja lülitatud. Sisse lülitamisel kuvatakse mängu juhtnuppude all tavaline käsuväli; mängus ei ole abipaneeli ega ülekatet. Mobiilis ei avata virtuaalklaviatuuri automaatselt. Valik säilib järgmistes legides ja kordusmängus.
- Nooltega nuppude vahel liikumine jääb plaani 4. prioriteedi järgi võimalikuks hilisemaks täienduseks; praegu säilivad natiivne Tab-järjekord ja uus käsuväli.

Brauseris kontrollitud: kuus mängijat ja fookus; nimeväljal Enter; ümbertõstmise serv; mõlema poolt suletud sihtmärgi nupu fookuse taastamine; terve mäng käsuväljalt võiduni; Undo/Redo kiirklahvid ja tekstiredaktori Undo; võidu tagasivõtmine ja taastamine; järgmine leg ja kordusmäng; kuue mängija Cutthroat märgirežiim, üheksa märgi piir ja käigu kinnitamine; vigane käsk, kinnitamata tekstiga käigu lõpetamise tõkestamine, Escape ning Enteri hoidmine. IME- ja kordussündmuse kaitset kontrolliti brauseris sünteetiliste klahvisündmustega. Akna kitsendamine 1280 px pealt 640 px peale säilitas käsuvälja fookuse ja muutis tühja käigu režiimi õigesti.

375 px mobiilivaates mahub paneel ekraanile, horisontaalset kerimist ei teki ning paneeli avamine ei muuda mängutabeli mõõtmeid. Kõrge kontrastsuse brauseriemulatsioonis oli klaviatuurifookuse piirjoon nähtav. Päris NVDA/VoiceOveri, päris IME sisestusvahendi ja operatsioonisüsteemi 200% suumi katset ei ole tehtud; brauseriemulatsioon ja kitsam vaade ei asenda neid kontrolle.

Automaattestid: 60/60 läbisid, sealhulgas neli uut käsuparsija testi. `npm run typecheck` ja `npm run build` läbisid samuti.

Viimase paigutusmuudatuse järel läbisid tüübikontroll ja tootmisehitus. Brauseris kinnitati, et vaikimisi pole mängus klaviatuuriikooni ega käsuvälja; abi ja märkeruut asuvad ainult mängueelsetes täpsemates seadetes. Valiku sisselülitamisel töötab mängu juhtnuppude all kuvatud käsuväljal `T20` + Enter, päis ja mänguvaade ei sisalda klaviatuuriabi.

## Praegune teostus

Ülevaade põhineb praegusel lähtekoodil ja kohalikus arendusserveris tehtud brauserikontrollil.

| Ala | Praegune käitumine | Hinnang |
| --- | --- | --- |
| Üldine navigeerimine | Natiivsed lingid, nupud ja vormiväljad; Tab ja Shift+Tab liiguvad nende vahel, Enter ning nuppudel Space aktiveerivad valiku. | Hea alus. |
| Mängija lisamine | Külalise väljal Enter lisab nime ja väldib vormi saatmist; IME koostamist kontrollitakse. | Toimib, kuid kuuenda nime lisamisel kaob fookus. |
| Muud seadistusväljad | Mängijanime väljal ei ole eraldi Enter-käsitlust; see võib käivitada vormi vaikimisi saatmise. | Tuleb määrata, kas nime muutmise järel Enter peab mängu alustama. |
| Raadionupud ja märkeruut | Kasutus toetub brauseri sisseehitatud klaviatuurikäitumisele. | Säilitada. |
| Mängu alustamine ja võit | Fookus viiakse mängu pealkirjale; võitja muutumine viib sinna uuesti. | Tahtlik üleminek, kuid tavapärase sisestamise jaoks võiks algusfookus olla kasulikum. |
| Tabamuste sisestamine | Kõik tabamused sisestatakse fookuses nuppu aktiveerides. Eraldi klahvikäske ei ole. | Töölaual on 22 sisestusnuppu; Tabiga liikumine on aeglane. |
| Märkide režiim | Sihtmärginupud lisavad ühe märgi, eraldi nupp lõpetab käigu; ühe käigu piir on 9 märki. | Klaviatuuriplaan peab seda eristama noolepõhisest sisestusest. |
| Undo ja Redo | Olemas nupud. Undo tühistab praeguse käigu sisestuse; tühja käigu korral taastab ja tühjendab eelmise. | Kiirklahvid puuduvad. Seda ei tohi kirjeldada ühe noole tagasivõtmisena. |
| Fookuse stiil | Cricketi kujunduses on üldine `:focus-visible`, vormi valikutel ka eraldi reeglid. | Olemas; kontrollida kontrastsust, lõikumist ja eristumist valitud tabamusest. |
| Ekraanilugeja teated | `aria-live` teatab mängijast, voorust, noolest või märkidest ja punktidest. | Kontrollida päris ekraanilugejaga; Undo/Redo sisu ega iga tabamuse tulemus pole eraldi sõnastatud. |
| Sisestusrežiim | Režiim sõltub ekraani mõõtudest ning käigu jooksul lukustab selle `turnMode`. | Fookuse taastamine peab arvestama ka juhtelementide vahetumist režiimi muutumisel. |

Olulised lähtefailid:

- [cricket-setup.tsx](../src/app/play/cricket/cricket-setup.tsx): vorm, mängijad, mängu olek, Undo/Redo ja lahkumise kinnitus.
- [cricket-game.tsx](../src/app/play/cricket/cricket-game.tsx): mänguvaade, võidufookus, teated ning sisestusrežiimi ühendamine.
- [cricket-controls.tsx](../src/app/play/cricket/cricket-controls.tsx): noolepõhised nupud ja suletud sihtmärgi keelamine.
- [cricket-mark-button.tsx](../src/app/play/cricket/cricket-mark-button.tsx): märkide nupud ja 9 märgi piir.
- [use-cricket-input-mode.ts](../src/app/play/cricket/use-cricket-input-mode.ts): ekraanist ja käigust sõltuv režiim.
- [cricket.css](../src/app/play/cricket/cricket.css): fookus; [cricket-game.css](../src/app/play/cricket/cricket-game.css): mängu paigutus.
- [et.ts](../src/lib/locales/et.ts): kasutajale nähtavad tekstid ja ligipääsetavad nimetused.

## Brauseris kinnitatud leiud

1. Kuus mängijat sai nimeväljal Enteriga lisada. Kuuenda lisamisel keelatakse sama väli ning `document.activeElement` muutus `BODY`-ks. Olemasolev enne renderdust tehtud `focus()` ei saa seda vältida.
2. Kahe mängijaga noolepõhises mängus: Mari sisestas T20 ja lõpetas käigu; Jüri sisestas klaviatuuriga T20. Mõlema sulgemise tõttu keelati fookuses nupp ja fookus liikus `BODY`-le.
3. Mängu sai seadistusest Enteriga alustada ja fookus läks pealkirjale „Mäng käib”. Töölaua algseisus oli 22 lubatud sisestusnuppu: 18 numbritabamust, kaks bulli, möödavise ja käigu lõpetamine. Navigatsioon ja ajaloonupud lisanduvad sellele.

Nuppude natiivne toimimine ja koodi olemasolu ei kinnita veel kõigi ekraanilugejate või kõrge kontrastsuse režiimide sobivust. Neid tuleb teostuse järel eraldi kontrollida.

## 1. prioriteet: paranda fookuse säilimine

1. Pärast külalise lisamist suuna fookus renderduse järel tagasi lisamisväljale. Kuuenda lisamisel vii see „Alusta mängu” nupule. Eemaldamise järel võib fookus naasta lisamisväljale.
2. Anna seadistuse mängijaridadele püsivad kohalikud ID-d, et järjekorra muutmine säilitaks fookuse sama mängija real. Kui ümbertõstmise nupp muutub loendi servas keelatuks, vii fookus sama mängija nimeväljale.
3. Nime muutmise väljal Enter kinnitab muutmise ja viib järgmise nimeväljale või külalise lisamise väljale; see ei alusta mängu. Koostamisel olevat IME sisestust ei katkestata. Mängu alustamine jääb eraldi nupule.
4. Mängu käigus hoia fookus samal lubatud juhtelemendil. Kui see keelatakse või eemaldatakse, vii fookus renderduse järel järgmisele lubatud sihtmärgile; kui neid pole, käigu lõpetamisele. Võidu korral on eelis võidu pealkirjal.
5. Rakenda sama põhimõtet Undo/Redo nuppude keelamisel ja sisestusrežiimi muutumisel. Ära vii fookust mujale, kui kasutaja kasutab parajasti endiselt olemasolevat ja lubatud elementi.
6. Võidu tagasivõtmisel, uue legi või kordusmängu alustamisel vii fookus tagasi sisestusse. Vaatleva ekraanilugeja kasutajale teata uuest seisust; ära sunni fookust iga noole või käiguvahetuse järel.
7. Kinnituse tühistamisel säilita käivitanud lingi või nupu fookus. Esimeses versioonis võib säilitada brauseri `confirm` dialoogi; kohandatud dialoog vajab eraldi fookuse piiramist ja taastamist.

Valmiskriteerium: tavapärased mängu ja seadistuse tegevused ei jäta fookust lehe kehale ega peidetud või keelatud juhtelemendile.

## 2. prioriteet: lisa käsureaga kiirsisestus

Soovitus on selgelt märgistatud tekstiväli „Klaviatuuriga sisestamine”. See annab kiire sisestuse koos nähtava eelvaatega ning väldib kogu lehe üksikute tähe- ja numbriklahvide hõivamist. Olemasolevad nupud jäävad kasutatavaks.

| Sisend | Noolepõhine režiim | Märkide režiim |
| --- | --- | --- |
| `20` või `S20` | Ühekordne 20; sama reegel numbritele 15–19. | `20` lisab ühe märgi; kordajaga kuju ei aktsepteerita. |
| `D20`, `T20` | Üks double- või triple-nool. | Veateade: kasuta ühe märgi sisestust. |
| `25` või `B` | Välimine bull, üks märk. | Üks bullimärk. |
| `50` või `DB` | Sisemine bull, kaks märki ühe noolega. | Veateade; kahe märgi jaoks sisesta bull kaks korda. |
| `0` või `M` | Üks möödavise. | Veateade: punktideta käik kinnitatakse käigu lõpetamisega. |

Täpsed käitumisreeglid:

- Enter kinnitab ühe tabamuse või märgi. Tühi väli + Enter ei tee midagi ega lõpeta käiku.
- Lubatud on väike- ja suurtähed ning tühikud sisendi alguses ja lõpus. Esimeses versioonis ei toetata mitme tabamuse kleepimist ühe käsuna.
- Väli näitab enne kinnitamist arusaadavat tulemust, näiteks „Triple 20 · 3 märki”. Vale käsk, keelatud bull või ebasobiv režiim ei muuda mängu; näita välja juures viga ja säilita parandatav tekst.
- Noolerežiimis läheb käsk olemasoleva `onRecord` tee kaudu sündmuseks `hit` või `miss`; märkide režiimis sündmuseks `mark`. Reeglid jäävad mootorisse.
- Eduka kinnitamise järel tühjenda väli, säilita fookus ja puhasta veateade. Võidu korral rakenda võidufookust. Kolmanda noole käiguvahetus ei eemalda sisestusfookust.
- Käigu lõpetamiseks kasuta tühjal käsuväljal Ctrl+Enter / Cmd+Enter. Mittetühja välja korral palu sisend esmalt kinnitada või kustutada, et see ei läheks märkamatult kaotsi.
- Escape kustutab ainult käsuvälja kinnitamata teksti ja veateate. See ei kustuta mänguseisu ega sulge lehte.
- Hoitud Enter ei tohi korrata kinnitamist: kontrolli `event.repeat`. Koostamisel oleva teksti puhul kontrolli `isComposing`.
- Iga sündmus töödeldakse kehtiva mänguseisu järgi. Märgirežiimi 9 märgi piiri või võidu järel täiendavat sisestust ei lubata.
- Kõigi suletud sihtmärgi noolepõhine tekstikäsk järgib nuppude praegust keelamist: kuva „Sihtmärk on mängust väljas; sisesta 0 või M”. Märgirežiimis on sama sihtmärk keelatud. Nii ei teki tekstivälja ja nuppude vahel varjatud erinevust.
- Välja saab lubada mängueelsete täpsemate seadete märkeruuduga „Klaviatuuriga sisestamine”. Lubatud väljale vii töölaual mängu alguses fookus. Mobiilis ei avata virtuaalklaviatuuri automaatselt. Režiimi muutuse korral uuenda välja kirjeldust, säilita tekst ning valideeri uuesti enne kinnitamist.

Valmiskriteerium: `T20` + Enter tekitab täpselt ühe noole ning sama väljaga saab sisestada mitu järjestikust tabamust ja mängida üle käiguvahetuse.

## 3. prioriteet: Undo/Redo ja nähtav abi

- Ctrl+Z / Cmd+Z: olemasolev Undo. Ctrl+Shift+Z / Cmd+Shift+Z: olemasolev Redo; Windowsis võib lisaks toetada Ctrl+Y.
- Need käsud toimivad ainult siis, kui fookus on mängu mitteredigeeritavas osas. Sisendväljadel, tekstialadel ja `contenteditable` sees jääb teksti Undo/Redo brauserile. Abi peab seda erinevust ütlema.
- Ära hõiva brauseri tagasinavigatsiooni, värskendamist, otsingut ega kogu lehe Enterit või Space'i. Tab ja Shift+Tab peavad alati võimaldama sisestusest lahkuda.
- Registreeri käsud mängu komponendi piires ja eemalda need komponendi sulgemisel. Kasuta sama tegevuste rada nagu nuppudel, sealhulgas Redo ajaloo tühjendamine uue sisestuse järel.
- Lisa „Klaviatuuri abi” avatav jaotis: tabamuste käsud, käigu lõpetamine, Escape, Undo/Redo tegelik ulatus ning aktiivne sisestusrežiim. Kõik tekstid lähevad olemasolevasse tõlkesõnastikku.
- Lisa `aria-keyshortcuts` ainult neile juhtelementidele, mille vastav käsk tegelikult töötab. See atribuut ei asenda käskude rakendust ega nähtavat abi.
- Täienda `aria-live` teadet lühikese tabamuse või paranduse tulemusega. Väldi mitme konkureeriva elava piirkonna korraga ettelugemist.

Üksikuid globaalseid klahve nagu `1` → 20 või `U` → Undo esimeses versioonis ei lisata. Kui need tulevikus lisanduvad, peavad nad olema väljalülitatavad või ümberseadistatavad või töötama ainult vastava komponendi fookuses. See lähtub [WCAG 2.1.4 selgitusest](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html).

## 4. prioriteet: lühenda nuppude vahel liikumist vajaduse järgi

Pärast kiirsisestuse kasutuskatset otsusta, kas 22 nuppu vajavad lisaks nooleklahvidega navigeerimist. Esimene teostus säilitab tavalise Tab-järjekorra, et olemasolev kasutus ei muutuks ootamatult.

Kui lisada nooleklahvidega sisestuspaneel, määra eraldi selle semantika, üks Tab-sisenemiskoht, fookuse hoidmine, keelatud nuppude vahelejätmine ning Home/End käitumine. Ära anna staatilisele tulemustabelile pelgalt klahvikäsitluse pärast `grid` rolli. Lähtu [WAI-ARIA klaviatuuriliidese juhisest](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/).

## Teostuse ja kontrollimise järjekord

1. Paranda ja testi kaks brauseris kinnitatud fookuse kaotust; seejärel järjekorra muutmine, eemaldamine ning Undo/Redo keelamine.
2. Lisa ja testi kasutajaliidesest sõltumatu tekstikäsu parsimine mõlema režiimi jaoks. Testid ei dubleeri punktiarvestust; kontrollivad just teksti muutmist õigeks sündmuseks.
3. Ühenda käsuväli olemasoleva mängu ja teadetega; lisa abi ning fookuse reeglid.
4. Lisa fookusega piiratud Undo/Redo kiirklahvid ja kontrolli brauseri tekstiredaktori käskude säilimist.
5. Kontrolli automaatselt ja brauseris allolevad vastuvõtukriteeriumid. Päris ekraanilugeja test märgi tehtuks ainult tegeliku katse järel.

Vastuvõtukriteeriumid:

- Mängija lisamine, nime muutmine, eemaldamine, järjekord, valikud ja mängu alustamine toimivad hiireta; kuues mängija ei kaota fookust.
- Noole- ja märkide režiimis töötavad Tab, Shift+Tab, Enter ja Space. Suletud sihtmärk, üheksas märk, Undo/Redo keelamine ning režiimi muutumine ei kaota fookust.
- Käsud aktsepteerivad määratud süntaksit; vale sisend ei muuda seisu; nupud ja käsud annavad sama tulemuse.
- Enteri hoidmine ei sisesta korduvaid nooli, IME teksti ei kinnitata enneaegselt ning teise nupu Enter/Space ei tekita lisasündmust.
- Tühi Enter ei lõpeta käiku; Ctrl/Cmd+Enter lõpetab selle ainult määratud kontekstis. Escape ei muuda mänguajalugu.
- Tekstiväljal Ctrl/Cmd+Z muudab teksti; väljaspool teksti muudab mänguajalugu. Undo/Redo ulatus vastab praegusele mootorile.
- Võit, võidu tagasivõtmine, järgmine leg ja kordusmäng taastavad õige fookuse; võidu järel sisestus ei jätku.
- Kontrolli mõlemat mänguvarianti, 2 ja 6 mängijat, mõlemat sisestusrežiimi ning 375 px ja töölaua laiust. Kontrolli ka suumimist, mis võib režiimi muuta.
- Fookus on nähtav 200% suumiga ja Windowsi kõrge kontrastsuse režiimis, ei jää kleepuva jaluse taha ega sarnane tabamuse valikutähisega.
- Tee NVDA või VoiceOveriga kontroll, et nimi, tabamus, punktid ja käiguvahetus on arusaadavad ning teadete hulk on talutav.
- Käivita `npm test`, `npm run typecheck` ja `npm run build`.

See plaan ei vaja andmebaasimuudatusi ega muuda punktiarvestuse reegleid.
