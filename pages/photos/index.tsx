import Layout from "../../components/Layout";
import PhotoAlbums from "../../components/PhotoAlbums";
import Sidebar from "../../components/Sidebar";

interface LayoutProps {
  leftPaine: React.FC;
  rightPaine: React.FC;
}

export default function DefaultLayout() {
  return <Layout leftPaine={PhotoAlbums} rightPaine={Sidebar} />;
}
