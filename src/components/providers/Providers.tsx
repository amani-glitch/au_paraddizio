"use client";

import { Toaster } from "react-hot-toast";
import AuthInit from "./AuthInit";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthInit />
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#FFF8F0",
            color: "#6B3A2A",
            border: "1px solid #e5e7eb",
            borderRadius: "0.75rem",
            fontSize: "0.875rem",
          },
          success: {
            iconTheme: {
              primary: "#2D5F2D",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#C41E24",
              secondary: "#fff",
            },
          },
        }}
      />
    </>
  );
}
