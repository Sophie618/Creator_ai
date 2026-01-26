import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/mobile-responsive.css"; // 移动端响应式适配样式

createRoot(document.getElementById("root")!).render(<App />);