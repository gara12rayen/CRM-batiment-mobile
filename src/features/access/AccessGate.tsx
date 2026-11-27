import { Redirect, type Href } from "expo-router";
import type { ReactNode } from "react";
import { Loading } from "@/shared/components/Loading";
import type { Permission } from "./access.types";
import { useAccess } from "./AccessProvider";

type AccessGateProps = {
  permission: Permission;
  children: ReactNode;
};

function accessDeniedHref(code: string, permission?: string): Href {
  const params = new URLSearchParams({ code });
  if (permission) {
    params.set("permission", permission);
  }
  return `/access-denied?${params.toString()}` as Href;
}

export function AccessGate({ permission, children }: AccessGateProps) {
  const { ready, user, profile, has } = useAccess();

  if (!ready) {
    return <Loading />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!profile.canUseApp) {
    return <Redirect href={accessDeniedHref(profile.denyCode ?? "ROLE_WEB_ONLY")} />;
  }

  if (!has(permission)) {
    return <Redirect href={accessDeniedHref("MODULE_FORBIDDEN", permission)} />;
  }

  return <>{children}</>;
}
