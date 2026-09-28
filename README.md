# FAAAH on Terminal Error

Un'estensione desktop per Visual Studio Code che riproduce **FAAAH** quando:

- un comando nel terminale integrato termina con un exit code diverso da zero;
- un task di VS Code termina con un exit code diverso da zero.

## Uso

L'estensione si attiva automaticamente. Prova a eseguire nel terminale un comando che fallisce, per esempio:

```sh
node comando-che-non-esiste.js
```

La Command Palette offre anche:

- `FAAAH: Play Sound` per provare l'audio;
- `FAAAH: Enable/Disable` per attivare o disattivare l'estensione.

Impostazioni disponibili:

- `faaah.enabled`: abilita o disabilita il suono;
- `faaah.cooldownMs`: evita suoni sovrapposti o duplicati;
- `faaah.notifyOnError`: mostra anche una notifica di VS Code.

## Limite dell'API di VS Code

Il rilevamento dei singoli comandi richiede la **shell integration** del terminale. Funziona normalmente con PowerShell, bash, zsh e fish quando la shell integration di VS Code è attiva. Non è possibile leggere in modo affidabile ogni riga di ogni terminale usando le API pubbliche di VS Code; per questo l'estensione considera un errore un comando con exit code non zero. Gli errori dei task vengono intercettati anche tramite l'API Tasks.

## Sviluppo e installazione

```sh
npm install
npm test
npm run package
```

Il comando di packaging genera un file `.vsix`. In VS Code scegli **Extensions: Install from VSIX...** e selezionalo.

## Compatibilità audio

- Windows: player Media Foundation/WPF incluso nel sistema;
- macOS: `afplay` incluso nel sistema;
- Linux: richiede uno tra `ffplay`, `mpg123`, VLC (`cvlc`) o SoX (`play`).

## Licenze

Il codice sorgente è distribuito con licenza MIT; vedi il file `LICENSE`.

L'audio non è coperto dalla licenza MIT. **FAAAH** proviene da [QuickSounds](https://quicksounds.com/sound/25382/faaah) ed è usato secondo la [QuickSounds Standard License](https://quicksounds.com/page/license-agreement), che consente l'uso gratuito nel software e richiede attribuzione. Vedi il file `THIRD_PARTY_NOTICES.md`.
