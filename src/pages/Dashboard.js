import Sidebar from "../components/Sidebar";
import { Layout } from "antd";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <h1>Bienvenido, {user.role}</h1>
    </>
  );
}
