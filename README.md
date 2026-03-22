# Welcome to Simon's web-page source code.
[![Netlify Status](https://api.netlify.com/api/v1/badges/ad1d1a17-bb07-4147-b960-c1f79e4cff8b/deploy-status)](https://app.netlify.com/sites/simonsemakovcom/deploys)

The web-page can be found here https://simonsemakov.com

## Gumlet configuration

Photo galleries use Gumlet for media delivery and a local static manifest for album/photo data.
Create a `.env.local` file and configure:

```
B2_KEY_ID=
B2_APPLICATION_KEY=
B2_BUCKET_ID=
NEXT_PUBLIC_GUMLET_DELIVERY_URL=https://<your-gumlet-source>.gumlet.io
```

Album metadata is defined in `lib/photoAlbumsManifest.ts`:
- Add/remove albums there.
- Add photos with either:
  - `path` (relative to `NEXT_PUBLIC_GUMLET_DELIVERY_URL`), or
  - `src` (fully-qualified URL).
- Always include `width` and `height` for each photo.

### Sync manifest from Backblaze B2

You can generate/update `lib/photoAlbumsManifest.ts` from B2 folders:

```
yarn sync:photos --albums=istanbul,kyoto --root=albums
```

The script automatically reads `B2_KEY_ID`, `B2_APPLICATION_KEY`, and `B2_BUCKET_ID`
from `.env.local` (or from already-exported shell variables).

Notes:
- `--albums` is required (comma-separated folder names under `--root`).
- Each album entry can be either folder name (`istanbul`) or full path (`albums/istanbul`).
- The script reuses existing photo dimensions when possible and probes image dimensions for new files.
- Add `--dry-run` to print generated manifest without writing.

### Upload photos to Backblaze B2

You can upload local images with the same `.env.local` credentials:

```
yarn upload:photos --source ./photos --bucket my-bucket --prefix albums/istanbul
```

The upload script reads `B2_KEY_ID` and `B2_APPLICATION_KEY` from `.env.local`
before parsing CLI arguments, so the flags are only needed if you want to override them.

The provided `.env.local.example` file can be copied and updated.
