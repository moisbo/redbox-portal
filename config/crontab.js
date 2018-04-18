module.exports.crontab = {
  crons: function() {
    return [
      { interval: '1 * * * * * ', service: 'workspaceasyncservice', method: 'loop' }
    ];
  }
}
