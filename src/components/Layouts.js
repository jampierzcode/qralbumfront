import { Layout } from "antd";
import Sidebar from "./Sidebar";

export default function Layouts({ children }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Sider>
        <Sidebar />
      </Layout.Sider>
      <Layout.Content style={{ padding: "20px" }}>{children}</Layout.Content>
    </Layout>
  );
}
