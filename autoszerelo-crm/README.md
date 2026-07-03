# CRM sablon (autószerelő példával)

Ez egy újrahasznosítható CRM alap. A működés (autentikáció, 2FA, egyedi táblák, aktivitás napló,
beállítások) minden ügyfélnél ugyanaz marad — csak a márkázást és a tartalmat kell testre szabni.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Prisma 7 + `@prisma/adapter-pg` + Postgres (Neon)
- next-auth v5 (Credentials + saját 2FA TOTP a `speakeasy`/`qrcode` csomagokkal)
- next-themes (dark/light)

## Architektúra, ami minden ügyfélnél megmarad

- **Auth**: `/register` csak az első admin fiók létrehozásáig érhető el (bootstrap), utána a
  `/settings` → Csapat fülön lehet új profilt hozzáadni/törölni.
- **2FA**: minden felhasználó önállóan be/kikapcsolhatja a `/settings` → 2FA fülön.
- **Egyedi táblák** (`CustomTable`/`CustomField`/`CustomRow`): a felhasználó a felületen hoz létre
  tetszőleges nyilvántartást (mezőkkel, típusokkal), nincs szükség adatbázis-migrációra új tábla
  létrehozásakor. Ez teszi lehetővé, hogy ugyanaz a kód más-más iparágban is használható legyen.
- **Aktivitás napló** (`ActivityLog`): minden létrehozás/módosítás/törlés/be- és kijelentkezés
  naplózva van, ki és mikor csinálta.
- **Cégadatok** (`Settings` singleton sor): a cég neve mindenhol (böngésző címe, sidebar) innen jön,
  az elsődleges szín (`accentColor`) CSS változóként (`--primary`) van befűzve.
- **Veszélyzóna**: minden visszavonhatatlan művelet (tábla törlése, profil törlése, saját fiók
  törlése) megerősítő dialógussal, piros kiemeléssel jár.

## Új ügyfélhez való újrahasznosítás

1. Másold ki ezt a mappát az új ügyfél nevére (pl. `kovacs-autoszerviz-crm`).
2. Hozz létre egy **külön Neon projektet** az ügyfélnek (ingyenes csomagban 10-ig fér el).
3. Állítsd be a `.env`-et (`DATABASE_URL`, `AUTH_SECRET` — generálás: `openssl rand -base64 33`).
4. Futtasd: `npm install && npm run db:migrate`.
5. Igény szerint módosítsd/törököd a `prisma/seed.ts`-ben lévő példa táblát (jelenleg "Járművek" egy
   autószerelőnek), vagy hagyd üresen — a tábla a felületen is létrehozható a `/tables/new` alatt.
6. `npm run dev`, majd `/register` az első admin fiók létrehozásához. A regisztrációkor megadott
   cégnév lesz a CRM neve.

## Fejlesztés

```bash
npm run dev          # dev szerver
npm run db:migrate   # Prisma migráció
npm run db:seed       # példa adatok (autószerelő "Járművek" tábla)
npm run build         # prisma generate + production build
npm run lint
```

## OAuth bejelentkezés (Google / GitHub)

Opcionális: a login és regisztráció oldal Google- és GitHub-gombot is mutat, ha a
megfelelő env változók be vannak állítva (lásd `.env.example`). Ha egy szolgáltatóhoz
nincs kitöltve mindkét változó (`CLIENT_ID` + `CLIENT_SECRET`), a hozzá tartozó gomb
egyszerűen nem jelenik meg — nem kötelező beállítani.

- **Google**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials) →
  *Create OAuth client ID* → Web application → engedélyezett redirect URI:
  `{origin}/api/auth/callback/google`
- **GitHub**: GitHub → *Settings → Developer settings → OAuth Apps → New OAuth App* →
  Authorization callback URL: `{origin}/api/auth/callback/github`

Biztonsági szabály: OAuth-tal csak **már létező** (email alapján egyező) fiókkal lehet
bejelentkezni — ismeretlen Google/GitHub email nem hoz létre új felhasználót. Az egyetlen
kivétel az első admin fiók létrehozása egy még teljesen üres rendszerben (0 felhasználó),
ahol az OAuth gomb a jelszavas regisztrációval egyenértékű bootstrap lépésként működik.

Apple Sign-In szándékosan nincs bekötve (fizetős Apple Developer Program + bonyolultabb
setup szükséges hozzá) — ha mégis kell, a `next-auth/providers/apple` providerrel ugyanígy
felvehető.
