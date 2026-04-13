import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initNativeAlarms } from "./lib/nativeAlarms";
import { initNativePlatform } from "./lib/nativePlatform";

// Initialize native features
initNativePlatform();
initNativeAlarms();

createRoot(document.getElementById("root")!).render(<App />);
