import { Box, Container, Typography } from "@mui/material";
import {
  CSSProperties,
  ImgHTMLAttributes,
  useRef,
  SyntheticEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import type { RenderSlideProps, Slide } from "yet-another-react-lightbox";

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
    blur: 40,
    format: "auto",
  });

interface ProgressiveStage {
  src: string;
  cssBlur: number;
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

const fullImagePreloadPromises = new Map<string, Promise<void>>();
const fullImageReady = new Set<string>();

function ensureFullImagePreload(src: string): Promise<void> {
  if (fullImageReady.has(src)) {
    return Promise.resolve();
  }

  const existingPromise = fullImagePreloadPromises.get(src);
  if (existingPromise) {
    return existingPromise;
  }

  const preloadPromise = preloadImage(src)
    .then(() => {
      fullImageReady.add(src);
    })
    .finally(() => {
      fullImagePreloadPromises.delete(src);
    });

  fullImagePreloadPromises.set(src, preloadPromise);
  return preloadPromise;
}

function getLightboxBlurStages(src: string, rectWidth: number): ProgressiveStage[] {
  const targetWidth = Math.max(400, Math.round(rectWidth));

  return [
    {
      src: withGumletModifiers(src, {
        w: Math.max(72, Math.round(targetWidth * 0.08)),
        q: 16,
        blur: 65,
        format: "auto",
      }),
      cssBlur: 18,
    },
    {
      src: withGumletModifiers(src, {
        w: Math.max(220, Math.round(targetWidth * 0.28)),
        q: 32,
        blur: 30,
        format: "auto",
      }),
      cssBlur: 10,
    },
    {
      src: withGumletModifiers(src, {
        w: Math.max(720, Math.round(targetWidth * 0.72)),
        q: 58,
        blur: 10,
        format: "auto",
      }),
      cssBlur: 4,
    },
  ];
}

interface ProgressiveLightboxSlideProps {
  slide: Slide;
  rect: RenderSlideProps["rect"];
  offset: number;
}

function ProgressiveLightboxSlide({ slide, rect, offset }: ProgressiveLightboxSlideProps) {
  const source = "src" in slide && typeof slide.src === "string" ? slide.src : "";
  const isActiveSlide = offset === 0;
  const blurStages = useMemo(() => getLightboxBlurStages(source, rect.width), [rect.width, source]);
  const [activeBlurStage, setActiveBlurStage] = useState(blurStages[0]);
  const [isFullReady, setIsFullReady] = useState(Boolean(source && fullImageReady.has(source)));
  const [showFullImage, setShowFullImage] = useState(false);
  const finalImageRef = useRef<HTMLImageElement | null>(null);

  const revealFinalImage = () => {
    const image = finalImageRef.current;
    if (!image) {
      return;
    }

    const show = () => setShowFullImage(true);

    if (typeof image.decode === "function") {
      void image.decode().then(show).catch(show);
      return;
    }

    show();
  };

  useEffect(() => {
    if (!source) {
      setIsFullReady(false);
      setShowFullImage(false);
      return;
    }

    const alreadyReady = fullImageReady.has(source);
    setIsFullReady(alreadyReady);
    setShowFullImage(false);
  }, [source]);

  useEffect(() => {
    if (!source || isFullReady) {
      return;
    }

    let canceled = false;

    void ensureFullImagePreload(source)
      .then(() => {
        if (canceled) {
          return;
        }
        setIsFullReady(true);
      })
      .catch(() => undefined);

    return () => {
      canceled = true;
    };
  }, [isFullReady, source]);

  useEffect(() => {
    if (!source || !isActiveSlide || isFullReady) {
      return;
    }

    let canceled = false;
    const firstStage = blurStages[0];
    const laterStages = blurStages.slice(1);

    setActiveBlurStage(firstStage);

    void (async () => {
      for (const stage of laterStages) {
        if (canceled || fullImageReady.has(source)) {
          return;
        }

        try {
          await preloadImage(stage.src);
        } catch {
          continue;
        }

        if (canceled || fullImageReady.has(source)) {
          return;
        }

        if (isActiveSlide) {
          setActiveBlurStage(stage);
        }
      }
    })();

    return () => {
      canceled = true;
    };
  }, [blurStages, isActiveSlide, isFullReady, source]);

  useEffect(() => {
    if (!isFullReady) {
      return;
    }

    const finalImage = finalImageRef.current;
    if (finalImage?.complete) {
      revealFinalImage();
    }
  }, [isFullReady, source]);

  if (!source) {
    return null;
  }

  const fallbackStage = isActiveSlide ? activeBlurStage : blurStages[0];

  return (
    <Box position="relative" width="100%" height="100%">
      <Box
        component="img"
        src={fallbackStage.src}
        alt=""
        aria-hidden
        loading="eager"
        decoding="async"
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          filter: `blur(${fallbackStage.cssBlur}px)`,
          transform: fallbackStage.cssBlur > 0 ? "scale(1.01)" : "none",
          transition: "opacity 220ms ease, filter 220ms ease, transform 220ms ease",
          opacity: showFullImage ? 0 : 1,
        }}
      />
      <Box
        component="img"
        ref={finalImageRef}
        src={isFullReady ? source : undefined}
        alt={slide.alt ?? ""}
        loading="eager"
        decoding="async"
        onLoad={() => {
          revealFinalImage();
        }}
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transition: "opacity 220ms ease",
          opacity: showFullImage ? 1 : 0,
          visibility: showFullImage ? "visible" : "hidden",
        }}
      />
    </Box>
  );
}

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
  const [shouldLoad, setShouldLoad] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const previewSrc = useMemo(
    () => getPreviewImageSrc(src, layoutWidth),
    [layoutWidth, src]
  );

  const blurredSrc = useMemo(
    () => getBlurredPlaceholderSrc(src, layoutWidth),
    [layoutWidth, src]
  );

  useEffect(() => {
    setShouldLoad(false);
    setIsLoaded(false);
  }, [previewSrc]);

  useEffect(() => {
    if (shouldLoad) {
      return;
    }

    const currentElement = wrapperRef.current;
    if (!currentElement) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "280px 0px",
      }
    );

    observer.observe(currentElement);

    return () => observer.disconnect();
  }, [shouldLoad, previewSrc]);

  return (
    <Box ref={wrapperRef} position="relative" overflow="hidden" style={wrapperStyle}>
      <Box
        component="img"
        src={shouldLoad ? blurredSrc : undefined}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
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
        src={shouldLoad ? previewSrc : undefined}
        loading="lazy"
        decoding="async"
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
        render={{
          slide: ({ slide, rect, offset }) => (
            <ProgressiveLightboxSlide slide={slide} rect={rect} offset={offset} />
          ),
        }}
        plugins={[Captions]}
        captions={{ descriptionTextAlign: "center" }}
      />
    </Container>
  );
}
