/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
          {
            source: '/assets/:path*', // Rota que será acessada no navegador
            destination: '/app/game/assets/:path*', // Caminho real dos arquivos no sistema
          },
        ];
      },
};

export default nextConfig;
