import { Layout } from "antd";
import "./App.css";

const { Header, Footer, Sider, Content } = Layout;

const App = () => (
  <Layout>
    <Layout>
      <Header>Simon's World</Header>
      <Content>
        <h1>Hello</h1>
        <h1>d My name is Simon</h1>
        <hr />
        <p>
          I do many diffrent things. You can find about some of them on this
          site.
        </p>
      </Content>
      <Footer>Footer</Footer>
    </Layout>
    <Sider>Sider</Sider>
  </Layout>
);

export default App;
