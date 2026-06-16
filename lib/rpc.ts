const NODES = [
  {
    url: process.env.SEED1_URL ?? 'http://127.0.0.1:18331',
    cookie: process.env.SEED1_COOKIE ?? '',
  },
  {
    url: process.env.SEED4_URL ?? 'http://127.0.0.1:18332',
    cookie: process.env.SEED4_COOKIE ?? '',
  },
]

async function rpcCallNode(
  node: { url: string; cookie: string },
  method: string,
  params: unknown[] = []
): Promise<unknown> {
  const auth = Buffer.from(node.cookie).toString('base64')
  const res = await fetch(node.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`RPC HTTP ${res.status} from ${node.url}`)
  }

  const json = (await res.json()) as { result?: unknown; error?: { message: string } }
  if (json.error) throw new Error(json.error.message)
  return json.result
}

export async function rpcCall(method: string, params: unknown[] = []): Promise<unknown> {
  for (const node of NODES) {
    try {
      return await rpcCallNode(node, method, params)
    } catch {}
  }
  throw new Error(`All nodes unreachable for method: ${method}`)
}

export async function rpcCallAll(
  method: string,
  params: unknown[] = []
): Promise<(unknown | null)[]> {
  return Promise.all(
    NODES.map((node) => rpcCallNode(node, method, params).catch(() => null))
  )
}

export async function rpcBatch(
  calls: { method: string; params?: unknown[] }[]
): Promise<unknown[]> {
  const body = calls.map((c, i) => ({
    jsonrpc: '2.0',
    method: c.method,
    params: c.params ?? [],
    id: i,
  }))

  for (const node of NODES) {
    try {
      const auth = Buffer.from(node.cookie).toString('base64')
      const res = await fetch(node.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const results = (await res.json()) as { result?: unknown; id: number }[]
      return results.sort((a, b) => (a.id as number) - (b.id as number)).map((r) => r.result)
    } catch {}
  }
  throw new Error('All nodes unreachable for batch call')
}
