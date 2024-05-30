import { Process, ScheduledProcess } from "../../types";
import { Scheduler } from "../Schduler";

/**
 * First-Come, First-Served (FCFS) scheduling algorithm implementation.
 * Inherits from the Scheduler class.
 */
export class FCFS extends Scheduler {
    /**
     * Constructs a new instance of the FCFS class.
     * @param processes The list of processes to be scheduled.
     */
    constructor(processes: Process[]) {
        super(processes);
    }

    /**
     * Runs the FCFS scheduler to schedule the processes.
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
