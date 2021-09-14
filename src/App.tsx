import React from 'react';
import {
  AppBar,
  Container,
  createStyles,
  Grid,
  makeStyles,
  Theme,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { ChainId } from '@uniswap/sdk';
import { MetaMaskProvider } from 'metamask-react';
import WalletCard from './components/WalletCard';
import TransactionCard from './components/TransactionCard';
import { UniswapProvider } from './components/UniswapContext';

const useStyles = makeStyles((theme: Theme) => createStyles({
  container: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
  },
}));

const App: React.FunctionComponent = () => {
  const classes = useStyles();
  return (
    <MetaMaskProvider>
      <AppBar position="static">
        <Container maxWidth="lg" disableGutters>
          <Toolbar>
            <Typography variant="h6">ETH/DAI</Typography>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="lg" className={classes.container}>
        <UniswapProvider chainId={ChainId.ROPSTEN}>
          <Grid container spacing={5}>
            <Grid item xs={6}>
              <WalletCard />
            </Grid>
            <Grid item xs={6}>
              <TransactionCard />
            </Grid>
          </Grid>
        </UniswapProvider>
      </Container>
    </MetaMaskProvider>
  );
};

export default App;
