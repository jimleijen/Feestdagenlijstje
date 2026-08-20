# Feestdagenlijstje

Een moderne, overzichtelijke vervanger voor lijstje.nl: wensenlijstjes met betrouwbare
prijsvergelijking, lootjes trekken, Secret Santa met hints, en een schud-je-telefoon
cadeautjesspel — allemaal in één app.

## Waarom dit anders is dan lijstje.nl

- **Eén app, alle feestdagen-features.** Wensenlijstje, lootjes trekken, Secret Santa en het
  cadeautjesspel zijn los te gebruiken maar delen account, contacten en styling.
- **Nooit een verkeerde prijs.** In plaats van te scrapen (waar lijstje.nl last van lijkt te
  hebben — "€22,99 op de app, €32,99 op de site") praat de server alléén met officiële
  affiliate-API's (Bol.com Partner Program, Coolblue affiliate, Amazon PA-API). Geen
  geconfigureerde API-key voor een winkel? Dan doet die winkel simpelweg niet mee — nooit een
  gegokte prijs. Zie `server/src/services/priceAggregator.ts`.
- **Afstrepen én foutje herstellen.** Cadeaus reserveren/afstrepen kan door iedereen met de
  deel-link (geen account nodig, net als lijstje.nl), en "oeps, per ongeluk afgestreept" zet
  het meteen terug.
- **Geheime beheerfunctie bij lootjes/Secret Santa.** De organisator kan in het uiterste geval
  opzoeken wie wie heeft, zonder dat dit standaard zichtbaar is. Deelnemers die het zelf
  vergeten zijn, kunnen — als ze een account hebben — ook gewoon zelf opnieuw inloggen en
  opzoeken wie ze getrokken hebben.

## Projectstructuur

```
app/      Expo (React Native + TypeScript) app — het native platform, nodig voor
          "schud je telefoon"-detectie (expo-sensors) en gesproken opdrachten (expo-speech).
server/   Node + Express + TypeScript API, met Prisma (SQLite voor lokale dev, Postgres-klaar
          voor productie).
```

## Aan de slag

```bash
npm install               # installeert app/ en server/ als npm workspaces

cp server/.env.example server/.env
npm run server:dev --workspace=server   # prisma migrate + npx prisma migrate dev eerste keer
```

Eerste keer database opzetten:

```bash
cd server
npx prisma migrate dev --name init
```

Server starten:

```bash
npm run server:dev
```

App starten (in een tweede terminal):

```bash
cd app
cp .env.example .env   # zet EXPO_PUBLIC_API_URL op je LAN-IP als je op een fysiek toestel test
npm run start
```

## Prijsvergelijking aanzetten

De aggregator (`server/src/services/priceAggregator.ts`) doet niets totdat je minstens één
affiliate-API-key invult in `server/.env`:

- `BOL_PARTNER_API_KEY` — [partner.bol.com](https://partner.bol.com)
- `COOLBLUE_AFFILIATE_API_KEY` — Coolblue affiliate programma
- `AMAZON_PA_API_ACCESS_KEY` / `AMAZON_PA_API_SECRET_KEY` / `AMAZON_PA_API_PARTNER_TAG` —
  Amazon Associates / PA-API 5.0

De adapters in `server/src/services/priceProviders/` zijn bewust als duidelijke TODO's
achtergelaten in plaats van met gegokte endpoints ingevuld: een verkeerd geraden
response-mapping zou precies het probleem veroorzaken dat deze app moet oplossen (een
afwijkende prijs). Vul ze in tegen de actuele, officiële documentatie en test tegen een
bekend product voordat je een provider aanzet.

## Roadmap / volgende stappen

Dit is een werkende basis (skeleton) voor alle vier de onderdelen, geen productie-app. Nog te
doen voordat dit live kan:

1. **Providers écht aansluiten** — zie hierboven.
2. **E-mailverzending** — `server/src/services/mailer.ts` logt naar console zonder SMTP-config;
   vul `SMTP_*` in `.env` in voor echte verzending (bv. via Postmark/SendGrid/Resend).
3. **Push-notificaties** in plaats van/naast e-mail voor lootjes-uitslagen.
4. **Foto-upload** voor wensenlijstje-items (nu alleen een `imageUrl`-veld).
5. **Advertenties/affiliate-inkomsten** — de architectuur leent zich voor twee sporen: (a)
   affiliate-commissie op de doorkliklinks die de prijsvergelijking toch al toont — dat voelt
   voor gebruikers als een normale "bekijk bij winkel"-knop, niet als reclame; (b) een lichte
   bannerplek op de wensenlijstje- en spel-schermen (niet op de Secret Santa hints-pagina, dat
   voelt al snel opdringerig voor iets persoonlijks). Aanrader: begin met (a), dat verdient mee
   zonder de "overzichtelijk en clean" belofte van de app te breken.
6. **Tests** — er zijn nu geen geautomatiseerde tests; `nameDraw.ts` (het lotingsalgoritme) en
   `priceAggregator.ts` zijn de eerste kandidaten.
