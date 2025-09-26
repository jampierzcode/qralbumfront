import { Layout, Grid } from "antd";
import Sidebar from "./Sidebar";
import { useState } from "react";

const { useBreakpoint } = Grid;

export default function Layouts({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="md" // md = 768px
        collapsedWidth={screens.xs ? 0 : 80} // en móvil sidebar desaparece
      >
        <Sidebar />
      </Layout.Sider>
      <Layout.Content className="py-12 px-6">
        <div
          style={{
            minHeight: "calc(100vh - 64px)",
            borderRadius: 8,
          }}
        >
          {children}
        </div>
      </Layout.Content>
    </Layout>
  );
}
