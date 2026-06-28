# Run WhisMap V5 on Windows

## 1. Extract the archive

Extract `WhisMap_V5_Community_Care.tar.gz` into a normal folder. Do not run it from inside the archive.

Example target folder:

```text
C:\Users\John Andrei\OneDrive\Desktop\WhisMap_V5_Community_Care
```

## 2. Open PowerShell in the project folder

```powershell
cd "C:\Users\John Andrei\OneDrive\Desktop\WhisMap_V5_Community_Care"
```

## 3. Confirm Bun is available

```powershell
bun --version
```

If PowerShell cannot find Bun, install Bun, then close and reopen PowerShell before continuing. The project no longer uses the Windows-incompatible `tee` command.

## 4. Install packages and run the development server

```powershell
bun install
bun run dev
```

Open:

```text
http://localhost:3000
```

Useful pages:

```text
http://localhost:3000/map
http://localhost:3000/lost-found
http://localhost:3000/care
http://localhost:3000/add-sighting
```

Stop the server with `Ctrl + C`.

## Notes

- The V5 Cat Care workspace and Lost & Found demo reports persist in the current browser using local storage.
- Clearing browser site data clears those demo records.
- The project is frontend-only. Real user accounts, moderated report publishing, secure contact delivery, production maps, and data encryption require a backend.
- `npm run check`, `npm run lint`, and `npm run build` passed before packaging.
