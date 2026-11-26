# AGENTS.md

Retningslinjer for alle som videreutvikler dette repoet, både mennesker og KI-agenter (Copilot, Claude, ChatGPT og andre). Les denne fila før du endrer noe.

For brukerne av verktøyene, se [README.md](README.md). For dataformatene, se [docs/DATAMODELL.md](docs/DATAMODELL.md).

## Hva dette er

En digital sjekkliste for familier som er gjenforent i Tønsberg kommune, og verktøyene som holder innholdet ved like. Den skal kunne driftes av folk uten utviklerkompetanse, i flere år, uten at noen som kan koden er til stede.

| Fil | Brukes av | Gjør |
|---|---|---|
| `veileder.html` | Familiene | Appen. Leser `data/` og viser sjekklisten på valgt språk. |
| `redaktor.html` | Redaktør (fagperson, ikke teknisk) | Redigerer norsk innhold og laster ned en endringsfil. |
| `tolk.html` | Tolker | Kontrollerer og retter oversettelser og laster ned en kontrollfil. |
| `mottak.html` | Teknisk eier | Tar imot filene, KI-oversetter, kontrollerer og lager zip til opplasting. |
| `tools/sjekk-data.mjs` | GitHub | Kontrollerer `data/` ved hver opplasting og hver PR. |

## Prinsipper

1. **Enkelt før smart.** Redaktørene ble overveldet av for mange valg. Det ble bedre da vi fjernet ting (KI-knapp, utkast/publisert, forrige/neste). Før du legger til en funksjon: Hvem ber om den, og hva kan vi fjerne i stedet?
2. **Ingen byggesteg, ingen avhengigheter.** Hver HTML-fil er selvstendig: markup, CSS og JavaScript i én fil. Eneste eksterne ressurs er fonten Barlow fra Google Fonts. Ingen npm, ingen rammeverk, ingen bundler.
3. **Ingen hemmeligheter.** Ingen tokens, API-nøkler eller innlogging i koden. GitHub API brukes bare til uautentisert lesing av et offentlig repo (60 kall i timen per IP er nok).
4. **Ingen database.** Alt innhold er JSON i `data/`. Utkast lagres bare i brukerens nettleser (`localStorage`).
5. **Mennesker publiserer.** Ingen verktøy skriver til GitHub. Teknisk eier laster opp på github.com. Ikke bygg automatisk publisering, PR-er fra verktøyene eller GitHub-nøkler. Det ble vurdert og valgt bort fordi det gir flere feilkilder enn det fjerner.

## Dette må aldri endres

- **Filnavnet `veileder.html`.** QR-koder og lenker peker dit.
- **ID-ene i `struktur.json`.** Familienes avkrysninger lagres på punkt-ID. Bytt tittel, aldri ID.
- **Lagringsnøkkelen `fgv_app_v1`.** Endres den, mister alle familier fremdriften sin. Endrer du formen på det som lagres, skriv en overgang i `loadState()` i `veileder.html` (slik det er gjort for den første versjonen).
- **Nøkkelmønstrene i språkfilene** (`punkt.<id>.tittel` osv.).
- **JSON-formatet i `data/`:** 2 mellomrom innrykk og linjeskift til slutt (`JSON.stringify(x, null, 2) + "\n"`). Da viser GitHub bare det som faktisk er endret.
- **Formatet på endringsfil og kontrollfil.** Folk kan ha filer liggende. Nye felt er greit. Endrer du betydningen av et felt, øk `versjon` og håndter de gamle.

## Arbeidsflyt

Det finnes to typer endringer, og de går forskjellige veier:

| Type | Vei | Hvem |
|---|---|---|
| **Innhold** (tekst, punkter, oversettelser i `data/`) | Mottaket → zip → opplasting rett til `main` på github.com | Teknisk eier |
| **Kode og dokumentasjon** (alt annet) | Egen gren → pull request → gjennomgang → merge | Utvikler eller KI-agent |

Regler for kode-PR-er:
- **Aldri commit rett til `main`.** Lag en gren med et beskrivende navn, for eksempel `redaktor-enklere-lenkefelt`.
- **Ikke endre `data/` i en kode-PR**, med ett unntak: en migrering av dataformatet. Den skal da komme sammen med endringene i alle verktøyene som leser formatet, og i `tools/sjekk-data.mjs`.
- **Små PR-er.** Én endring per PR. Skriv i beskrivelsen hva som er endret, hvorfor, og hvordan det er testet.
- **Ikke force-push** og ikke skriv om historikken på `main`.
- Commit-meldinger skrives på norsk og sier hva endringen gjør: «Redaktør: tydeligere forklaring på lenkefeltet».

