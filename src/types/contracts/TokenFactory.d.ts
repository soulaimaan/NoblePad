import { ethers } from 'ethers'

declare module 'TokenFactory' {
  export interface TokenInfo {
    tokenAddress: string
    creator: string
    name: string
    symbol: string
    totalSupply: bigint
    createdAt: bigint
    isActive: boolean
  }

  // Helper type for contract methods
  type ContractMethod<TArgs extends any[] = any[], TReturn = any> = {
    (...args: TArgs): Promise<TReturn>
    populateTransaction(...args: TArgs): Promise<ethers.ContractTransaction>
    staticCall(...args: TArgs): Promise<TReturn>
    send(...args: TArgs): Promise<ethers.ContractTransactionResponse>
    estimateGas(...args: TArgs): Promise<bigint>
  }

  export interface TokenFactory extends ethers.BaseContract {
    // State variables
    creatorTokens: ContractMethod<[string, bigint], string>
    tokenDetails: ContractMethod<[string], TokenInfo>
    allTokens: ContractMethod<[bigint], string>
    creationFee: ContractMethod<[], bigint>
    MAX_SUPPLY: ContractMethod<[], bigint>
    
    // Events
    filters: {
      'TokenCreated(string,string,uint256)': ethers.EventFragment
      'TokenCreated(address,address,string,string,uint256)': ethers.EventFragment
      'CreationFeeUpdated(uint256,uint256)': ethers.EventFragment
    }
    
    // Write Functions
    createToken: ContractMethod<[string, string, bigint], ethers.ContractTransactionResponse, { value?: bigint }>
    setCreationFee: ContractMethod<[bigint], ethers.ContractTransactionResponse>
    pause: ContractMethod<[], ethers.ContractTransactionResponse>
    unpause: ContractMethod<[], ethers.ContractTransactionResponse>
    
    // Read Functions
    getCreatorTokenCount: ContractMethod<[string], bigint>
    getAllTokens: ContractMethod<[], string[]>
    getTokenByIndex: ContractMethod<[bigint], string>
    
    // View Functions
    isTokenActive: ContractMethod<[string], boolean>
    getTokenInfo: ContractMethod<[string], TokenInfo>
    
    // Event handlers
    on(event: 'TokenCreated', listener: (
      tokenAddress: string,
      creator: string,
      name: string,
      symbol: string,
      totalSupply: bigint,
      event: ethers.EventLog
    ) => void): this
    
    on(event: 'CreationFeeUpdated', listener: (
      oldFee: bigint,
      newFee: bigint,
      event: ethers.EventLog
    ) => void): this
    
    // Event filtering
    queryFilter: {
      <TEvent extends ethers.EventLog>(
        event: ethers.EventFragment | string | ethers.Filter | ethers.FilterByBlockTag,
        fromBlock?: ethers.BlockTag,
        toBlock?: ethers.BlockTag
      ): Promise<Array<TEvent>>
      
      (
        event: string,
        fromBlock?: ethers.BlockTag,
        toBlock?: ethers.BlockTag
      ): Promise<Array<ethers.EventLog>>
    }
  }
  
  export interface TokenFactory__factory {
    connect(
      address: string,
      signerOrProvider: ethers.Signer | ethers.Provider
    ): TokenFactory
    
    createInterface(): ethers.Interface
    
    create(
      signer?: ethers.Signer
    ): Promise<TokenFactory>
    
    getContract(
      address: string,
      signer?: ethers.Signer | ethers.Provider
    ): TokenFactory
    
    getContractAddress(transaction: { from: string; nonce: bigint | number | string }): string
    
    readonly bytecode: string
    readonly abi: readonly any[]
    
    static createInterface(): ethers.Interface
    
    static connect(
      address: string,
      signerOrProvider: ethers.Signer | ethers.Provider
    ): TokenFactory
  }
}
