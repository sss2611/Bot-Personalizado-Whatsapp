// src/utils/delay.js
const delay = async (ms, label = '') => {
    if (label) console.log(`⏳ Esperando ${ms}ms... (${label})`);
    return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = delay;
