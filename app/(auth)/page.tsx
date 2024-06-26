"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { siteKey } from "@/lib/hcaptcha";
import { useUserStore } from "@/lib/stores/user";
import { supabase } from "@/lib/supabaseClient";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Login() {
  const { replace } = useRouter();
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef<HCaptcha>(null);
  const { userId } = useUserStore();

  const handleGoogleSignIn = async () =>
    supabase.auth.signInWithOAuth({ provider: "google" });
  const handleGuestSignIn = () => {
    captchaRef.current?.execute();
  };

  useEffect(() => {
    if (userId) replace("/home");
  }, [userId, replace]);

  useEffect(() => {
    if (captchaToken) {
      captchaRef.current?.resetCaptcha();
      supabase.auth.signInAnonymously({ options: { captchaToken } });
    }
  }, [captchaToken]);

  return (
    <>
      <HCaptcha
        sitekey={siteKey}
        size="invisible"
        onVerify={setCaptchaToken}
        ref={captchaRef}
      />
      <main className="flex min-h-dvh w-full flex-row-reverse">
        <div className="flex min-w-[45vw] flex-col justify-center p-4">
          <div className="w-full p-5">
            <div className="my-12">
              <span className="text-5xl font-bold">Happening now</span>
            </div>
            <div className="mb-8">
              <span className="text-2xl font-bold">Join today.</span>
            </div>
            <div className="flex w-[300px] flex-col">
              <Button onClick={handleGoogleSignIn}>Sign in with Google</Button>
              <div className="my-2 flex items-center">
                <Separator className="mr-1 flex-1" />
                <div className="mx-1">or</div>
                <Separator className="ml-1 flex-1" />
              </div>
              <Button variant="outline" onClick={handleGuestSignIn}>
                Continue as guest
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-gradient-to-r from-blue-500 to-white"></div>
      </main>
    </>
  );
}
