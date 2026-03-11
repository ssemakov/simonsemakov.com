import { Box, Container, Typography } from "@mui/material";
import {
  useCallback,
  CSSProperties,
  MouseEventHandler,
  useRef,
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

const quantizeWidth = (width: number, step: number) => {
  if (width <= 0) {
    return step;
  }

  return Math.max(step, Math.round(width / step) * step);
};

const getPreviewImageSrc = (src: string, layoutWidth: number) =>
  withGumletModifiers(src, {
    w: Math.max(320, quantizeWidth(layoutWidth * 2, 160)),
    q: 72,
    format: "auto",
  });

const getBlurredPlaceholderSrc = (src: string, layoutWidth: number) =>
  withGumletModifiers(src, {
    w: Math.max(48, quantizeWidth(layoutWidth / 8, 24)),
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
const stageImagePreloadPromises = new Map<string, Promise<void>>();
const stageImageReady = new Set<string>();
const previewImagePreloadPromises = new Map<string, Promise<void>>();
const previewImageReady = new Set<string>();
const previewRequestedSources = new Set<string>();
const previewVariantBySource = new Map<string, string>();
const previewDisplayedSources = new Set<string>();

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

function ensureStageImagePreload(src: string): Promise<void> {
  if (stageImageReady.has(src)) {
    return Promise.resolve();
  }

  const existingPromise = stageImagePreloadPromises.get(src);
  if (existingPromise) {
    return existingPromise;
  }

  const preloadPromise = preloadImage(src)
    .then(() => {
      stageImageReady.add(src);
    })
    .finally(() => {
      stageImagePreloadPromises.delete(src);
    });

  stageImagePreloadPromises.set(src, preloadPromise);
  return preloadPromise;
}

function ensurePreviewImagePreload(src: string): Promise<void> {
  if (previewImageReady.has(src)) {
    return Promise.resolve();
  }

  const existingPromise = previewImagePreloadPromises.get(src);
  if (existingPromise) {
    return existingPromise;
  }

  const preloadPromise = preloadImage(src)
    .then(() => {
      previewImageReady.add(src);
    })
    .finally(() => {
      previewImagePreloadPromises.delete(src);
    });

  previewImagePreloadPromises.set(src, preloadPromise);
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
  const shouldAttachFullImage = Math.abs(offset) <= 1;
  const blurStages = useMemo(() => getLightboxBlurStages(source, rect.width), [rect.width, source]);
  const [visibleBlurStage, setVisibleBlurStage] = useState(blurStages[0]);
  const [incomingBlurStage, setIncomingBlurStage] = useState<ProgressiveStage | null>(
    null
  );
  const [incomingVisible, setIncomingVisible] = useState(false);
  const [isFullReady, setIsFullReady] = useState(Boolean(source && fullImageReady.has(source)));
  const [showFullImage, setShowFullImage] = useState(false);
  const finalImageRef = useRef<HTMLImageElement | null>(null);
  const blurTransitionTimerRef = useRef<number | null>(null);
  const previousSourceRef = useRef(source);
  const visibleBlurStageRef = useRef(visibleBlurStage);
  const incomingBlurStageRef = useRef<ProgressiveStage | null>(incomingBlurStage);
  const showFullImageRef = useRef(showFullImage);

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
    visibleBlurStageRef.current = visibleBlurStage;
  }, [visibleBlurStage]);

  useEffect(() => {
    incomingBlurStageRef.current = incomingBlurStage;
  }, [incomingBlurStage]);

  useEffect(() => {
    showFullImageRef.current = showFullImage;
  }, [showFullImage]);

  useEffect(() => {
    if (!source) {
      setIsFullReady(false);
      setShowFullImage(false);
      setIncomingBlurStage(null);
      previousSourceRef.current = source;
      return;
    }

    if (source === previousSourceRef.current) {
      return;
    }

    previousSourceRef.current = source;

    const alreadyReady = fullImageReady.has(source);
    const firstStage = blurStages[0];
    setIsFullReady(alreadyReady);
    setShowFullImage(alreadyReady && shouldAttachFullImage);
    setVisibleBlurStage(firstStage);
    visibleBlurStageRef.current = firstStage;
    setIncomingBlurStage(null);
    incomingBlurStageRef.current = null;
    setIncomingVisible(false);
  }, [blurStages, shouldAttachFullImage, source]);

  useEffect(() => {
    return () => {
      if (blurTransitionTimerRef.current !== null) {
        window.clearTimeout(blurTransitionTimerRef.current);
      }
    };
  }, []);

  const transitionToBlurStage = useCallback(
    (stage: ProgressiveStage): Promise<void> => {
      if (
        stage.src === visibleBlurStageRef.current.src ||
        stage.src === incomingBlurStageRef.current?.src
      ) {
        return Promise.resolve();
      }

      if (blurTransitionTimerRef.current !== null) {
        window.clearTimeout(blurTransitionTimerRef.current);
        blurTransitionTimerRef.current = null;
      }

      setIncomingBlurStage(stage);
      setIncomingVisible(false);

      return new Promise((resolve) => {
        window.requestAnimationFrame(() => {
          if (showFullImageRef.current) {
            setIncomingBlurStage(null);
            setIncomingVisible(false);
            resolve();
            return;
          }

          setIncomingVisible(true);
          blurTransitionTimerRef.current = window.setTimeout(() => {
            setVisibleBlurStage(stage);
            setIncomingBlurStage(null);
            setIncomingVisible(false);
            blurTransitionTimerRef.current = null;
            resolve();
          }, 220);
        });
      });
    },
    []
  );

  useEffect(() => {
    if (showFullImage) {
      if (blurTransitionTimerRef.current !== null) {
        window.clearTimeout(blurTransitionTimerRef.current);
        blurTransitionTimerRef.current = null;
      }

      setIncomingBlurStage(null);
      setIncomingVisible(false);
    }
  }, [showFullImage, source]);

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
    const laterStages = blurStages.slice(1);
    const currentVisibleSrc = visibleBlurStageRef.current.src;
    const currentIndex = blurStages.findIndex((stage) => stage.src === currentVisibleSrc);
    const startIndex = currentIndex >= 0 ? currentIndex + 1 : 1;

    void (async () => {
      for (const stage of laterStages.slice(Math.max(0, startIndex - 1))) {
        if (canceled || fullImageReady.has(source)) {
          return;
        }

        try {
          await ensureStageImagePreload(stage.src);
        } catch {
          continue;
        }

        if (canceled || fullImageReady.has(source)) {
          return;
        }

        if (isActiveSlide) {
          await transitionToBlurStage(stage);
        }
      }
    })();

    return () => {
      canceled = true;
    };
  }, [blurStages, isActiveSlide, isFullReady, source, transitionToBlurStage]);

  useEffect(() => {
    if (!isFullReady || !shouldAttachFullImage) {
      return;
    }

    const finalImage = finalImageRef.current;
    if (finalImage?.complete) {
      revealFinalImage();
    }
  }, [isFullReady, shouldAttachFullImage, source]);

  if (!source) {
    return null;
  }

  const fallbackStage = isActiveSlide ? visibleBlurStage : blurStages[0];

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
      {incomingBlurStage ? (
        <Box
          component="img"
          src={incomingBlurStage.src}
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
            filter: `blur(${incomingBlurStage.cssBlur}px)`,
            transform: incomingBlurStage.cssBlur > 0 ? "scale(1.01)" : "none",
            transition: "opacity 220ms ease",
            opacity: incomingVisible && !showFullImage ? 1 : 0,
          }}
        />
      ) : null}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          opacity: !showFullImage && isActiveSlide ? 1 : 0,
          transition: "opacity 180ms ease",
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            boxShadow: "0 0 0 0 rgba(255, 255, 255, 0.55)",
            animation: "photoLoadingPulse 1.1s ease-in-out infinite",
            "@keyframes photoLoadingPulse": {
              "0%": {
                transform: "scale(0.9)",
                boxShadow: "0 0 0 0 rgba(255, 255, 255, 0.45)",
              },
              "70%": {
                transform: "scale(1.1)",
                boxShadow: "0 0 0 14px rgba(255, 255, 255, 0)",
              },
              "100%": {
                transform: "scale(0.9)",
                boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)",
              },
            },
          }}
        />
      </Box>
      <Box
        component="img"
        ref={finalImageRef}
        src={isFullReady && shouldAttachFullImage ? source : undefined}
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
  alt: string;
  title?: string;
  width: number;
  height: number;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

