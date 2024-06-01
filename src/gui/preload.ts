import { IpcRenderer } from "electron";
import { ScheduledProcess, SchedulingAlgorithm } from "../types";

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
})

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  newSimulationParsing: (path: string, algorithm: SchedulingAlgorithm, quantum: number) => ipcRenderer.invoke('new-simulation-parsing', path, algorithm, quantum),
  navigateTo: (page: string) => {
    ipcRenderer.send('navigate-to', page);
  },
  getProcesses: () => ipcRenderer.invoke('get-processes'),
  setProcesses: (remainingProc: ScheduledProcess[][], displayedProc: ScheduledProcess[][]) => ipcRenderer.invoke('set-processes', remainingProc, displayedProc),
  getDisplayedProcesses: () => ipcRenderer.invoke('get-displayed-processes'),
  saveSession: () => ipcRenderer.invoke('save-session'),
  restoreSimulation: (path: string) => ipcRenderer.invoke('restore-simulation', path),
})