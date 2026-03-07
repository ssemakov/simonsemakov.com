import { Box, Container, Typography } from "@mui/material";
import {
  CSSProperties,
  ImgHTMLAttributes,
  SyntheticEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";

import { withGumletModifiers } from "../lib/gumlet";
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

const getPreviewImageSrc = (src: string, layoutWidth: number) =>
  withGumletModifiers(src, {
    w: Math.max(320, Math.round(layoutWidth * 2)),
    q: 72,
    format: "auto",
  });

const getBlurredPlaceholderSrc = (src: string, layoutWidth: number) =>
  withGumletModifiers(src, {
    w: Math.max(48, Math.round(layoutWidth / 8)),
    q: 20,
    blur: 1,
    format: "auto",
  });

interface ProgressivePhotoProps {
  src: string;
  layoutWidth: number;
  imageProps: ImgHTMLAttributes<HTMLImageElement> & {
    src: string;
    alt: string;
    style: CSSProperties;
  };
  wrapperStyle: CSSProperties;
}

function ProgressivePhoto({
  src,
  layoutWidth,
  imageProps,
  wrapperStyle,
}: ProgressivePhotoProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const previewSrc = useMemo(
    () => getPreviewImageSrc(src, layoutWidth),
    [layoutWidth, src]
  );

  const blurredSrc = useMemo(
    () => getBlurredPlaceholderSrc(src, layoutWidth),
    [layoutWidth, src]
  );

  useEffect(() => {
    setIsLoaded(false);
  }, [previewSrc]);

  return (
    <Box position="relative" overflow="hidden" style={wrapperStyle}>
      <Box
        component="img"
        src={blurredSrc}
        alt=""
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(18px) saturate(1.1)",
          transform: "scale(1.06)",
          transition: "opacity 220ms ease",
          opacity: isLoaded ? 0 : 1,
        }}
      />
      <Box
        component="img"
        {...imageProps}
        src={previewSrc}
        onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
          setIsLoaded(true);
          imageProps.onLoad?.(event);
        }}
        sx={{
          ...imageProps.style,
          position: "relative",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "opacity 220ms ease",
          opacity: isLoaded ? 1 : 0,
        }}
      />
    </Box>
  );
}

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
    [album.photos]
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
          renderPhoto={({ photo, layout, imageProps, wrapperStyle }) => (
            <ProgressivePhoto
              src={photo.src}
              layoutWidth={layout.width}
              imageProps={imageProps}
              wrapperStyle={wrapperStyle}
            />
          )}
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
