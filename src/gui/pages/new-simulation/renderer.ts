enum ProcessState {
  READY,
  BLOCKED,
  RUNNING,
  DONE,
  NOT_ARRIVED
}

/**
 * Converts a ProcessState enum value to its corresponding string representation.
 * @param state - The state to be converted.
 * @returns The string representation of the state.
 */
function processStateString(state: ProcessState): string {
  switch (state) {
    case ProcessState.READY:
      return 'READY';
    case ProcessState.BLOCKED:
      return 'BLOCKED';
    case ProcessState.RUNNING:
      return 'RUNNING';
    case ProcessState.DONE:
      return 'DONE';
    case ProcessState.NOT_ARRIVED:
      return 'NOT ARRIVED';
  }
}

interface ScheduledProcess {
  name: string;
  burstTime: number;
  state: ProcessState;
  comment: string;
  arrivedTime: number;
}

// DOM Elements
const simulationStateBtn = document.getElementById('simulation-state') as HTMLButtonElement;
const simulationSaveBtn = document.getElementById('save') as HTMLButtonElement;
const newSimuBtn = document.getElementById('new-simulation') as HTMLButtonElement;
const chart = document.getElementById('chart');

// Simulation variables
let isPaused = false;
const timeUnit = 1000;
const colors: string[] = [
  "#FF5733", // Red
  "#33FF57", // Green
  "#3357FF", // Blue
  "#FFFF33", // Yellow
  "#33FFFF", // Cyan
  "#FF33FF", // Magenta
  "#FF8C33", // Orange
  "#8C33FF"  // Purple
];

let processes: ScheduledProcess[][] = [];
let displayedProcesses: ScheduledProcess[][] = [];

/**
 * Builds the chart plan and updates it periodically based on the state of processes.
 * @returns A promise that resolves to true if the chart plan was successfully built, otherwise false.
 */
async function buildChartPlan(): Promise<boolean> {
  // Initialize processes from Electron API
  processes = await window.electronAPI.getProcesses();
  displayedProcesses = await window.electronAPI.getDisplayedProcesses();

  if (!processes || processes.length === 0) {
    displayError('Error loading processes');
    return false;
  }

  const rows = processes[0].length + 1;
  const columns = processes.length + displayedProcesses.length + 3;
  const plan: HTMLDivElement[][] = [];

  createHeaderRow(rows, columns, plan);
  let j = 1;

  // Restore old simulation plan state
  if (displayedProcesses.length > 0) {
    while (j <= displayedProcesses.length) {
      updatePlanForCurrentProcesses(displayedProcesses[j - 1], plan, columns, j);
      j++;
    }

    simulationStateBtn.click();
  }

  
  const iid = setInterval(async () => {
    if (isPaused) return;

    const currentProcesses = processes.shift();
    if (currentProcesses) {
      updatePlanForCurrentProcesses(currentProcesses, plan, columns, j);
      displayedProcesses.push(currentProcesses);
      await window.electronAPI.setProcesses(processes, displayedProcesses);
      j++;
    }

    if (j + 2 === columns) {
      clearInterval(iid);
      updateSimulationControlsOnEnd();
    }
  }, timeUnit);

  return true;
}

/**
 * Creates the header row of the chart plan.
 * @param rows - The number of rows.
 * @param columns - The number of columns.
 * @param plan - The plan array to store the created rows.
 */
function createHeaderRow(rows: number, columns: number, plan: HTMLDivElement[][]): void {
  for (let i = 0; i < rows; i++) {
    const row = document.createElement('div');
    row.classList.add('row');
    const rowPlan: HTMLDivElement[] = [];

    for (let j = 0; j < columns; j++) {
      const cell = document.createElement('div');
      cell.classList.add('cell', 'header');

      if (i === 0) {
        setupHeaderCell(cell, j, columns);
      } else {
        setupProcessCell(cell, i, j, columns);
      }

      row.appendChild(cell);
      rowPlan.push(cell);
    }

    chart?.appendChild(row);
    plan.push(rowPlan);
  }
}

