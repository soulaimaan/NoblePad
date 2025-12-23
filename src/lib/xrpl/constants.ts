export const XRPL_TOKENS = {
  BELGRAVE: {
    issuer: 'rMU2jwW88fdwSvRQmPr6CWJtg3xW31SuEG',
    currency: 'BELGRAVE',
    currencyHex: '42454C4752415645000000000000000000000000'
  }
} as const;

export const XRPL_NETWORKS = {
  MAINNET: 'https://s1.ripple.com:51234/',
  TESTNET: 'https://s.altnet.rippletest.net:51234/'
} as const;
