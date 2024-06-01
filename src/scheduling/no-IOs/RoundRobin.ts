import { Process, ScheduledProcess, ProcessState } from "../../types";
import { Scheduler } from "../Scheduler";

/**
 * Round Robin scheduling algorithm implementation.
 * Inherits from the Scheduler class.
 */
export class RoundRobin extends Scheduler {
    /**
     * The quantum time slice for Round Robin scheduling.
     */
    private quantum: number;
    
    /**
     * Constructs a new instance of the RoundRobin class.
     * @param processes The list of processes to be scheduled.
     * @param quantum The quantum time slice for Round Robin scheduling.
     */
    constructor(processes: Process[], quantum: number) {
        super(processes);
        this.quantum = quantum;
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

    /**
     * Update the state of the process to ready and add it back to the queue.
     * @param process The process to be updated.
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
}
