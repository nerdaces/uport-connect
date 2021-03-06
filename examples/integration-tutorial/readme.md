# Integrating uPort into Your dApp: An Introduction

## Introduction

This tutorial will demonstrate how you can integrate uPort into your decentralized Ethereum application. Using the `uport-connect` library, we will create a simple application; this application will allow you to integrate uPort, send simple Ether transactions, and set a simple status message in a smart contract.

In this tutorial, we assume some basic familiarity with creating Ethereum applications using the `web3` library.

*Note: The examples provided inline here and in the example files, use ES6. Although our library is written in ES6, it is transpiled to ES5. Thus it’s perfectly compatible with ES5 if you prefer to use that instead. These examples are simple to change to ES5 if your needs demand it*

## Getting Started

Make sure you have the uPort application installed on your mobile device. Afterward, clone the `uport-connect` repository locally and build it using:

```sh
git clone https://github.com/uport-project/uport-connect
cd uport-connect
npm install
npm run build:dist
```

We will be working in the `uport-connect/examples/integration-tutorial` directory.

Make sure you have the uPort application installed on your mobile device.

We've provided a simple HTML file `uport_tutorial.html` that you can find [here](https://github.com/uport-project/uport-connect/tree/develop/examples/integration-tutorial). It contains a section for connecting your uPort, a section for transferring Ether from your uPort address to another address, and a section that sets a simple status message in a smart contract.

To test the dApp, all you need to do is open the `uport_tutorial.html` file in your browser. There is a file named `index.js` that will contain the JavaScript integration code that you need.

Consider the necessary code to set up the `web3` object with the uPort provider:

```js
const Connect = window.uportconnect.Connect
const appName = 'UportTutorial'
const connect = new Connect(appName, {network: 'rinkeby'})
const provider = connect.getProvider()
const web3 = new Web3(provider)
```

The uPort library sets up the web3 object using a web3 provider. This is the mechanism that interprets calls to web3 functions, and this is what will trigger the QR codes for connecting your uPort and signing transactions.

The `uportConnect()` function will trigger the "login" and populate the user's uPort address in the UI.

Load the HTML file in your browser and hit "Connect uPort". You should see a QR code appear on the screen. When you scan it with the uPort app, you should see your uPort address populated in the UI.

The functions that trigger QR codes are:

```js
web3.eth.getCoinbase() //returns your uport address
web3.eth.getAccounts() //returns your uport address in a list
web3.eth.sendTransaction(txObj) //returns a transaction hash
myContract.myMethod() //returns a transaction hash
```

The functions `getAccounts()` and `getCoinbase()` trigger the QR code that brings up the "connect" QR code; if you are already connected, the address is stored in the uPort provider object and will return without showing the QR code. Due to this behavior, we suggest that you have a place in your dApp where the user can "log in" or "connect". If you call `getCoinbase()` before it's needed (e.g., right before sending a transaction), the user experience won’t be ideal, since the user needs to scan two QR codes in rapid succession.

The functions for sending ETH and setting the status are exactly how you would write them in vanilla `web3.js`. To send ETH, you must first fetch some Rinkeby Ether at the Rinkeby faucet, available here: <https://rinkeby.io>.

Now, try sending some Rinkeby ETH and setting the status. You will see QR codes appear when it's time to sign transactions, and you use your uPort app to scan them. After sending and setting the status, you can reload the page and reconnect, to make sure the balance and status are updated.
