import { Process, ProcessState, ScheduledProcess } from "../types";

/**
 * Shortest Job First (SJF) scheduling algorithm.
 * This class schedules processes based on their burst time, executing the shortest job first.
 */
export class SJF {
    /** List of processes with all relevant information. */
    private processes: Process[];
    /** Array of states of all processes at every time unit. */
    private schedProcesses: ScheduledProcess[][];
    /** The current state of all processes. */
    private currentSched: ScheduledProcess[];
    /** Queue of ready processes. */
    private queue: Process[];
    /** Time unit progress. */
    private time: number;

    /**
     * Constructs a new instance of the SJF class.
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
    private initState(): void {
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
    private checkArrived(): void {
        this.currentSched = this.currentSched.map(e => {
            if ((e.arrivedTime <= this.time) && (e.burstTime > 0)) {
                e.state = ProcessState.READY;
                e.comment = 'Ready for running';
            }
            return e;
        });

        for (let p of this.processes) {
            if (p.arrivedAt <= this.time) {
                this.queue.push(p);
                this.processes = this.processes.filter(e => e.name !== p.name);
            }
        }

        // Update the queue based on the shortest job first
        this.queue.sort((a, b) => a.burstTime - b.burstTime);
    }

    /**
     * Updates the state of the currently running process at each time unit.
     * @param process The process currently running.
     */
    private updateStateRunning(process: Process): void {
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
    private updateStateDone(process: Process): void {
        this.currentSched = this.currentSched.map(e => {
            if (e.name === process.name) {
                e.state = ProcessState.DONE;
                e.comment = 'FINISHED';
            }
            return e;
        });
    }

    /**
     * Runs the SJF scheduler to schedule the processes.
     * @returns A two-dimensional array representing the states of all processes at each time unit.
     */
    run(): ScheduledProcess[][] {
        while (this.processes.length > 0 || this.queue.length > 0) {
            this.checkArrived();

            const process = this.queue.shift();

            if (!process) {
                this.time++;
                this.schedProcesses.push(JSON.parse(JSON.stringify(this.currentSched)));
                continue;
            }

            while (process && process.burstTime > 0) {
                // Update the state of the current running process
                this.updateStateRunning(process);
                this.schedProcesses.push(JSON.parse(JSON.stringify(this.currentSched))); // Deep copy
                process.burstTime--;
                this.time++;
                this.checkArrived();
            }

            // Change the state of the process to DONE
            this.updateStateDone(process);
        }

        // Store the final state
        this.schedProcesses.push(JSON.parse(JSON.stringify(this.currentSched))); // Deep copy

        return this.schedProcesses;
    }
}
