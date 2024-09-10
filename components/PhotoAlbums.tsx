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

const Istanbul = () => (
  <div style={{ height: "1500px" }}>
    <iframe
      src="https://www.playbook.com/e/simons83/s6arErSms7dmM6w5VdrznbWa?theme=gallery"
      title="Istanbul"
      sandbox="allow-same-origin allow-scripts"
      frameBorder="0"
      width="100%"
      height="100%"
    ></iframe>
  </div>
);

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

export default function PhotoAlbums() {
  return (
    <Container fixed maxWidth="sm">
      <Box sx={{ m: 8 }} />
      <Grid container spacing={2} columns={12}>
        <Grid size={8}>
          <PhotoAlbumCard
            title="Istanbul"
            description="Istanbul 2024"
            imageUrl="https://img.playbook.com/BBWjA8ERhw3nmHtF9Vv65OOdSiZCaVLDBhBZk0du7K8/Z3M6Ly9wbGF5Ym9v/ay1hc3NldHMtcHVi/bGljL2I2Yzk2NGVh/LWQyN2QtNGQzYy04/OTAyLWE5OGI5ZGVm/N2EyOA"
          />
        </Grid>
      </Grid>
    </Container>
  );
}
