enum SchedulingAlgorithm {
  FCFS,
  SJF,
  RR
}

// DOM Elements
const newSimulationBtn = document.getElementById('new-simulation') as HTMLButtonElement;
const restoreSimulationBtn = document.getElementById('restore-simulation') as HTMLButtonElement;
const startBtn = document.getElementById('start') as HTMLButtonElement;
const algorithmSelect = document.getElementById('algorithm') as HTMLSelectElement;
const quantumInput = document.getElementById("quantum") as HTMLInputElement;

let path: string = '';

/**
 * Event handler for the "New Simulation" button click.
 * Opens a file dialog and updates UI elements based on the selected file.
 */
newSimulationBtn?.addEventListener('click', async () => {
  try {
    path = await window.electronAPI.openFile();

    if (path) {
      restoreSimulationBtn.disabled = true;
      algorithmSelect.hidden = false;
      startBtn.hidden = false;
    }
  } catch (err) {
    alert("Can't open the file");
  }
});

/**
 * Event handler for changes in the algorithm selection.
 * Toggles the visibility of the quantum input based on the selected algorithm.
 */
algorithmSelect.addEventListener('change', () => {
  quantumInput.hidden = (algorithmSelect.value !== "RR");
});

/**
 * Event handler for the "Start" button click.
 * Initiates a new simulation with the selected algorithm and quantum value.
 */
startBtn.addEventListener('click', async () => {
  let algorithm = SchedulingAlgorithm.FCFS;
  let q = 1;

  switch (algorithmSelect.value) {
    case "SJF":
      algorithm = SchedulingAlgorithm.SJF;
      break;
    case "RR":
      algorithm = SchedulingAlgorithm.RR;
      q = quantumInput.valueAsNumber;
      break;
  }

  try {
    await window.electronAPI.newSimulationParsing(path, algorithm, q);
    await window.electronAPI.navigateTo('new-simulation');
  } catch (err) {
    alert('Incorrect file structure');
  }
});

restoreSimulationBtn.addEventListener('click', async () => {
    try {
    path = await window.electronAPI.openFile();

    if (path) {
      await window.electronAPI.restoreSimulation(path);
      await window.electronAPI.navigateTo('new-simulation');
    }
  } catch (err) {
    alert("Can't open the file");
  }
})