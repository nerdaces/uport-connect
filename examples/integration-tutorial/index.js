/* global Web3 globalState render */

// Setup
var web3;
const Connect = window.uportconnect
const yourAppName = 'UportTutorial'
const connect = new Connect(yourAppName, { network: 'rinkeby' })
const provider = connect.getProvider()
web3 = new Web3(provider)
// Work around to issue with web3 requiring a from parameter. This isn't actually used.
web3.eth.defaultAccount = '0xB42E70a3c6dd57003f4bFe7B06E370d21CDA8087'

const abi = [{ "constant": false, "inputs": [{ "name": "status", "type": "string" }], "name": "updateStatus", "outputs": [], "payable": false, "type": "function" }, { "constant": false, "inputs": [{ "name": "addr", "type": "address" }], "name": "getStatus", "outputs": [{ "name": "", "type": "string" }], "payable": false, "type": "function" }]
const StatusContract = web3.eth.contract(abi).at('0x70A804cCE17149deB6030039798701a38667ca3B')

const Time30Days = () => Math.floor(new Date().getTime() / 1000) + 30 * 24 * 60 * 60

const getAndRenderBlockchainState = (address) => {
  StatusContract.getStatus.call(address, (err, status) => {
    globalState.currentStatus = status
    web3.eth.getBalance(address, (err, bal) => {
      globalState.ethBalance = web3.fromWei(bal)
      render()
    })
  })
}

// If state already available in connect onload, render it
if (connect.did) {
  globalState.ethAddress = connect.address
  globalState.uportId = connect.did
  render()
  getAndRenderBlockchainState(globalState.ethAddress)
}


// uPort connect
const uportConnect = function () {
  web3.eth.getCoinbase((error, address) => {
    if (error) { throw error }
    globalState.ethAddress = address
    globalState.uportId = connect.did
    render()
    getAndRenderBlockchainState(globalState.ethAddress)
  })
}

// Send ether
const sendEther = () => {
  const value = parseFloat(globalState.sendToVal) * 1.0e18
  const txObj = { to: globalState.sendToAddr, value: value }
  web3.eth.sendTransaction(txObj, (error, txHash) => {
    if (error) { throw error }
    globalState.txHashSentEth = txHash
    render()
  })
}

// Set Status
const setStatus = () => {
  const newStatusMessage = globalState.statusInput
  StatusContract.updateStatus(newStatusMessage, (error, txHash) => {
    if (error) { throw error }
    globalState.txHashSetStatus = txHash
    render()
  })
}

// Create VC for Setting Your Info
const createVerifiedCredential = () => {
  // error check for birthdayInput (ex. length, form)
  const cred = {
    exp: Time30Days(),
    claim: {
      'Basics' : {
        name: globalState.nameInput,
        birthday: globalState.birthdayInput
      }
    },
    sub: globalState.uportId
  }
  connect.sendVerification(cred)
}

// Create VC for Adults
const createVerifiedCredentialForAdult = () => {
    // Get user's info
    const req = {
      requested: ['Basics'],
      // verified: ['Basic Information'],
      notification: true,
    }
    const reqID = 'disclosureReq'
    connect.requestDisclosure(req, reqID)
    connect.onResponse(reqID).then(cred => {
      const yourAge = calAgeFromBirthday(cred.payload.Basics.birthday)
      // Send verification
      if (yourAge >= 20) {
        const VerifiedCred = {
          exp: Time30Days(),
          // exp: 60,
          claim: { 'Adult' : { adult: true } },
          sub: globalState.uportId
        }
        connect.sendVerification(VerifiedCred)
      } else {
        console.log("Error: You are not an adult.")
      }
    })
}

// Verify your adultness
const verifyYourAdultness = () => {
  // Get user's info
  const req = {
    requested: ['Adult'],
    // verified: ['Adult'],
    notification: true,
  }
  const reqID = 'disclosureReq'
  connect.requestDisclosure(req, reqID)
  connect.onResponse(reqID).then(cred => {
    if (cred.payload.Adult.adult) {
      globalState.flagAdult = "Yes!!!"
      alert("Verification Successed: You're an Adult.")
    } else {
      globalState.flagAdult = "No!!!"
      alert("Verification Failed: You're not an Adult.")
    }
    $('#flagAdult').innerHTML = globalState.flagAdult; // fix later
  })
}

// Calculate age
const calAgeFromBirthday = (birthday) => {
  if (!birthday) {
    return -100
  }
  const yourBirthday = {
    year: birthday.slice(0, 4),
    month: birthday.slice(5, 7),
    date: birthday.slice(8, 10),
  }
  // Dateインスタンスに変換
  const birthDate = new Date(yourBirthday.year, yourBirthday.month - 1, yourBirthday.date);

  // 文字列に分解
  const y2 = birthDate.getFullYear().toString().padStart(4, '0');
  const m2 = (birthDate.getMonth() + 1).toString().padStart(2, '0');
  const d2 = birthDate.getDate().toString().padStart(2, '0');

  // 今日の日付
  const today = new Date();
  const y1 = today.getFullYear().toString().padStart(4, '0');
  const m1 = (today.getMonth() + 1).toString().padStart(2, '0');
  const d1 = today.getDate().toString().padStart(2, '0');

  // 引き算
  const age = Math.floor((Number(y1 + m1 + d1) - Number(y2 + m2 + d2)) / 10000);
  return age
}