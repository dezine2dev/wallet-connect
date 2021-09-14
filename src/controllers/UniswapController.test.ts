import { ChainId, Token } from '@uniswap/sdk';
import UniswapController, { toDecimals } from './UniswapController';

test('toDecimals', () => {
  const token = new Token(ChainId.ROPSTEN, '0xaD6D458402F60fD3Bd25163575031ACDce07538D', 6);

  expect(toDecimals('12.34', token))
    .toEqual('12340000');
  expect(toDecimals('12.34343434', token))
    .toEqual('12343434');
});

describe('UniswapController', () => {
  const controller = new UniswapController(ChainId.ROPSTEN);

  test('getRouterContract', () => {
    expect(controller.getRouterContract())
      .toHaveProperty('methods');
  });

  test('getDAITokenContract', () => {
    expect(controller.getDAITokenContract())
      .toHaveProperty('methods');
  });

  test('getDAIToken', async () => {
    await expect(controller.getDAIToken())
      .resolves
      .toHaveProperty('address', '0xaD6D458402F60fD3Bd25163575031ACDce07538D');
  });

  test('getPrice', async () => {
    await expect(controller.getPrice())
      .resolves
      .toHaveProperty('toSignificant');
  });

  test('getPrice', async () => {
    await expect(controller.getTrade('10'))
      .resolves
      .toHaveProperty('inputAmount');
  });

  test('getTransactionSwap', async () => {
    const trade = await controller.getTrade('10');

    await expect(controller.getTransactionSwap(trade, '0xaD6D458402F60fD3Bd25163575031ACDce07538D'))
      .resolves
      .toHaveProperty('data');
  });

  test('getDAIBalance', async () => {
    await expect(controller.getDAIBalance('0x0000000000000000000000000000000000000000'))
      .resolves
      .toBe('0');
  });

  test('getETHBalance', async () => {
    await expect(controller.getETHBalance('0x0000000000000000000000000000000000000000'))
      .resolves
      .toBe('0');
  });
});
