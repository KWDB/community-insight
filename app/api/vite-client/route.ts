export async function GET() {
  // 兼容 IDE 注入的 Vite HMR 客户端请求，返回空内容避免 404 噪声日志
  return new Response('/* noop */', { status: 200, headers: { 'Content-Type': 'application/javascript' } })
}
