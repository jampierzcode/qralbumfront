import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ShellLoading, ShellMessage } from "../engine/ShellStatus.jsx";
import { publicRequest } from "../lib/publicApi.js";

/** Links y QR antiguos (/c/:uuid y /:uuid) → nuevo /g/:slug */
export default function LegacyRedirect({ uuid: uuidProp }) {
  const params = useParams();
  const uuid = uuidProp || params.uuid;
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    publicRequest(`/public/legacy/${encodeURIComponent(uuid)}`)
      .then(({ slug }) => setState({ status: "ready", slug }))
      .catch((error) => setState({ status: "error", error }));
  }, [uuid]);

  if (state.status === "ready") return <Navigate to={`/g/${state.slug}`} replace />;
  if (state.status === "error") {
    return <ShellMessage title="Este regalo no está disponible" text="Puede que el enlace haya cambiado. Pídele a quien te lo envió el nuevo link." />;
  }
  return <ShellLoading />;
}