/**
 * Sets up the header cell based on its position.
 * @param cell - The cell element.
 * @param columnIndex - The index of the column.
 * @param totalColumns - The total number of columns.
 */
function setupHeaderCell(cell: HTMLDivElement, columnIndex: number, totalColumns: number): void {
  if (columnIndex === 0) cell.innerText = 'Process Name';
  else if (columnIndex === totalColumns - 3) cell.innerText = 'Burst Time';
  else if (columnIndex === totalColumns - 2) cell.innerText = 'State';
  else if (columnIndex === totalColumns - 1) cell.innerText = 'Comment';
  else cell.classList.remove('header');
}

/**
 * Sets up the process cell based on its position.
 * @param cell - The cell element.
 * @param rowIndex - The index of the row.
 * @param columnIndex - The index of the column.
 * @param totalColumns - The total number of columns.
 */
function setupProcessCell(cell: HTMLDivElement, rowIndex: number, columnIndex: number, totalColumns: number): void {
  if (columnIndex === 0) cell.innerText = processes[0][rowIndex - 1].name;
  else if (columnIndex === totalColumns - 3) cell.innerText = `${processes[0][rowIndex - 1].burstTime}`;
  else if (columnIndex === totalColumns - 2) cell.innerText = processStateString(processes[0][rowIndex - 1].state);
  else if (columnIndex === totalColumns - 1) cell.innerText = processes[0][rowIndex - 1].comment;
  else cell.classList.remove('header');
}

/**
 * Updates the plan for the current processes at a given time step.
 * @param currentProcesses - The current processes.
 * @param plan - The plan array.
 * @param totalColumns - The total number of columns.
 * @param timeStep - The current time step.
 */
function updatePlanForCurrentProcesses(currentProcesses: ScheduledProcess[], plan: HTMLDivElement[][], totalColumns: number, timeStep: number): void {
  if (timeStep < totalColumns - 3) {
    plan[0][timeStep].innerText = (timeStep - 1).toString();
  }

  currentProcesses.forEach((process, index) => {
    const rowIndex = index + 1;
    if (process.state === ProcessState.RUNNING) {
      plan[rowIndex][timeStep].style.backgroundColor = colors[index % colors.length];
    }

    plan[rowIndex][totalColumns - 3].innerText = process.burstTime.toString();
    plan[rowIndex][totalColumns - 2].innerText = processStateString(process.state);
    plan[rowIndex][totalColumns - 1].innerText = process.comment;
  });

  if (timeStep < totalColumns - 3) {
    plan[0][timeStep].innerText = (timeStep - 1).toString();
  }
}

/**
 * Updates the simulation controls when the simulation ends.
 */
function updateSimulationControlsOnEnd(): void {
  simulationStateBtn.hidden = true;
  newSimuBtn.hidden = false;
  simulationSaveBtn.hidden = true;
}

/**
 * Displays an error message in the chart container.
 * @param message - The error message to display.
 */
function displayError(message: string): void {
  const errorDiv = document.createElement('div');
  errorDiv.innerText = message;
  chart?.appendChild(errorDiv);
}

// Event listeners
newSimuBtn.addEventListener('click', async () => {
  await window.electronAPI.navigateTo('home');
});

simulationStateBtn.addEventListener('click', () => {
  isPaused = !isPaused;
  simulationStateBtn.innerText = isPaused ? 'Continue' : 'Pause';
  simulationSaveBtn.disabled = !isPaused;
});

simulationSaveBtn.addEventListener('click', async () => {
  try {
    const msg = await window.electronAPI.saveSession();

    if (msg === 'Save canceled') {
      alert(msg);
      return;
    }

    alert(msg)
    await window.electronAPI.navigateTo('home');

  } catch(err) {
    alert('Error happened at saving file');
  }
});

// Build the chart plan
buildChartPlan();