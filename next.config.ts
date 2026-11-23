import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  // El PDF lee public/heart.png con fs: se incluye para que exista también en despliegues serverless
  outputFileTracingIncludes: {
    '/api/pdf/**': ['./public/heart.png']
  }
}

export default nextConfig
