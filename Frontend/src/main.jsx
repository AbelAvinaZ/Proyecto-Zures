import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.jsx";

// instancia de QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Reintentar 1 vez si falla
      staleTime: 5 * 60 * 1000, // 5 minutos de cache
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
