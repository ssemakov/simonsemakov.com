import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  Link,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";

function PhotoAlbumCard({
  imageUrl,
  imageAlt,
  title,
  description,
}: {
  imageUrl: string;
  imageAlt?: string;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardActionArea>
        <Link
          href="/photos/istanbul"
          aria-label="Navigation to photography page."
          underline="none"
        >
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
        </Link>
      </CardActionArea>
    </Card>
  );
}

export default function PhotoAlbums() {
  return (
    <Container maxWidth="md">
      <Box sx={{ m: 8 }} />
      <Grid container spacing={2}>
        <Grid size="grow"></Grid>
        <Grid size={{ sm: 8, md: 6 }}>
          <PhotoAlbumCard
            title="Istanbul"
            description="Istanbul 2024"
            imageUrl="https://img.playbook.com/BBWjA8ERhw3nmHtF9Vv65OOdSiZCaVLDBhBZk0du7K8/Z3M6Ly9wbGF5Ym9v/ay1hc3NldHMtcHVi/bGljL2I2Yzk2NGVh/LWQyN2QtNGQzYy04/OTAyLWE5OGI5ZGVm/N2EyOA"
          />
        </Grid>
        <Grid size="grow"></Grid>
      </Grid>
    </Container>
  );
}
