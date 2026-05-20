import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app/router/AppRouter";
import { SnackbarProvider } from "notistack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "./app/providers/I18nProvider";
import "./i18n/config";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
    }
  }
});

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <I18nProvider>
        <SnackbarProvider autoHideDuration={3000}>
          <QueryClientProvider client={queryClient} >
            <App />
          </QueryClientProvider>
        </SnackbarProvider>
      </I18nProvider>
    </StrictMode>
  );
}
