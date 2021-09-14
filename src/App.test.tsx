import { render, screen } from '@testing-library/react';
import App from './App';

test('renders react app', async () => {
  render(<App />);
  const headElement = await screen.getByText(/ETH\/DAI/i);
  expect(headElement)
    .toBeInTheDocument();
  const walletElement = await screen.getByText(/Connect Wallet/i);
  expect(walletElement)
    .toBeInTheDocument();
  const transactionElement = await screen.getByText(/Transaction/i);
  expect(transactionElement)
    .toBeInTheDocument();
});
