import manifest from "./manifest.js";
import schema from "./schema.js";
import demo from "./demo.js";

export default { manifest, schema, demo, loadExperience: () => import("./Experience.jsx") };
