const { exec } = require("child_process");
const fs = require('fs');
const path = require('path');

const formatElapsedTime = (etime) => {
    let days = 0, hours = 0, minutes = 0, seconds = 0;

    if (etime.includes("-")) {
        let [d, time] = etime.split("-");
        days = parseInt(d, 10);
        [hours, minutes, seconds] = time.split(":").map(num => parseInt(num, 10));
    } else {
        const parts = etime.split(":").map(num => parseInt(num, 10));
        if (parts.length === 3) {
            [hours, minutes, seconds] = parts;
        } else if (parts.length === 2) {
            [minutes, seconds] = parts;
        } else if (parts.length === 1) {
            [seconds] = parts;
        }
    }

    let formatted = "";
    if (days > 0) formatted += `${days} jours, `;
    if (hours > 0 || days > 0) formatted += `${hours} heures, `;
    formatted += `${minutes} minutes, ${seconds} secondes`;

    return formatted;
};

const getMiningStatus = (callback) => {
  exec("pgrep -f idena-node", (pgrepError, pgrepStdout, pgrepStderr) => {
    if (pgrepError || pgrepStderr || !pgrepStdout.trim()) {
      console.error(`PID search error : ${pgrepError || pgrepStderr}`);
      const responseNotFound = `⚠️ *Idena Node Status:*\n` +
                               `• ❌ *Process Status:* Not running\n`;
      return callback(responseNotFound);
    }

    const pid = pgrepStdout.trim().split('\n')[0];
    exec(`ps -p ${pid} -o pid,pcpu,pmem,etime,cmd --no-headers`, (psError, psStdout, psStderr) => {
      if (psError || psStderr || !psStdout.trim()) {
        const responseNotFound = `⚠️ *Idena Node Status:*\n` +
                                 `• ❌ *Process Status:* Not running\n`;
        return callback(responseNotFound);
      }

      const parts = psStdout.trim().split(/\s+/);
      const cpuUsage = parts[1];
      const memUsage = parts[2];

      const responseFound = `🚀 *Idena Node Status:*\n` +
                            `• *PID:* ${pid}\n` +
                            `• *CPU Usage:* ${cpuUsage}%\n` +
                            `• *Memory Usage:* ${memUsage}%\n` +
                            `• ✅ *Process Status:* Up\n`;

      callback(responseFound);
    });
  });
};

const stopMiningNode = (callback) => {
  const cmd = '/root/idena-manager disable node 1';

  exec(cmd, (error, stdout, stderr) => {
    callback(null, "Stop signal sent to mining node 🛑✨. Wait a moment for shutdown confirmation.");
  });
};

const startMiningNode = (callback) => {
  const cmdEnable = '/root/idena-manager enable node 1';
  exec(cmdEnable, (error, stdout, stderr) => {
    callback("Node start signal sent 🚀. Please use `/node top` to check the status.");
  });
};

module.exports = { getMiningStatus, stopMiningNode, startMiningNode };
