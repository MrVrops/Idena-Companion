# Idena Companion

This Telegram bot provides a simple interface to manage and monitor an Idena mining node. With this bot, you can check the status of your node, view your balance, mining rewards, and start/stop the mining process directly via Telegram commands.

## Prerequisites

- Node.js (version 16.x or higher)
- npm (Node Package Manager)
- A Telegram bot created via BotFather on Telegram
- A CoinMarketCap API key
- A server or local environment with an Idena node installed and configured

## Installation

1. Clone this repository on your server or local machine hosting the Idena node
2. Install project dependencies: **npm install**
3. Adapt variables in *bot.js* file:
  - **const token = 'TOKEN_TELEGRAM_BOT_HERE';** with the Telegram bot token created by Botfather 
  - **const whitelistedUserIds = [TELEGRAM_USER_ID_HERE];** with your Telegram user ID
  - **const walletAddress = 'WALLET_ADDRESS_HERE';** with your Idena wallet address
  - **'X-CMC_PRO_API_KEY': 'COINMARKETCAP_APIKEY_HERE',** with your CoinMarketCap API key
4. Launch the NodeJS project:  **node bot.js**

## Commandes

- /help - Displays the list of available commands
- /status - Checking bot operation
- /balance - Displays the current wallet balance
- /rewards - Shows mining rewards
- /node top - Displays current node status
- /node start - Starts the mining node
- /node stop - Stops the mining node

## bot.js

The opperation linked to bot.js is a set of API calls linked to the wallet and Idena rewards. If you're not interested in the part linked to the management of the mining node, you can install this bot on any machine with an Internet connection.
## nodeCommands.js

This file contains the monitoring and control operations for the Idena mining node. It works OOB with nodes installed with the default configuration via the [idena.site procedure](https://idena.site/faq_tutorials.php#openinstall-idena-node-on-vps-using-linux-pc). You're free to adapt the code if you've installed the node in another way.