function ProgressivePhoto({
  src,
  alt,
  title,
  width,
  height,
  onClick,
}: ProgressivePhotoProps) {
  const layoutWidth = width;
  const [shouldLoad, setShouldLoad] = useState(() => previewRequestedSources.has(src));
  const wrapperRef = useRef<HTMLElement | null>(null);

  const previewSrc = useMemo(
    () => getPreviewImageSrc(src, layoutWidth),
    [layoutWidth, src]
  );
  const [effectivePreviewSrc, setEffectivePreviewSrc] = useState(
    () => previewVariantBySource.get(src) ?? previewSrc
  );
  const [isLoaded, setIsLoaded] = useState(() =>
    previewDisplayedSources.has(src) ||
    previewImageReady.has(previewVariantBySource.get(src) ?? previewSrc)
  );

  const blurredSrc = useMemo(
    () => getBlurredPlaceholderSrc(src, layoutWidth),
    [layoutWidth, src]
  );

  useEffect(() => {
    const cachedVariant = previewVariantBySource.get(src);
    const nextPreviewSrc = cachedVariant ?? previewSrc;
    setEffectivePreviewSrc(nextPreviewSrc);
    setShouldLoad(previewRequestedSources.has(src));
    setIsLoaded(previewDisplayedSources.has(src) || previewImageReady.has(nextPreviewSrc));
  }, [layoutWidth, previewSrc, src]);

  useEffect(() => {
    if (shouldLoad) {
      return;
    }

    const currentElement = wrapperRef.current;
    if (!currentElement) {
      return;
    }

    if (typeof window !== "undefined") {
      const rect = currentElement.getBoundingClientRect();
      const margin = 280;
      const isNearViewport =
        rect.bottom >= -margin && rect.top <= window.innerHeight + margin;

      if (isNearViewport) {
        previewRequestedSources.add(src);
        setShouldLoad(true);
        return;
      }
    }

    if (typeof IntersectionObserver === "undefined") {
      previewRequestedSources.add(src);
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) {
          previewRequestedSources.add(src);
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
  }, [shouldLoad, src]);

  useEffect(() => {
    if (!shouldLoad) {
      return;
    }

    const cachedVariant = previewVariantBySource.get(src);
    const nextPreviewSrc = cachedVariant ?? previewSrc;

    if (!cachedVariant) {
      previewVariantBySource.set(src, nextPreviewSrc);
    }

    if (effectivePreviewSrc !== nextPreviewSrc) {
      setEffectivePreviewSrc(nextPreviewSrc);
    }

    if (previewImageReady.has(nextPreviewSrc)) {
      previewDisplayedSources.add(src);
      setIsLoaded(true);
      return;
    }

    let canceled = false;

    void ensurePreviewImagePreload(nextPreviewSrc)
      .then(() => {
        if (canceled) {
          return;
        }
        previewDisplayedSources.add(src);
        setIsLoaded(true);
      })
      .catch(() => undefined);

    return () => {
      canceled = true;
    };
  }, [effectivePreviewSrc, previewSrc, shouldLoad, src]);

  return (
    <Box
      component={onClick ? "button" : "div"}
      ref={wrapperRef}
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={
        onClick
          ? "react-photo-album--photo react-photo-album--button"
          : "react-photo-album--photo"
      }
      style={
        {
          "--react-photo-album--photo-width": width,
          "--react-photo-album--photo-height": height,
        } as CSSProperties
      }
      sx={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        padding: "calc(var(--react-photo-album--padding) * 1px)",
      }}
    >
      <Box
        component="img"
        src={blurredSrc}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        sx={{
          position: "absolute",
          inset: "calc(var(--react-photo-album--padding) * 1px)",
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
        src={shouldLoad ? effectivePreviewSrc : undefined}
        alt={alt}
        title={title}
        loading="lazy"
        decoding="async"
        className="react-photo-album--image"
        onLoad={() => {
          if (effectivePreviewSrc) {
            previewImageReady.add(effectivePreviewSrc);
          }
          previewDisplayedSources.add(src);
          setIsLoaded(true);
        }}
        sx={{
          aspectRatio: `${width} / ${height}`,
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
          onClick={({ index }) => setLightboxIndex(index)}
          render={{
            photo: ({ onClick }, { photo, width, height, index }) => (
              <ProgressivePhoto
                key={photo.src || index}
                src={photo.src}
                alt={photo.alt ?? ""}
                title={photo.title}
                width={width}
                height={height}
                onClick={onClick}
              />
            ),
          }}
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
