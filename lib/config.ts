/**
 * Application configuration
 */

export const config = {
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
    timeout: 10000,
  },
  auth: {
    tokenKey: "auth_token",
  },
} as const;

export default config;
