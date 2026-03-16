import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Disable double-mount in dev — otherwise React StrictMode opens two WebSocket
  // connections per player, causing the room to be temporarily empty and missing debate_ready
  reactStrictMode: false,
};

export default nextConfig;
