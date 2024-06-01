import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { Scanner } from '../parser/Scanner';
import { Parser } from '../parser/Parser';
import { Scheduler } from '../scheduling/Scheduler';
import { ScheduledProcess, SchedulingAlgorithm } from '../types';
import { SJF } from '../scheduling/no-IOs/SJF';
import { RoundRobin } from '../scheduling/no-IOs/RoundRobin';
import { FCFS } from '../scheduling/no-IOs/FCFS';
import { ParserIO } from '../parser/ParserIO';
import { readFileSync, writeFileSync } from 'fs';
let mainWindow: BrowserWindow | null = null;
let schProcesses: ScheduledProcess[][] = [];
let displayedProcesses: ScheduledProcess[][] = [];
let algorithm: SchedulingAlgorithm = SchedulingAlgorithm.FCFS;
let quantum = 1;

/**
 * Creates the main application window.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: true,
    },
    icon: path.join(__dirname, 'assets', 'Off-Balance-Scale.png'),
  });

  // Load the home page
  mainWindow.loadFile(path.join(__dirname, 'pages/home/index.html'));
}

// Event handler for application ready event
app.on('ready', createWindow);

// Event handler for all windows closed event
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Event handler for application activate event
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/**
 * Handles navigation between different pages.
 * @param event - The event object.
 * @param page - The page to navigate to.
 */
ipcMain.on('navigate-to', (event, page) => {
  if (mainWindow) {
    mainWindow.loadFile(path.join(__dirname, `pages/${page}/index.html`));
  }
});

/**
 * Handles the open file dialog and returns the selected file path.
 * @returns The file path of the selected file.
 */
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: 
    [
      { name: 'Processes File', extensions: ['ps'] },
      { name: 'Restore Processes File', extensions: ['json'] }
    ],
  });
  return result.filePaths[0];
});

/**
 * Handles the creation of a new simulation by parsing the processes file and scheduling them.
 * @param event - The event object.
 * @param filePath - The file path of the processes file.
 * @param alg - The scheduling algorithm to use.
 * @param q - The quantum for Round Robin scheduling (default is 1).
 */
ipcMain.handle('new-simulation-parsing', async (event, filePath: string, alg: SchedulingAlgorithm, q = 1) => {
  algorithm = alg;
  quantum = q;

  const scanner = new Scanner(filePath);
  await scanner.readFile();
  const tokens = scanner.tokenize();
  const parser: Parser = new ParserIO(tokens);
  const processes = parser.parse();

  let scheduler: Scheduler;

  switch (algorithm) {
    case SchedulingAlgorithm.FCFS:
      scheduler = new FCFS(processes);
      break;
    case SchedulingAlgorithm.SJF:
      scheduler = new SJF(processes);
      break;
    case SchedulingAlgorithm.RR:
      scheduler = new RoundRobin(processes, quantum);
      break;
  }

  schProcesses = scheduler.run();
});

/**
 * Provides the stored processes to the requesting page.
 * @returns The scheduled processes.
 */
ipcMain.handle('get-processes', () => {
  return schProcesses;
});

/**
 * Updates the stored processes with the displayed and remaining processes.
 * @param event - The event object.
 * @param displayedProc - The displayed processes.
 * @param remainingProc - The remaining processes.
 */
ipcMain.handle('set-processes', (event, remainingProcesses: ScheduledProcess[][], displayedProc: ScheduledProcess[][]) => {
  schProcesses = remainingProcesses;
  displayedProcesses = displayedProc;
});

/**
 * Provides the remaining processes to the requesting page.
 * @returns The remaining processes.
 */
ipcMain.handle('get-displayed-processes', () => {
  return displayedProcesses;
});

/**
 * Save a simulation to run it later
 * @returns 
 */
ipcMain.handle('save-session', async () => {
  const options = {
    title: 'Save simulation',
    defaultPath: path.join(__dirname, 'processes.json'),
    buttonLabel: 'Save',
    filters: [
      { name: 'Json Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  };

  const { filePath } = await dialog.showSaveDialog(options);
  
  // writing file sync
  if (filePath) {
    writeFileSync(filePath, JSON.stringify({
      algorithm,
      remainingProcesses: schProcesses,
      displayedProcesses: displayedProcesses,
      quantum
    }));
    return 'File saved successfully';
  } 
    return 'Save canceled';
});

/**
 *  This handler restores a previously saved simulation state from a specified file.
 * @param {IpcMainInvokeEvent} event - The event object associated with the IPC event.
 * @param {string} path - The file path to the JSON file containing the saved simulation data.
 * 
*/
ipcMain.handle('restore-simulation', async (event, path: string) => {
  const jsonData = readFileSync(path).toString();

  const data: {
    algorithm: SchedulingAlgorithm,
    quantum: number,
    remainingProcesses: ScheduledProcess[][], 
    displayedProcesses: ScheduledProcess[][]
  } = JSON.parse(jsonData);

  schProcesses = data.remainingProcesses;
  displayedProcesses = data.displayedProcesses;
  quantum = data.quantum;
  algorithm = data.algorithm;
});