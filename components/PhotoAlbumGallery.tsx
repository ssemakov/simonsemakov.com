import { Box, Container, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";

import type { PhotoAlbumMetadata } from "../lib/photoAlbums";

interface PhotoAlbumGalleryProps {
  album: PhotoAlbumMetadata;
}

const getColumnCount = (containerWidth: number) => {
  if (containerWidth < 600) return 1;
  if (containerWidth < 900) return 2;
  if (containerWidth < 1200) return 3;
  return 4;
};

export default function PhotoAlbumGallery({ album }: PhotoAlbumGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const slides = useMemo(
    () =>
      album.photos.map((photo) => ({
        src: photo.src,
        width: photo.width,
        height: photo.height,
        alt: photo.alt,
        description: photo.description,
      })),
    [album.photos],
  );

  return (
    <Container
      maxWidth="lg"
      sx={{ pt: { xs: 1, md: 2 }, pb: { xs: 6, md: 10 } }}
    >
      <Box
        maxWidth={{ xs: "100%", md: "80%" }}
        mx="auto"
        px={{ xs: 0, sm: 2 }}
        display="flex"
        flexDirection="column"
        gap={{ xs: 3, md: 4 }}
      >
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography component="h1" variant="h3" fontWeight={600}>
            {album.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {album.description}
          </Typography>
        </Box>
        <PhotoAlbum
          layout="masonry"
          spacing={(containerWidth) => {
            if (containerWidth < 600) return 8;
            if (containerWidth < 900) return 12;
            return 16;
          }}
          padding={0}
          photos={album.photos}
          columns={getColumnCount}
          onClick={(_, __, index) => setLightboxIndex(index)}
        />
      </Box>
      <Lightbox
        index={lightboxIndex}
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        slides={slides}
        plugins={[Captions]}
        captions={{ descriptionTextAlign: "center" }}
      />
    </Container>
  );
}
