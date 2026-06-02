export interface ChainInfo {
  height: number
  bestblockhash: string
  hashrate: number
  difficulty: number
  connections: number
  nodes_online: number
  chain: string
  avg_block_time: number
  supply_frr: number
  blocks_to_halving: number
  epoch: number
  epoch_progress: number
  total_txs: number
  avg_fee_sats: number
  estimated_adjustment: number
  block_time_target: number
}

export interface NodeInfo {
  id: string
  name: string
  location: string
  lat: number
  lon: number
  height: number
  hashrate: number
  peers: number
  online: boolean
}

export interface BlockSummary {
  height: number
  hash: string
  timestamp: number
  txCount: number
  size: number
  miner: string
  difficulty: number
}

export interface TxInput {
  txid: string
  vout: number
  scriptSig: string
  isCoinbase: boolean
  address?: string
  amount?: number
}

export interface TxOutput {
  n: number
  address: string
  amount: number
  scriptPubkey: string
}

export interface Transaction {
  txid: string
  version: number
  inputs: TxInput[]
  outputs: TxOutput[]
  size: number
  isCoinbase: boolean
  totalOut: number
  fee?: number
  blockHash?: string
  blockHeight?: number
  confirmations?: number
  timestamp?: number
}

export interface Block {
  hash: string
  height: number
  timestamp: number
  nBits: string
  nonce: number
  merkleRoot: string
  prevHash: string
  size: number
  txCount: number
  miner: string
  difficulty: number
  transactions: Transaction[]
}

export interface UtxoEntry {
  txid: string
  vout: number
  amount: number
  height: number
  confirmations: number
  coinbase: boolean
  scriptPubkey: string
  spendable: boolean
}

export interface AddressInfo {
  address: string
  balance: number
  utxoCount: number
  utxos: UtxoEntry[]
}

export interface MempoolTx {
  txid: string
  size: number
  vsize: number
  vinCount: number
  voutCount: number
  outputValue: number // total output value in frsats
}

export interface MempoolInfo {
  count: number
  totalSize: number
  transactions: MempoolTx[]
}
