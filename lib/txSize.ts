// Node's verbose getblock returns no per-tx size or raw hex; derive it from
// structure. P2DL components are fixed-size (3309B sig + 1952B pubkey), so
// this is exact for standard txs: 1-in/2-out = 5410 bytes (verified live).
const TX_OVERHEAD = 10
const P2DL_INPUT = 5310
const COINBASE_INPUT = 46
const OUTPUT = 45

export function estimateTxSize(vinCount: number, voutCount: number, isCoinbase: boolean): number {
  const inputs = isCoinbase ? COINBASE_INPUT : vinCount * P2DL_INPUT
  return TX_OVERHEAD + inputs + voutCount * OUTPUT
}
