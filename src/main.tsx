import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Service Worker 등록
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker 등록 성공:', registration.scope);
      })
      .catch((error) => {
        console.error('❌ Service Worker 등록 실패:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
