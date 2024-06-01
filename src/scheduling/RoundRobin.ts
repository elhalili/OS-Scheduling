import { Process, ProcessState, ScheduledProcess } from "../types";

/**
 * Round Robin (RR) scheduling algorithm.
 * This class schedules processes in a cyclic manner, where each process is executed for a small unit of time called a quantum.
 */
export class RoundRobin {
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
    /** Quantum - the time slice allocated for each process. */
    private quantum: number;

    /**
     * Constructs a new instance of the RoundRobin class.
     * @param processes The list of processes to be scheduled.
     * @param quantum The time slice allocated for each process.
     */
    constructor(processes: Process[], quantum: number) {
        this.processes = processes;
        this.schedProcesses = [];
        this.currentSched = [];
        this.queue = [];
        this.time = 0;
        this.quantum = quantum;

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
     * Updates the state of a process to "Ready" after it has used its time slice.
     * @param process The process that has completed its time slice.
     */
    private updateStateReady(process: Process): void {
        this.currentSched = this.currentSched.map(e => {
            if (e.name === process.name) {
                e.state = ProcessState.READY;
                e.comment = 'Ready for running';
            }
            return e;
        });

        this.queue.push(process);
    }

    /**
     * Runs the Round Robin scheduler to schedule the processes.
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

            let sliceTime = 0;
            while (process.burstTime && sliceTime < this.quantum) {
                // Update the state of the current running process
                this.updateStateRunning(process);
                this.schedProcesses.push(JSON.parse(JSON.stringify(this.currentSched))); // Deep copy
                process.burstTime--;
                this.time++;
                sliceTime++;
                this.checkArrived();
            }

            if (process.burstTime === 0) {
                this.updateStateDone(process);
                continue;
            }

            this.updateStateReady(process);
        }

        // Store the final state
        this.schedProcesses.push(JSON.parse(JSON.stringify(this.currentSched))); // Deep copy

        return this.schedProcesses;
    }
}
