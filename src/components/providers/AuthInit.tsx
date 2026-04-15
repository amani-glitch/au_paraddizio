"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export default function AuthInit() {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        else useAuthStore.getState().setLoading(false);
      })
      .catch(() => {
        useAuthStore.getState().setLoading(false);
      });
  }, [setUser]);

  return null;
}
