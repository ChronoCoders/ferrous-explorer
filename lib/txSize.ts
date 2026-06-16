const TX_OVERHEAD = 10
const P2DL_INPUT = 5310
const COINBASE_INPUT = 46
const OUTPUT = 45

export function estimateTxSize(vinCount: number, voutCount: number, isCoinbase: boolean): number {
  const inputs = isCoinbase ? COINBASE_INPUT : vinCount * P2DL_INPUT
  return TX_OVERHEAD + inputs + voutCount * OUTPUT
}
