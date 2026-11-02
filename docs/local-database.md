# Kohalik PostgreSQL

Rakendus kasutab PostgreSQL-i andmebaasi `strikefirst` aadressil `127.0.0.1:5432`.
Prisma 6 tööskeem asub failis [prisma/schema.prisma](../prisma/schema.prisma).
See on koopia kasutaja antud [lähteskeemist](../.codex/schema.prisma); lähteskeemi ei muudeta.

## Kasutajad ja ühendusandmed

- `strikefirst_app` on rakenduse kasutaja: tabelites SELECT, INSERT, UPDATE ja DELETE ning jadade kasutamine. Kasutajal pole superkasutaja, andmebaaside või rollide loomise õigusi ega õigust tabeleid luua või migratsioonitabelit lugeda ja muuta.
- `postgres` jääb andmebaasi ja tabelite omanikuks ning teeb migratsioonid.
- `.env` sisaldab ainult rakenduse `DATABASE_URL` ühendust. Näidis on failis [.env.example](../.env.example).
- `.env.migrations` sisaldab administraatori `DATABASE_URL` ühendust samasse baasi. Seda loeb ainult [migratsiooniskript](../scripts/migrate-db.cjs), mitte Next.js.
- Mõlemad päris keskkonnafailid on Git-ist välistatud. Ära lisa administraatori ühendust rakenduse käituskeskkonda.

Serveri `pg_hba.conf` alguses on rakenduse kasutaja ühenduspiirang: `strikefirst_app` saab ühenduda ainult `strikefirst` baasiga kohaliku sokli või loopback-aadressi (`127.0.0.1`, `::1`) kaudu. Ühendused teistesse baasidesse ja replikatsiooniühendused on keelatud. Teiste kasutajate reegleid ja teiste baaside PUBLIC õigusi pole muudetud.

Reeglite projektikoopia asub failis [pg_hba.strikefirst.conf](../prisma/pg_hba.strikefirst.conf). Uue kohaliku serveri seadistamisel lisa need `SHOW hba_file` näidatud faili algusesse enne üldisi lubavaid reegleid ning laadi seadistus administraatorina uuesti käsuga `SELECT pg_reload_conf();`. See on serveri seadistus, mida `db:migrate` ei rakenda. Olemasolevad keelatud ühendused tuleb pärast muudatust sulgeda; uued ühendused kontrollitakse uute reeglite järgi.

## Käsud

```powershell
npm run db:generate
npm run db:migrate
npm run db:check
npm run db:verify
```

`db:migrate` rakendab salvestatud migratsioonid administraatorina ning seejärel [rakenduse õigused](../prisma/permissions.sql). Skript eeldab kohalikku rollinime `strikefirst_app` ja administraatorit `postgres`. Neoni kasutuselevõtul tuleb need nimed ja õigused selle keskkonnaga sobitada.

`db:verify` kontrollib piiratud rolli õigusi ja proovib andmete loomist, lugemist, muutmist ja kustutamist tagasipööratavas tehingus. Lisaks kontrollib see IPv4 ja IPv6 kaudu lubatud ühendust `strikefirst` baasi ning keelatud ühendusi `postgres` ja `template1` baasidesse. Kontroll ei jäta katsekirjeid, kuid automaatse ID jadasse võib tekkida vahe.

Tervisekontroll `GET /api/health` küsib andmebaasist `SELECT 1`: töötava ühendusega HTTP 200 ja `database: connected`, ühenduse veaga HTTP 503. Vastus ei sisalda ühendusandmeid.

## Uued skeemimuudatused

### Näidismängijad

[Näidismängijate migratsioon](../prisma/migrations/20261102000100_demo_players/migration.sql) lisab 12 `Player` profiili üldiste nimedega (nt Martin Tamm ja Anna Kask). Need ei ole sisselogimiskontod. Migratsioon rakendub käsuga `npm run db:migrate` kõigis keskkondades, kus seda migratsiooniajalugu kasutatakse. `demo-` algusega unikaalsed slug'id väldivad korduvaid kirjeid ja olemasolevaid profiile ei kirjutata üle.

Cricketi mängijaotsing küsib vähemalt kahe tähemärgi sisestamisel `GET /api/players?q=...` kaudu andmebaasist kuni 12 nimevastet. Valitud mängija saab lisada mängu; külalise lisamine jääb samuti alles. Mänguseis ja tulemused on endiselt ainult brauseri mälus.

Migratsioonid ja [migratsioonilukk](../prisma/migrations/migration_lock.toml) kuuluvad Git-i. Juba rakendatud migratsioone ei muudeta; järgmine muudatus lisatakse uue migratsioonina. `db:migrate` rakendab olemasolevaid migratsioone, mitte ei genereeri uusi.

Uue migratsiooni loomiseks kasuta eraldi arendusbaasi ja migratsioonide kasutajat koos Prisma `migrate dev` käsuga. Ära käivita `migrate dev` või `migrate reset` pärisandmetega baasi vastu. Pärast migratsiooni uuenda Prisma klienti käsuga `npm run db:generate`.

Praegune ühendus ja skeem ei salvesta veel Cricketi mänguseisu andmebaasi; selleks on vaja eraldi rakendusloogikat.
