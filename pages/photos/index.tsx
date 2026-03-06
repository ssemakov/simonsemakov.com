import { FC } from "react";
import { GetStaticProps } from "next";

import Layout from "../../components/Layout";
import PhotoAlbums from "../../components/PhotoAlbums";
import Sidebar from "../../components/Sidebar";
import { getAllPhotoAlbums } from "../../lib/photoAlbums";
import type { PhotoAlbumMetadata } from "../../lib/photoAlbums";

interface PhotoAlbumsPageProps {
  albums: PhotoAlbumMetadata[];
}

export default function PhotoAlbumsPage({ albums }: PhotoAlbumsPageProps) {
  const AlbumsPane: FC = () => <PhotoAlbums albums={albums} />;

  return <Layout leftPaine={AlbumsPane} rightPaine={Sidebar} />;
}

export const getStaticProps: GetStaticProps<PhotoAlbumsPageProps> = async () => {
  const albums = await getAllPhotoAlbums();

  return {
    props: {
      albums,
    },
  };
};
