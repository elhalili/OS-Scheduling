# OS Scheduling

This project application for exploring various operating system scheduling policies. It provides a simulation environment where you can visualize and analyze the behavior of different scheduling algorithms.

## Features

- Supports multiple scheduling algorithms, including First-Come, First-Served (FCFS), Shortest Job First (SJF), and Round Robin (RR).
- Simulates process execution and displays Gantt charts to visualize the scheduling process.
- Allows customization of parameters such as quantum size for Round Robin scheduling.
- Allows suspense and resume the simulation
- Saving a session of a simulation to restore it later

## Installation

### Prerequisites

- Node.js and npm installed on your system.

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/elhalili/OS-Scheduling.git
   ```

2. Navigate to the project directory:

   ```bash
   cd OS-Scheduling
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Build the application for linux:

   ```bash
   npm run build-linux
   ```
5. To launch a dev version of the desktop application, run:

   ```bash
   npm run dev-gui
   ```

## File Structure
The project's file structure is organized to facilitate ease of development and maintainability. Below is an overview of the main directories and files within the project:
```
OS-Scheduling/
├── package.json                  # Project manifest file
├── package-lock.json             # Lock file for project dependencies
├── src/                          # Source code for the application
│   ├── gui/                      # Graphical User Interface related files
│   │   ├── assets/               # Assets specific to the GUI
│   │   │   ├── icon.png          # Application icon
│   │   │   ├── Off-Balance-Scale.png  # Additional image asset
│   │   │   └── Off-Balance-Scale.svg  # Additional SVG asset
│   │   ├── main.ts               # Entry point for the Electron main process
│   │   ├── pages/                # HTML and renderer scripts for different pages
│   │   │   ├── home/             # Home page
│   │   │   │   ├── index.html    # Home page HTML
│   │   │   │   └── renderer.ts   # Home page renderer script
│   │   │   └── new-simulation/   # New simulation page
│   │   │       ├── index.html    # New simulation page HTML
│   │   │       └── renderer.ts   # New simulation page renderer script
│   │   └── preload.ts            # Preload script for Electron
│   ├── parser/                   # Parser implementations for reading process files
│   │   ├── Parser.ts             # Abstract base class for parsers
│   │   ├── ParserIO.ts           # Parser for processes with I/O
│   │   ├── ParserNoIO.ts         # Parser for processes without I/O
│   │   └── Scanner.ts            # Tokenizer for parsing input files
│   ├── scheduling/               # Scheduling algorithm implementations
│   │   ├── FCFS.ts               # First-Come, First-Served algorithm
│   │   ├── no-IOs/               # Scheduling algorithms for processes without I/O
│   │   │   ├── FCFS.ts           # FCFS algorithm without I/O
│   │   │   ├── RoundRobin.ts     # Round Robin algorithm without I/O
│   │   │   └── SJF.ts            # Shortest Job First algorithm without I/O
│   │   ├── RoundRobin.ts         # Round Robin algorithm
│   │   ├── Scheduler.ts          # Base scheduler class
│   │   └── SJF.ts                # Shortest Job First algorithm
│   └── types/                    # Type definitions and interfaces
│       └── index.ts              # Type definitions for processes and scheduling
└── tsconfig.json                 # TypeScript configuration file
```

## Parser
### Overview
The parsers in this project are responsible for reading and interpreting input files that define the processes to be scheduled. There are two main parsers:

- ParserNoIO: Handles processes that do not have I/O operations.
- ParserIO: Handles processes that include I/O operations.
### Processes file structure

#### Without I/O

The following is an example of a process file without I/O operations. Each process is defined with a name, arrival time, and burst time.

```plaintext
# Process Name  Arrival Time  Burst Time
P1              0             5
P2              2             3
P3              4             1
P4              6             7
```

Explanation:
- **P1** arrives at time 0 and has a burst time of 5 units.
- **P2** arrives at time 2 and has a burst time of 3 units.
- **P3** arrives at time 4 and has a burst time of 1 unit.
- **P4** arrives at time 6 and has a burst time of 7 units.

#### With I/O

The following is an example of a process file with I/O operations. Each process is defined with a name, arrival time, burst time, and one or more I/O operations. I/O operations are defined by their start time and duration.

```plaintext
# Process Name  Arrival Time  Burst Time  I/O Start:Duration
P1              0             5           2:1
P2              1             8           4:2 6:1
P3              3             6           3:2
P4              5             4           1:1
```

Explanation:
- **P1** arrives at time 0, has a burst time of 5 units, and an I/O operation starting at time 2 with a duration of 1 unit.
- **P2** arrives at time 1, has a burst time of 8 units, and two I/O operations: one starting at time 4 with a duration of 2 units, and another starting at time 6 with a duration of 1 unit.
- **P3** arrives at time 3, has a burst time of 6 units, and an I/O operation starting at time 3 with a duration of 2 units.
- **P4** arrives at time 5, has a burst time of 4 units, and an I/O operation starting at time 1 with a duration of 1 unit.

### Note

In both examples, the file format uses:
- `#` to indicate comments, which are ignored by the parser.
- Processes are listed line by line with their attributes separated by spaces.
- For I/O operations, the format `start:duration` is used to specify each I/O operation for a process. Multiple I/O operations are separated by spaces.


## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to contribute new features, fix bugs, or improve documentation.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
