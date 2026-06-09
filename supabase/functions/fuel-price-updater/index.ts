export default async function handler(req: Request): Promise<Response> {
  const todayPrices = [36.9, 37.4, 36.7]
  const effectiveDieselPrice = Math.ceil(Math.max(...todayPrices))

  return new Response(JSON.stringify({
    source: 'mocked-initial-edge-function',
    effectiveDieselPrice,
    currency: 'GTQ'
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
