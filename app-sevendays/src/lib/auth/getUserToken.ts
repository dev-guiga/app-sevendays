export function getUserToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("token");
}
