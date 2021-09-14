import React, { FunctionComponent } from 'react';
import { ChainId } from '@uniswap/sdk';
import UniswapController from '../controllers/UniswapController';

export const UniswapContext = React.createContext<UniswapController | undefined>(undefined);

export const useUniswapContext = () => {
  const context = React.useContext(UniswapContext);
  if (!context) throw new Error('');
  return context;
};

interface UniswapProviderProps {
  chainId: ChainId | string | null;
  children: React.ReactNode,
}

export const UniswapProvider: FunctionComponent<UniswapProviderProps> = (props) => {
  const {
    chainId,
    children,
  } = props;
  const value: UniswapController = React.useMemo(
    () => new UniswapController(chainId as ChainId),
    [chainId],
  );

  return (
    <UniswapContext.Provider value={value}>
      {children}
    </UniswapContext.Provider>
  );
};
