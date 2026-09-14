import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, Segmented, Switch, Tooltip } from "antd";
import { DesktopOutlined, MobileOutlined, RedoOutlined, TabletOutlined } from "@ant-design/icons";

export const DEVICES = {
  "mobile-sm": { label: "iPhone mini", width: 375, height: 812, frame: "mobile" },
  mobile: { label: "iPhone", width: 390, height: 844, frame: "mobile" },
  "mobile-land": { label: "iPhone horizontal", width: 844, height: 390, frame: "mobile" },
  tablet: { label: "iPad", width: 768, height: 1024, frame: "tablet" },
  desktop: { label: "Escritorio", width: 1440, height: 900, frame: "desktop" },
};

const FRAME_PADDING = { mobile: 20, tablet: 28, desktop: 0 };
const FRAME_TOP = { mobile: 0, tablet: 0, desktop: 28 };

/**
 * Renderiza el regalo REAL dentro de un iframe (/frame) con el viewport exacto
 * del dispositivo. La composición la adapta la plantilla; aquí sólo se escala el marco.
 */
export default function DevicePreview({
  gift,
  media,
  device: controlledDevice,
  onDeviceChange,
  devices = ["mobile", "desktop"],
  toolbar = true,
  defaultAutoOpen = true,
  className = "",
}) {
  const [internalDevice, setInternalDevice] = useState(devices[0]);
  const deviceKey = controlledDevice || internalDevice;
  const device = DEVICES[deviceKey];
  const setDevice = onDeviceChange || setInternalDevice;

  const [autoOpen, setAutoOpen] = useState(defaultAutoOpen);
  const iframeRef = useRef(null);
  const stageRef = useRef(null);
  const ready = useRef(false);
  const latest = useRef({ gift, media, autoOpen });
  latest.current = { gift, media, autoOpen };
  const [scale, setScale] = useState(0.5);

  const post = useCallback((message) => {
    iframeRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, []);

  const sendUpdate = useCallback(() => {
    if (!ready.current || !latest.current.gift) return;
    post({ type: "gift-preview:update", ...latest.current });
  }, [post]);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === "gift-preview:ready") {
        ready.current = true;
        sendUpdate();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sendUpdate]);

  // Envío con pequeño debounce para no re-renderizar en cada tecla.
  useEffect(() => {
    const t = setTimeout(sendUpdate, 150);
    return () => clearTimeout(t);
  }, [gift, media, sendUpdate]);

  useEffect(() => {
    sendUpdate();
    post({ type: "gift-preview:restart" });
  }, [autoOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const compute = () => {
      const pad = FRAME_PADDING[device.frame] * 2;
      const totalW = device.width + pad;
      const totalH = device.height + pad + FRAME_TOP[device.frame] + 24;
      const s = Math.min((stage.clientWidth - 32) / totalW, (stage.clientHeight - 32) / totalH, 1);
      setScale(Math.max(0.15, s));
    };
    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [device]);

  const frameStyle = { width: device.width * scale, height: device.height * scale };

  const icons = { mobile: <MobileOutlined />, "mobile-sm": <MobileOutlined />, "mobile-land": <MobileOutlined rotate={90} />, tablet: <TabletOutlined />, desktop: <DesktopOutlined /> };

  return (
    <div className={`adm-device-wrap ${className}`} style={{ display: "grid", gridTemplateRows: toolbar ? "auto 1fr" : "1fr", minHeight: 0, height: "100%" }}>
      {toolbar && (
        <div className="adm-device-bar">
          <Segmented
            value={deviceKey}
            onChange={setDevice}
            options={devices.map((key) => ({ value: key, icon: icons[key], label: devices.length > 3 ? undefined : DEVICES[key].label }))}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label className="adm-small adm-muted" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Switch size="small" checked={!autoOpen} onChange={(v) => setAutoOpen(!v)} /> Pantalla de apertura
            </label>
            <Tooltip title="Reiniciar experiencia">
              <Button icon={<RedoOutlined />} onClick={() => post({ type: "gift-preview:restart" })} aria-label="Reiniciar experiencia" />
            </Tooltip>
          </div>
        </div>
      )}
      <div className="adm-device-stage" ref={stageRef}>
        <div>
          <div className={`adm-device adm-device--${device.frame}`} style={frameStyle}>
            <iframe
              ref={iframeRef}
              title={`Vista previa ${device.label}`}
              src="/frame"
              width={device.width}
              height={device.height}
              style={{ width: device.width, height: device.height, transform: `scale(${scale})` }}
            />
          </div>
          <p className="adm-device__label">
            {device.label} · {device.width}×{device.height}
          </p>
        </div>
      </div>
    </div>
  );
}
