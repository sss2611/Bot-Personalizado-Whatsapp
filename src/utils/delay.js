// src/utils/delay.js
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = delay;
