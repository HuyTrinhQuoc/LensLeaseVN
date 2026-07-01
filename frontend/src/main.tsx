import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import AppRoutes from "./routes";
import { CartProvider } from "./context/CartContext";
import { Provider } from 'react-redux';
import { store } from './store/store';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
    <Provider store={store}>
      <CartProvider>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 5000 }}
        />
        <AppRoutes />
      </CartProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>
);