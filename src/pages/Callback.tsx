/**
 * Auth0 Callback Page
 *
 * This page handles the redirect from Auth0 after authentication.
 * It processes the authentication code and state parameters,
 * then redirects to the appropriate page.
 */

import { type FC, useEffect, useState } from "react";
import { Spin, Result, Button, Alert } from "antd";
import { useNavigate } from "react-router";
import { getAuth0Client, isAuth0Enabled } from "../app/auth0Client";
import "./callback.css";

export const CallbackPage: FC<{ navigateDelay?: number }> = ({ navigateDelay = 1000 }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const handleCallback = async (): Promise<void> => {
      try {
        console.warn("[Callback] ====== CALLBACK PAGE LOADED ======");
        console.warn("[Callback] Current URL:", window.location.href);
        console.warn("[Callback] Search params:", window.location.search);
        console.warn("[Callback] Auth0 enabled:", isAuth0Enabled());

        // Check if we have code and state params
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = urlParams.get("state");
        console.warn("[Callback] Has code:", code != null);
        console.warn("[Callback] Has state:", state != null);

        // Process the Auth0 callback
        const client = await getAuth0Client();

        // Force token retrieval to ensure cache is hydrated (prevents looping back to /login)
        try {
          await client.getTokenSilently();
        } catch (tokenErr) {
          console.warn(
            "[Callback] getTokenSilently failed (may still be authenticated):",
            tokenErr
          );
        }

        // Verify authentication succeeded
        const isAuth = await client.isAuthenticated();
        console.warn("[Callback] Auth0 client initialized, isAuthenticated:", isAuth);

        if (isAuth) {
          const user = await client.getUser();
          console.warn("[Callback] User authenticated:", user?.email);

          setStatus("success");

          // Navigate within the SPA to avoid losing in-memory auth cache
          // (localstorage cache also survives, but this prevents edge cases on 127.0.0.1 / ::1)
          setTimeout(() => {
            void navigate("/", { replace: true });
          }, navigateDelay);
        } else {
          // Auth0 callback didn't authenticate - redirect to login
          console.warn("[Callback] Not authenticated after callback, redirecting to login");
          void navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error("[Callback] Error handling Auth0 callback:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";

        // Handle "Invalid state" error - common when OAuth state is stale
        if (errorMessage.includes("Invalid state")) {
          console.warn(
            "[Callback] Invalid state detected - clearing Auth0 cache and redirecting to login"
          );

          // Clear Auth0 cached state from localStorage
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key != null && (key.startsWith("@@auth0spajs@@") || key.startsWith("a0.spajs"))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((key) => localStorage.removeItem(key));

          // Clear URL params and redirect to login
          window.history.replaceState({}, document.title, "/login");
          void navigate("/login", { replace: true });
          return;
        }

        setError(errorMessage);
        setStatus("error");
      }
    };

    void handleCallback();
  }, [navigate, navigateDelay]);

  if (status === "error") {
    return (
      <div className="callback-center">
        <Result
          status="error"
          title="Authentication Failed"
          subTitle={
            <div>
              <p>There was an error completing your authentication.</p>
              <Alert
                message="Error Details"
                description={error ?? "Unknown error"}
                type="error"
                className="callback-alert-margin"
              />
              <p className="callback-muted-paragraph">
                Check the browser console for more details.
              </p>
            </div>
          }
          extra={[
            <Button
              type="primary"
              key="login"
              onClick={() => {
                void navigate("/login");
              }}
            >
              Back to Login
            </Button>,
            <Button key="retry" onClick={() => window.location.reload()}>
              Try Again
            </Button>,
          ]}
        />
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="callback-center">
        <Result
          status="success"
          title="Login Successful!"
          subTitle="Redirecting you to the application..."
        />
      </div>
    );
  }

  return (
    <div className="callback-center">
      <Result
        icon={<Spin size="large" />}
        title="Logging in..."
        subTitle={
          <div>
            <p>Please wait while we complete your authentication.</p>
            <p className="callback-subtext">
              If this takes too long, check the browser console for errors.
            </p>
          </div>
        }
      />
    </div>
  );
};

export default CallbackPage;
