import HomePageContent from "../components/HomePageContent";
import Layout from "../components/Layout";
import Sidebar from "../components/Sidebar";

export default function DefaultLayout() {
  return <Layout leftPaine={HomePageContent} rightPaine={Sidebar} />;
}