`main` har ikke grenbeskyttelse. Det er bevisst: teknisk eier laster opp innhold direkte, og det skal være enkelt. Grenbeskyttelse som krever PR, ville stoppet den flyten.

## Før du lager en PR

1. Start en lokal server i repo-mappa: `python3 -m http.server 8000`. Filene virker ikke ved dobbeltklikk, fordi de henter JSON.
2. Kjør `node tools/sjekk-data.mjs`. Den skal si «Data-mappa er i orden».
3. Test det du har endret, i nettleseren:
   - **`veileder.html`:** Velg språk, svar på spørsmålene, åpne punkter. Test arabisk (høyre til venstre) og mobilbredde (390 px). Sjekk at avkrysninger huskes etter ny innlasting.
   - **`redaktor.html`:** Veiledningen vises og fremhever riktige deler. Rediger et punkt, se forhåndsvisningen, last ned endringsfila.
   - **`tolk.html`:** Velg språk, rett en tekst, godkjenn, last ned kontrollfila.
   - **`mottak.html`:** Legg inn en endringsfil og en kontrollfil. Sjekk at zip-fila bare inneholder de endrede filene.
4. Ingen feil i nettleserens konsoll.
5. Verktøyene henter fra GitHub når de kan. Lokalt får du ofte den publiserte versjonen i stedet, og en gul melding om det. Det er forventet.

## Kode som finnes flere steder

Hver fil er selvstendig, så noe logikk er kopiert. **Endrer du ett sted, endre alle:**

| Logikk | Hvor |
|---|---|
| Hente siste versjon fra GitHub (API + raw) | `redaktor.html`, `tolk.html`, `mottak.html` |
| Kontroll av data (`validate`) | `mottak.html` og `tools/sjekk-data.mjs` |
| Kontroll av oversettelser (`check`, `SCRIPT`) | `mottak.html` og `tolk.html` |
| Formatering av tekst (`body`: avsnitt, «– »-lister, «…»-bokser) | `veileder.html` og forhåndsvisningen i `redaktor.html` |
| Navn på vilkår (`FORLBL`, «Har barn» osv.) | `redaktor.html` (og spørsmålstekstene i `data/`) |

Ikke trekk dette ut i felles JS-filer uten god grunn. Én fil per verktøy gjør det lett å forstå, flytte og rulle tilbake.

## Tekst og språk

- Alt grensesnitt er på norsk bokmål, i klarspråk. Skriv kort, konkret og vennlig. Bruk «du».
- Innholdet i sjekklisten følger [docs/skriveveiledning.md](docs/skriveveiledning.md).
- Knapper sier hva som skjer: «Last ned kontrollfila», ikke «OK».
- Brukerne er fagpersoner, tolker og en teknisk eier, ikke utviklere. Unngå ord som «commit», «JSON» og «repo» i verktøyene der det går, bortsett fra i mottaket.

## Nyttig å vite

- **Statusen «utkast»** finnes i datamodellen, men redaktøren lager ikke lenger utkast. Nye punkter og faser vises med en gang. Appen viser utkast bare med `?utkast=1`.
- **`felles.ki_merknad`** i `ui/xx.json` vises øverst i appen når noe på språket ikke er kontrollert av tolk. Norsk har teksten bare som kilde for oversettelse.
- **Nye språk** legges til i mottaket (steg 2). Det lager filene og KI-oversetter alt, inkludert `ui/`.
- **Vanligste feil ved opplasting** er at mappa *rundt* `data` dras inn på GitHub. Både mottaket og `sjekk-data` kjenner igjen dette og forklarer hvordan det rettes.
- Lagringsnøkler i nettleseren: `fgv_app_v1` (familiene), `fgv_redaktor` (redaktørens utkast), `fgv_tolk_<språk>` (tolkens arbeid), `fgv_mottak_venter` (zip som ikke er kontrollert), `fgv_mottak_intro` og `fgv_tolk_intro` (om veiledningen er vist).
