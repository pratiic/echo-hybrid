/** @type {import('next').NextConfig} */
const nextConfig = {
    // reactStrictMode: true,
    // async rewrites() {
    //     return [
    //         {
    //             source: "/api/:path*",
    //             destination: "http://localhost:8000/api/:path*",
    //         },
    //     ];
    // },
    images: {
        domains: ["localhost", "avatars.dicebear.com"],
    },
};

module.exports = nextConfig;
