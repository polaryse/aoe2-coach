const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('aoe2CoachDesktop', {
  platform: process.platform,
});
