import type { NextConfig } from "next";

function remotePatternFromDomain(domain: string | undefined) {
  if (!domain) {
    return null;
  }

  const normalizedDomain = /^https?:\/\//.test(domain)
    ? domain
    : `https://${domain}`;
  const url = new URL(normalizedDomain);

  return {
    protocol: url.protocol.replace(":", "") as "http" | "https",
    hostname: url.hostname,
  };
}

const imageRemotePatterns = [
  remotePatternFromDomain(process.env.R2_PUBLIC_DOMAIN),
  remotePatternFromDomain(process.env.S3_PUBLIC_BASE_URL),
].filter((pattern): pattern is NonNullable<typeof pattern> => Boolean(pattern));

const nextConfig: NextConfig = {
  images:
    imageRemotePatterns.length > 0
      ? {
          remotePatterns: imageRemotePatterns,
        }
      : undefined,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
