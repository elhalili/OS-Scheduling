import { Process, ProcessState, ScheduledProcess } from "../types";

/**
 * Abstract class representing a scheduler for process scheduling.
 */
export abstract class Scheduler {
    /**
     * List of processes with all relevant information.
     */
    protected processes: Process[];
    /**
     * Array of states of all processes at every time unit.
     */
    protected schedProcesses: ScheduledProcess[][];
    /**
     * The current state of all processes.
     */
    protected currentSched: ScheduledProcess[];
    /**
     * Queue of ready processes.
     */
    protected queue: Process[];
    /**
     * Time unit progress.
     */
    protected time: number;

    /**
     * Constructs a new instance of the Scheduler class.
     * @param processes The list of processes to be scheduled.
     */
    constructor(processes: Process[]) {
        this.processes = processes;
        this.schedProcesses = [];
        this.currentSched = [];
        this.queue = [];
        this.time = 0;

        // Sorting processes by their arrival time
        this.processes.sort((a, b) => a.arrivedAt - b.arrivedAt);
        this.initState();
    }

    /**
     * Initializes the state of all processes.
     */
    protected initState(): void {
        this.currentSched = this.processes.map(e => ({
            name: e.name,
            state: ProcessState.NOT_ARRIVED,
            burstTime: e.burstTime,
            comment: 'Not arrived yet',
            arrivedTime: e.arrivedAt
        }));
    }
    
    /**
     * Checks for arrived processes and adds them to the queue, updating their state.
     */
    protected checkArrived(): void {
        // Update the state of arrived processes
        this.currentSched = this.currentSched.map(e => {
            if ((e.arrivedTime <= this.time) && (e.burstTime > 0)) {
                e.state = ProcessState.READY;
                e.comment = 'Ready for running';
            }

            return e;
        });

        // Push arrived processes to the queue
        for (let p of this.processes) {
            if (p.arrivedAt <= this.time) {
                this.queue.push(p);
                this.processes = this.processes.filter(e => e.name !== p.name);
            }
        }
    }

    /**
     * Updates the state of the currently running process at each time unit.
     * @param process The process currently running.
     */
    protected updateStateRunning(process: Process): void {
        this.currentSched = this.currentSched.map(e => {
            if (e.name === process.name) {
                e.state = ProcessState.RUNNING;
                e.comment = 'Running on CPU';
                e.burstTime--;
            }
            return e;
        });
    }

    /**
     * Updates the state of the last running processes to "Done".
     * @param process The process that has completed its execution.
     */
    protected updateStateDone(process: Process): void {
        this.currentSched = this.currentSched.map(e => {
            if (e.name === process.name) {
                e.state = ProcessState.DONE;
                e.comment = 'FINISHED';
            }
            return e;
        });
    }

    /**
     * Abstract method to be implemented by subclasses for running the scheduling algorithm.
     * @returns A two-dimensional array representing the states of all processes at each time unit.
     */
    abstract run(): ScheduledProcess[][];
}
