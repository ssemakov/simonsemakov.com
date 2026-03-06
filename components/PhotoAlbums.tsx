import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Link from "next/link";

import type { PhotoAlbumMetadata } from "../lib/photoAlbums";

function PhotoAlbumCard({
  slug,
  imageUrl,
  imageAlt,
  title,
  description,
}: {
  slug: string;
  imageUrl: string;
  imageAlt?: string;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardActionArea component={Link} href={`/photos/${slug}`}>
        <CardMedia
          component="img"
          height="240"
          image={imageUrl}
          alt={imageAlt ?? title}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function PhotoAlbums({ albums }: { albums: PhotoAlbumMetadata[] }) {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: { xs: 4, md: 8 } }} />
      <Grid container spacing={3} justifyContent="center">
        {albums.map((album) => (
          <Grid key={album.slug} size={{ xs: 12, sm: 10, md: 6, lg: 5 }}>
            <PhotoAlbumCard
              slug={album.slug}
              title={album.title}
              description={album.description}
              imageUrl={album.coverImage.src}
              imageAlt={album.coverImage.alt}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
