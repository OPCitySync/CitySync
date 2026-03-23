"use client";

import { useEffect } from "react";
import { useAccount, useSignerStatus } from "@account-kit/react";
import { useRouter } from "next/navigation";
import { LoginScreen } from "../_components/LoginScreen";

export default function DemoLoginPage() {
  const router = useRouter();
  const { address } = useAccount({ type: "ModularAccountV2" });
  const { isAuthenticating } = useSignerStatus();

  useEffect(() => {
    if (address && !isAuthenticating) {
      router.replace("/demo/landing");
    }
  }, [address, isAuthenticating, router]);

  return <LoginScreen />;
}
