# Welcome to Simon's web-page source code.
[![Netlify Status](https://api.netlify.com/api/v1/badges/ad1d1a17-bb07-4147-b960-c1f79e4cff8b/deploy-status)](https://app.netlify.com/sites/simonsemakovcom/deploys)

The web-page can be found here https://simonsemakov.com

## Gumlet configuration

Photo galleries use Gumlet for media delivery and a local static manifest for album/photo data.
Create a `.env.local` file and configure:

```
NEXT_PUBLIC_GUMLET_DELIVERY_URL=https://<your-gumlet-source>.gumlet.io
```

Album metadata is defined in `lib/photoAlbumsManifest.ts`:
- Add/remove albums there.
- Add photos with either:
  - `path` (relative to `NEXT_PUBLIC_GUMLET_DELIVERY_URL`), or
  - `src` (fully-qualified URL).
- Always include `width` and `height` for each photo.

The provided `.env.local.example` file can be copied and updated.
