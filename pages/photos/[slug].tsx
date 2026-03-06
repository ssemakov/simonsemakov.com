import { GetStaticPaths, GetStaticProps } from "next";
import { FC } from "react";

import Layout from "../../components/Layout";
import PhotoAlbumGallery from "../../components/PhotoAlbumGallery";
import Sidebar from "../../components/Sidebar";
import {
  albumSlugs,
  getPhotoAlbumBySlug,
} from "../../lib/photoAlbums";
import type { PhotoAlbumMetadata } from "../../lib/photoAlbums";

interface PhotoAlbumPageProps {
  album: PhotoAlbumMetadata;
}

export default function PhotoAlbumPage({ album }: PhotoAlbumPageProps) {
  const AlbumContent: FC = () => <PhotoAlbumGallery album={album} />;

  return <Layout leftPaine={AlbumContent} rightPaine={Sidebar} />;
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: albumSlugs.map((slug) => ({ params: { slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<PhotoAlbumPageProps> = async ({ params }) => {
  const slug = params?.slug;
  const album =
    typeof slug === "string" ? await getPhotoAlbumBySlug(slug) : undefined;

  if (!album) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      album,
    },
  };
};
