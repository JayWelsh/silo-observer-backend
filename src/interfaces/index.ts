// Subgraph Interfaces Below

export interface ITokenSubgraph {
  symbol: string
  id: string
  decimals: number
}

export interface IRateEntrySubgraph {
  rate: number
  side: string
  type: "BORROWER" | "LENDER"
  token: ITokenSubgraph
}

// Subgraph Interfaces Above

// -------------------------

// Internal Interfaces Below

export interface IToken {
  address: string
  symbol: string
  decimals: number
}

export interface IRate {
  rate: number
  side: string
  timestamp: string
  silo_address: string
  asset_address: string
  type: string
}

// Internal Interfaces Above