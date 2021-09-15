## prePO Frontend Code Challenge

### Specification

- User can connect their MetaMask wallet
- App shows the current Uniswap V2 price for the [ETH/DAI](https://www.notion.so/5ab1ea89e8196811f51a7b7ade33eb11) trading pair
- App shows user balance for tokens in the trading pair
- User can submit a transaction to 'market buy' (buy at the current market price) ETH using a specified amount of DAI
    - You can assume slippage is fixed at 0.5%
- App updates in real-time
- Built using `TypeScript` and `React`
- The repo should include a README as if it was for a production application.

### Prerequisites
- node( > v14 )
- metamask


### Install
```
git clone git@github.com:dezine2dev/wallet-connect.git
cd your-project/
yarn install
```

### Run

```
yarn start
```

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### Running Test

```
yarn test
```

Launches the test runner in the interactive watch mode.\


### Build

```
yarn build
```

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!
