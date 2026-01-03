type TokenProps = {
  name: string;
  code: string;
  img: string;
  address: `0x${string}` | undefined;
  decimal: number;
};

export const tokens: TokenProps[] = [
  {
    name: "Ethereum",
    code: "ETH",
    img: "https://basescan.org/assets/base/images/svg/logos/token-light.svg?v=25.10.3.0",
    address: undefined,
    decimal: 18,
  },
  {
    name: "Aave Token",
    code: "AAVE",
    img: "https://basescan.org/token/images/aave_32.svg",
    address: "0x63706e401c06ac8513145b7687A14804d17f814b",
    decimal: 6,
  },
  {
    name: "USDC Coin",
    code: "USDC",
    img: "https://imagedelivery.net/cBNDGgkrsEA-b_ixIp9SkQ/usdc.png/public",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimal: 6,
  },
  {
    name: "Wrapped ETH",
    code: "WETH",
    img: "https://basescan.org/token/images/weth_28.png",
    address: "0x4200000000000000000000000000000000000006",
    decimal: 18,
  },
  {
    name: "Dai Stablecoin",
    code: "DAI",
    img: "https://basescan.org/token/images/daistablecoin_32.png",
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    decimal: 18,
  },
  {
    name: "Zora",
    code: "ZORA",
    img: "https://basescan.org/token/images/zora_64.png",
    address: "0x1111111111166b7FE7bd91427724B487980aFc69",
    decimal: 18,
  },
  {
    name: "Pendle",
    code: "PENDLE",
    img: "https://basescan.org/token/images/pendlefin_32.png",
    address: "0xA99F6e6785Da0F5d6fB42495Fe424BCE029Eeb3E",
    decimal: 18,
  },
];
