import React, { FunctionComponent, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@material-ui/core';
import { useMetaMask } from 'metamask-react';
import { useUniswapContext } from './UniswapContext';

const WalletCard: FunctionComponent = () => {
  const {
    status,
    connect,
    account,
    ethereum,
  } = useMetaMask();
  const controller = useUniswapContext();

  const [balance, setBalance] = React.useState<{ DAI: string, ETH: string }>({
    DAI: '0',
    ETH: '0',
  });

  const updateBalance = React.useCallback(() => {
    if (!account) return;
    controller.setMetaMask(ethereum)
      .then(() => controller.getBalance(account))
      .then(setBalance);
  }, [account, ethereum, controller]);

  useEffect(() => {
    document.addEventListener('RefreshAccount', updateBalance);
    updateBalance();
    return () => {
      document.removeEventListener('RefreshAccount', updateBalance);
    };
  }, [updateBalance]);

  return (
    <Card variant="outlined">
      <CardHeader
        title={(<Typography variant="h6">Wallet</Typography>)}
        subheader={account || 'Please, connect the wallet'}
      />
      <CardContent>
        {status === 'unavailable' ? (
          <Typography>
            MetaMask not available!
          </Typography>
        ) : null}
        {status === 'connected' && account ? (
          <>
            <Typography variant="h6">Balance</Typography>
            <List>
              <ListItem>
                <ListItemText primary="ETH" />
                <ListItemSecondaryAction>
                  {balance.ETH}
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText primary="DAI" />
                <ListItemSecondaryAction>
                  {balance.DAI}
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </>
        ) : (
          <Grid container justifyContent="center" spacing={5}>
            <Grid item>
              <Button
                variant="outlined"
                color="primary"
                onClick={connect}
                disabled={status !== 'notConnected'}
              >
                {status === 'connecting' ? (
                  <>
                    <CircularProgress size={16} color="inherit" />
                    &nbsp; Connecting...
                  </>
                ) : 'Connect Wallet'}
              </Button>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletCard;
