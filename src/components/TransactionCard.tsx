import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader, CircularProgress,
  createStyles,
  InputAdornment,
  makeStyles,
  OutlinedInput,
  Theme,
  Typography,
} from '@material-ui/core';
import { useMetaMask } from 'metamask-react';
import { Trade } from '@uniswap/sdk';
import { useUniswapContext } from './UniswapContext';

const useStyles = makeStyles((theme: Theme) => createStyles({
  margin: {
    marginBottom: theme.spacing(3),
  },
}));

const INPUT_PATTERN = /^[0-9]*[.,]?[0-9]*$/i;

const TransactionCard: FunctionComponent = () => {
  const classes = useStyles();
  const metaMask = useMetaMask();
  const controller = useUniswapContext();

  const [daiAmount, setDaiAmount] = useState('');
  const [ethAmount, setEthAmount] = useState('');
  const [trade, setTrade] = useState<Trade | undefined>(undefined);
  const [price, setPrice] = useState<string | undefined>(undefined);
  const [swap, setSwap] = useState(false);

  useEffect(() => {
    controller.getPrice()
      .then((midPrice) => setPrice(midPrice.toSignificant(6)));
  }, [controller]);

  useEffect(() => {
    if (!daiAmount) {
      setEthAmount('');
      return;
    }
    controller.getTrade(daiAmount)
      .then((value) => {
        setTrade(value);
        setEthAmount(value.outputAmount.toSignificant(6));
      });
  }, [controller, daiAmount]);

  const onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event?.target?.value;
    setDaiAmount((prev) => (INPUT_PATTERN.test(value) ? value : prev));
  };

  const onSubmit = async () => {
    if (!trade || !metaMask.account) return;
    setSwap(true);
    await controller.sendSwapExactTokensForETH(trade, metaMask.account);
    setTrade(undefined);
    setDaiAmount('');
    setEthAmount('');
    setSwap(false);
    document.dispatchEvent(new Event('RefreshAccount'));
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title={(<Typography variant="h6">Transaction</Typography>)}
        subheader={price ? `Price: 1 DAI = ${price} ETH` : '...'}
      />
      <CardContent>
        <OutlinedInput
          className={classes.margin}
          id="dai-amount"
          name="daiAmount"
          startAdornment={<InputAdornment position="start">DAI</InputAdornment>}
          fullWidth
          autoComplete="off"
          autoCorrect="off"
          placeholder="0.0"
          onInput={onInput}
          value={daiAmount}
          disabled={!metaMask.ethereum || swap}
        />
        <OutlinedInput
          className={classes.margin}
          id="eth-amount"
          startAdornment={<InputAdornment position="start">ETH</InputAdornment>}
          fullWidth
          readOnly
          placeholder="0.0"
          value={ethAmount}
          disabled={!metaMask.ethereum || swap}
        />
        <Button
          variant="contained"
          disabled={!trade || !metaMask.ethereum || swap}
          onClick={onSubmit}
        >
          {swap && (
            <>
              <CircularProgress size={16} color="inherit" />
              &nbsp;
            </>
          )}
          Submit
        </Button>
      </CardContent>
    </Card>
  );
};

export default TransactionCard;
