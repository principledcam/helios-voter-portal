import Cookies from "js-cookie";

export const auth = {
  login: (token: string) => {
    Cookies.set("token", token);
  },

  logout: () => {
    Cookies.remove("token");
  },

  getToken: () => {
    return Cookies.get("token");
  },

  isAuthenticated: () => {
    return !!Cookies.get("token");
  },
};
