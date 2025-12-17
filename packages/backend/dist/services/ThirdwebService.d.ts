export interface DeployTokenParams {
    name: string;
    symbol: string;
    totalSupply: string;
    decimals: number;
    chainId: number;
}
export interface DeployPresaleParams {
    tokenAddress: string;
    softCap: string;
    hardCap: string;
    presaleRate: string;
    listingRate: string;
    liquidityPercentage: number;
    startTime: Date;
    endTime: Date;
    chainId: number;
}
export declare class ThirdwebService {
    deployToken(params: DeployTokenParams): Promise<string>;
    deployPresale(params: DeployPresaleParams): Promise<string>;
}
//# sourceMappingURL=ThirdwebService.d.ts.map