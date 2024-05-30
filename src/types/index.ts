/**
 * Represents details of an IO request within a process.
 */
export interface IOCycle {
  /** The start time of the IO request. */
  startAt: number;
  /** The duration of the IO request. */
  duration: number;
}

/**
* Represents the structure of a process parsed from a *.ps file.
*/
export interface Process {
  /** The name of the process. */
  name: string;
  /** The arrival time of the process. */
  arrivedAt: number;
  /** The burst time of the process. */
  burstTime: number;
  /** The IO cycles of the process. */
  io: IOCycle[];
}

/**
* Represents the possible states of a process.
*/
export enum ProcessState {
  /** The process is ready to execute. */
  READY,
  /** The process is blocked due to IO. */
  BLOCKED,
  /** The process is currently running. */
  RUNNING,
  /** The process has completed execution. */
  DONE,
  /** The process has not yet arrived. */
  NOT_ARRIVED
}

/**
* Represents the state of a process during all unit times.
*/
export interface ScheduledProcess {
  /** The name of the process. */
  name: string;
  /** The burst time of the process. */
  burstTime: number;
  /** The state of the process. */
  state: ProcessState;
  /** Additional comments about the process. */
  comment: string;
  /** The time at which the process arrived. */
  arrivedTime: number;
}

/**
* Represents an IO request.
*/
export interface IORequest {
  /** The name of the process making the IO request. */
  name: string;
  /** The waiting time for the IO request. */
  waiting: number;
}

/**
* Represents the supported scheduling algorithms.
*/
export enum SchedulingAlgorithm {
  /** First-Come, First-Served algorithm. */
  FCFS,
  /** Shortest Job First algorithm. */
  SJF,
  /** Round Robin algorithm. */
  RR
}
