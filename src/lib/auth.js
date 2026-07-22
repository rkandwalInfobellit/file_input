import Cookies from "js-cookie";
import LZString from "lz-string";
import AuthService from "@/services/auth.service";

const COOKIE_OPTIONS = {
  // expires: 1,
  // domain: "amd.com",
  // secure: true,
  // sameSite: "strict",
};

const COOKIE_KEYS = [
  "access_token",
  "jwt_token",
  "email",
  "domain",
  "first_name",
  "last_name",
  "username",
  "IFG_role",
  "IFG_role_id",
  "IFG_features",
  "application",
];

export function isAuthenticated() {
  return !!Cookies.get("access_token");
}

export function getUser() {
  return {
    email: Cookies.get("email") || "",
    firstName: Cookies.get("first_name") || "",
    lastName: Cookies.get("last_name") || "",
    username: Cookies.get("username") || "",
  };
}

export async function loginWithCredentials(email, password) {
  return AuthService.login(email, password);
}

export async function fetchUserInfo(jwtToken) {
  return AuthService.getUserToken(jwtToken);
}

export function setAuthCookies(jwtToken, userInfo) {
  // API returns no accessToken field — use jwtToken as the session token
  const appFeatures = userInfo?.FeaturesData?.IFG ?? {};
  const appFeatureData = appFeatures?.features ?? [];

  Cookies.set("jwt_token", jwtToken, COOKIE_OPTIONS);
  Cookies.set("access_token", jwtToken, COOKIE_OPTIONS);
  Cookies.set("email", userInfo?.UserData?.userEmail, COOKIE_OPTIONS);
  Cookies.set("first_name", userInfo?.UserData?.firstName, COOKIE_OPTIONS);
  Cookies.set("last_name", userInfo?.UserData?.lastName, COOKIE_OPTIONS);
  Cookies.set("username", userInfo?.UserData?.userEmail, COOKIE_OPTIONS);
  Cookies.set("domain", userInfo?.UserData?.org, COOKIE_OPTIONS);
  Cookies.set(
    "IFG_role_id",
    String(appFeatures?.role_id ?? ""),
    COOKIE_OPTIONS,
  );
  Cookies.set("application", "IFG", COOKIE_OPTIONS);
  Cookies.set("IFG_role", appFeatures?.role_name, COOKIE_OPTIONS);

  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(appFeatureData));
  Cookies.set("IFG_features", compressed, COOKIE_OPTIONS);
}

export function getFeatureData() {
  const compressed = Cookies.get("IFG_features");
  if (!compressed) return [];
  const json = LZString.decompressFromEncodedURIComponent(compressed);
  return json ? JSON.parse(json) : [];
}

export function logout() {
  COOKIE_KEYS.forEach((key) => Cookies.remove(key, { domain: "amd.com" }));
  window.location.href = import.meta.env.VITE_LOGOUT_URL;
}
