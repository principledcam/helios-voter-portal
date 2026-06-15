declare module "js-cookie" {
  export interface CookiesStatic {
    get(name: string): string | undefined;
    set(name: string, value: string, options?: any): void;
    remove(name: string): void;
  }

  const Cookies: CookiesStatic;
  export default Cookies;
}