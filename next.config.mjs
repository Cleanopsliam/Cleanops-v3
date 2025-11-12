/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    authInterrupts: false, // 🔴 turn this OFF while we debug cookies
  },
}

export default nextConfig