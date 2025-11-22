const { contextBridge, ipcRenderer } = require('electron');

const conkyAPI = {
  getDefaultConfigPath: () => ipcRenderer.invoke('get-default-config-path'),
  selectConfigFile: () => ipcRenderer.invoke('select-config-file'),
  readConfig: (configPath: string) => ipcRenderer.invoke('read-config', configPath),
  writeConfig: (configPath: string, config: Record<string, string>) => ipcRenderer.invoke('write-config', configPath, config),
  restartConky: (configPath: string) => ipcRenderer.invoke('restart-conky', configPath),
};

contextBridge.exposeInMainWorld('conkyAPI', conkyAPI);
