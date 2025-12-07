import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Обработка ошибок при инициализации
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error("Failed to initialize app:", error);
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: system-ui; text-align: center;">
        <h1>Ошибка загрузки приложения</h1>
        <p>Пожалуйста, обновите страницу или проверьте консоль браузера.</p>
        <pre style="text-align: left; background: #f5f5f5; padding: 10px; border-radius: 4px; margin-top: 20px;">${error instanceof Error ? error.message : String(error)}</pre>
      </div>
    `;
  }
}
