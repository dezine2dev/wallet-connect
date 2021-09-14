import {
  ChainId,
  Token,
  Fetcher,
  WETH,
  Pair,
  Route,
  Price,
  Percent,
  TokenAmount,
  TradeType,
  Trade,
  BigintIsh,
} from '@uniswap/sdk';
import Web3 from 'web3';
import IUniswapV2Router02 from '@uniswap/v2-periphery/build/IUniswapV2Router02.json';
import ERC20 from '@uniswap/v2-core/build/ERC20.json';
import { AbiItem } from 'web3-utils';
import BigNumber from 'bignumber.js';

interface ChainConfigInterface {
  DAI: string;
  ROUTER: string;
}

export const GAS_LIMIT = 4700000;

export const CONFIG: Record<number, ChainConfigInterface> = {
  [ChainId.RINKEBY]: {
    DAI: '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735',
    ROUTER: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  },
  [ChainId.ROPSTEN]: {
    DAI: '0xaD6D458402F60fD3Bd25163575031ACDce07538D',
    ROUTER: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  },
  [ChainId.MAINNET]: {
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    ROUTER: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  },
};

export function toDecimals(amount: number | string, token: Token): BigintIsh {
  const exp = new BigNumber(10).exponentiatedBy(new BigNumber(token.decimals));
  return new BigNumber(amount).multipliedBy(exp).integerValue().toFixed();
}

export default class UniswapController {
  protected config: ChainConfigInterface;

  protected promiseDAIToken: Promise<Token> | undefined;

  protected promisePair: Promise<Pair> | undefined;

  protected slippageTolerance = new Percent('50', '1000');

  protected web3: Web3 | undefined;

  constructor(protected chainId: ChainId) {
    this.config = CONFIG[chainId || ChainId.MAINNET];
    if (!this.config) throw new Error('Unsupported ChainId!');
    this.web3 = new Web3();
  }

  async setMetaMask(ethereum: any) {
    await ethereum.request({ method: 'eth_requestAccounts' });
    this.web3 = new Web3(ethereum);
  }

  getRouterContract() {
    return new this.web3!.eth.Contract(
      IUniswapV2Router02.abi as AbiItem[],
      this.config.ROUTER,
    );
  }

  getDAITokenContract() {
    return new this.web3!.eth.Contract(ERC20.abi as AbiItem[], this.config.DAI);
  }

  getWETHToken(): Token {
    return WETH[this.chainId];
  }

  async getDAIToken(): Promise<Token> {
    if (!this.promiseDAIToken) {
      this.promiseDAIToken = Fetcher.fetchTokenData(this.chainId, this.config.DAI);
    }
    return Promise.resolve(this.promiseDAIToken);
  }

  async getPair() {
    if (!this.promisePair) {
      this.promisePair = Fetcher.fetchPairData(this.getWETHToken(), await this.getDAIToken());
    }
    return Promise.resolve(this.promisePair);
  }

  async getPrice(): Promise<Price> {
    const pair = await this.getPair();
    const route = new Route([pair], await this.getDAIToken());
    return route.midPrice;
  }

  async getTrade(amount: string): Promise<Trade> {
    const pair = await this.getPair();
    const token = await this.getDAIToken();
    const tokenAmount = new TokenAmount(token, toDecimals(amount, token));
    const route = new Route([pair], await this.getDAIToken());
    const trade = new Trade(route, tokenAmount, TradeType.EXACT_INPUT);
    return Promise.resolve(trade);
  }

  async sendTransaction(from: string, to: string, data: string) {
    const [, nonce] = await Promise.all([
      this.web3!.eth.getGasPrice(),
      this.web3!.eth.getTransactionCount(from, 'pending'),
    ]);

    return this.web3!.eth.sendTransaction({
      nonce,
      from,
      to,
      data,
      // gasPrice,
      // gas: GAS_LIMIT,
      // chainId: Number(this.chainId),
    })
      .then((receipt: any) => {
        console.log('-> receipt', receipt);
        return receipt;
      });
  }

  async getTransactionSwap(trade: Trade, account: string) {
    const amountIn = trade.inputAmount.raw.toString();
    const amountOutMin = trade.minimumAmountOut(this.slippageTolerance)
      .raw
      .toString();
    const path = [(await this.getDAIToken()).address, this.getWETHToken().address];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const contract = this.getRouterContract();
    const data = contract
      .methods
      .swapExactTokensForETH(
        amountIn,
        amountOutMin,
        path,
        account,
        deadline,
      )
      .encodeABI();

    return {
      data,
      to: contract.options.address,
      amountIn,
    };
  }

  async getTransactionApprove(uniswapAddress: string, amountIn: string) {
    const contract = this.getDAITokenContract();
    const data = contract.methods.approve(uniswapAddress, amountIn)
      .encodeABI();
    return {
      data,
      to: contract.options.address,
    };
  }

  async sendSwapExactTokensForETH(trade: Trade, account: string) {
    try {
      const swapTransaction = await this.getTransactionSwap(trade, account);
      const approveTransaction = await this.getTransactionApprove(
        swapTransaction.to, swapTransaction.amountIn,
      );
      await this.sendTransaction(account, approveTransaction.to, approveTransaction.data);
      await this.sendTransaction(account, swapTransaction.to, swapTransaction.data);
      return true;
    } catch (e: any) {
      console.error(e?.message);
    }
    return false;
  }

  async getDAIBalance(account: string): Promise<string> {
    try {
      const value = await this.getDAITokenContract()
        .methods
        .balanceOf(account)
        .call();
      const tokenAmount = new TokenAmount(await this.getDAIToken(), value);
      return tokenAmount.toSignificant(6);
    } catch (e: any) {
      console.error(e?.message);
    }
    return '0';
  }

  async getETHBalance(account: string): Promise<string> {
    try {
      const value = await this.web3!.eth.getBalance(account);
      return this.web3!.utils.fromWei(value);
    } catch (e: any) {
      console.error(e?.message);
    }
    return '0';
  }

  async getBalance(account: string): Promise<{ DAI: string, ETH: string }> {
    return Promise.all([this.getDAIBalance(account), this.getETHBalance(account)])
      .then(([DAI, ETH]) => ({
        DAI,
        ETH,
      }));
  }
}
