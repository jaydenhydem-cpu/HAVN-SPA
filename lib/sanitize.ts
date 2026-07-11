import xss, { type IFilterXSSOptions } from "xss";

/** Strip ALL html — forms carry prose, never markup. */
const xssOptions: IFilterXSSOptions = {
  whiteList: {},
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style"],
};

export const sanitize = (input: string): string => {
  if (!input || typeof input !== "string") return "";
  return xss(input.trim(), xssOptions);
};

/** Recursively sanitize every string in an object (arrays included). */
export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      out[key] = sanitize(value);
    } else if (Array.isArray(value)) {
      out[key] = value.map((item) => (typeof item === "string" ? sanitize(item) : item));
    } else if (value !== null && typeof value === "object") {
      out[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out as T;
};

export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== "string") return "";
  return email.trim().toLowerCase();
};
