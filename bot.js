const TelegramBot = require('node-telegram-bot-api');
const { exec } = require("child_process");
const axios = require('axios');
const path = require('path');

const token = 'TOKEN_TELEGRAM_BOT_HERE';
const whitelistedUserIds = [TELEGRAM_USER_ID_HERE];

const bot = new TelegramBot(token, {polling: true});

const idenaAPI = 'https://api.idena.io/api';
const walletAddress = 'WALLET_ADDRESS_HERE';
const coinMarketCapAPI = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';
const tokenID = '5836';
const headersCoinMarketCap = {
    'X-CMC_PRO_API_KEY': 'COINMARKETCAP_APIKEY_HERE',
    'Accept': 'application/json'
  };
const { getMiningStatus, stopMiningNode, startMiningNode } = require("./nodeCommands");

bot.on("polling_error", (error) => {
  console.error("Polling error :", error);
});

bot.on('message', (msg) => {
  const userId = msg.from.id;

  if (!whitelistedUserIds.includes(userId)) {
    bot.sendMessage(msg.chat.id, "You are not authorized to use this bot.");
    return;
  }

  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();

if (text === "/status") {
    exec("echo 'Node test successful!'", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return bot.sendMessage(chatId, `Error during command execution : ${error.message}`);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return bot.sendMessage(chatId, `Error : ${stderr}`);
      }
      bot.sendMessage(chatId, `Node status: ${stdout}`);
    });
  } else if (text === "/help") {
  const helpMessage = `🔹 *Available commands* 🔹\n\n` +
                      `🔎 /status - Checking bot operation\n` +
                      `💰 /balance - Displays the current wallet balance\n` +
                      `🎁 /rewards - Shows mining rewards\n` +
                      `📈 /node top - Displays current node status\n` +
                      `▶️ /node start - Starts the mining node\n` +
                      `⏹️ /node stop - Stops the mining node\n\n` +
                      `Use these commands to manage and monitor your Idena node via Telegram.`;
  bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
  } else if (text === "/node top") {
  console.log("Command /node top received");
    getMiningStatus((response) => {
      console.log("Reply from getMiningStatus :", response);
      bot.sendMessage(chatId, response, { parse_mode: "Markdown" });
  });
  } else if (text === "/node stop") {
    stopMiningNode((err, message) => {
      bot.sendMessage(chatId, message);
    });
  } else if (text === "/node start") {
    startMiningNode((message) => {
      bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    });
  } else if (text === "/balance") {
  axios.get(`${idenaAPI}/Address/${walletAddress}`)
    .then(responseWallet => {
      if (responseWallet.data && responseWallet.data.result) {
        const { address, balance, stake } = responseWallet.data.result;

        axios.get(`${coinMarketCapAPI}?id=${tokenID}`, { headers: headersCoinMarketCap })
          .then(responsePrix => {
            const prixToken = responsePrix.data.data[tokenID].quote.USD.price;
            const variationPrix = responsePrix.data.data[tokenID].quote.USD.percent_change_24h;
            
            const balanceTotal = parseFloat(balance) + parseFloat(stake);
            const valeurEstimee = balanceTotal * prixToken;

            let message = `💼 Wallet details for ${address}:\n` +
                          `💰 Wallet balance: ${balance} Idena\n` +
                          `🏦 Staking scale: ${stake} Idena\n` +
                          `🔢 Total Tokens: ${balanceTotal} Idena\n` +
                          `💵 Current Token price: $${prixToken.toFixed(6)} (${variationPrix > 0 ? '🟢' : '🔴'}${variationPrix.toFixed(2)}%)\n` +
                          `🏆 Estimated value: $${valeurEstimee.toFixed(2)}\n`;

            bot.sendMessage(chatId, message);
          }).catch(errorPrix => {
            console.error(`Error querying CoinMarketCap for token price : ${errorPrix}`);
            bot.sendMessage(chatId, `Error retrieving token price. Error details: ${errorPrix.message}`);
          });
      } else {
        bot.sendMessage(chatId, "No wallet information found.");
      }
    }).catch(errorWallet => {
      console.error(`Error requesting wallet details from Idena API : ${errorWallet}`);
      bot.sendMessage(chatId, `Error retrieving wallet details. Error details: ${errorWallet.message}`);
    });
  } else if (text === "/rewards") {
  axios.get(`${idenaAPI}/Address/${walletAddress}/MiningRewardSummaries?limit=100`)
    .then(response => {
      if (Array.isArray(response.data.result) && response.data.result.length > 0) {
        const totalRewards = response.data.result.reduce((acc, reward) => acc + parseFloat(reward.amount || 0), 0);

        let message = `*Total mining rewards*:\n` +
                      `💎 *Total Rewards:* ${totalRewards.toFixed(6)} Idena`;

        bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
      } else {
        bot.sendMessage(chatId, "🚫 No mining rewards found.");
      }
    })
    .catch(error => {
      console.error(`Error requesting Idena API for rewards : ${error}`);
      bot.sendMessage(chatId, `🚫 Error retrieving reward information. Error details: ${error.message}`);
    });
  } else {
    bot.sendMessage(chatId, "Sorry, I didn't understand your command.");
  }
});
