# Welcome to Simon's web-page source code.
[![Netlify Status](https://api.netlify.com/api/v1/badges/ad1d1a17-bb07-4147-b960-c1f79e4cff8b/deploy-status)](https://app.netlify.com/sites/simonsemakovcom/deploys)

The web-page can be found here https://simonsemakov.com

## Gumlet configuration

Photo galleries now rely on Gumlet for media delivery. Create a `.env.local` file and
configure the following variables before running the site locally:

```
GUMLET_API_KEY=your_gumlet_api_key
NEXT_PUBLIC_GUMLET_DELIVERY_URL=https://<your-gumlet-source>.gumlet.io
```

The provided `.env.local.example` file can be copied and updated with the correct values.
