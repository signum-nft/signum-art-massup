import { config } from "dotenv";

config();

const getContext = () => {
  return {
    config: {
      nodeHost: process.env.OUT_FILE_JSON,
      account: process.env.TARGET_ACCOUNT,
      passphrase: process.env.TARGET_ACCOUNT_PASSPHRASE,
      filter: {
        amount: parseInt(process.env.TX_FILTER_MIN_AMOUNT || "0", 10),
        messagePattern: process.env.TX_FILTER_MESSAGE_PATTERN,
        maxTransactions: parseInt(
          process.env.TX_FILTER_MAX_TRANSACTIONS || "500",
          10
        ),
      },
    },
  };
};

module.exports = {
  getContext,
};
