import { Token, TokenType } from "./Scanner";
import { Process, IOCycle } from "../types";
import { Parser } from "./Parser";

/**
 * Recursive descent parser for parsing processes files with IO cycles.
 */
export class ParserIO extends Parser {
    /** The current process being parsed. */
    private currentProcess: Process;
    /** The current IO cycle being parsed. */
    private currentIO: IOCycle;
    /** Array of IO cycles for the current process. */
    private currentIOs: IOCycle[];

    /**
     * Constructs a new instance of the ParserIO class.
     * @param tokens An array of tokens to be parsed.
     */
    constructor(tokens: Token[]) {
        super(tokens);
        this.currentProcess = {
            name: 'start',
            arrivedAt: 0,
            burstTime: 0,
            io: []
        };
        this.currentIO = {
            startAt: 0,
            duration: 0
        };
        this.currentIOs = [];
    }

    /**
     * Parses the tokens into an array of processes with IO cycles.
     * @returns An array of parsed processes with IO cycles.
     */
    parse(): Process[] {
        this.line();
        return this.processes;
    }

    private line() {
        const token = this.tokens.shift();
        if (token !== undefined && token.type === TokenType.IDENTIFIER) {
            this.currentProcess = {
                name: token.value,
                arrivedAt: 0, 
                burstTime: 0, 
                io: []
            };
            this.at();
            return;
        } 
        throw new Error('Unaccepted expression: The line must start with an identifier');
    }

    private at() {
        const token = this.tokens.shift();
        if (token !== undefined && token.type === TokenType.INTEGER) {
            this.currentProcess.arrivedAt = Number.parseInt(token.value);
            this.bt();
            return;
        }
        throw new Error('Unaccepted expression: After an identifier must be the burst time');
    }

    private bt() {
        const token = this.tokens.shift();
        if (token !== undefined && token.type === TokenType.INTEGER) {
            this.currentProcess.burstTime = Number.parseInt(token.value);
            this.currentIOs = [];
            this.io();
            return;
        }
        throw new Error('Unaccepted expression: After the burst time must be the arrive time');
    }

    private io() {
        const token = this.tokens.shift();
        if (token !== undefined && token.type === TokenType.INTEGER) {
            this.currentIO = {
                startAt: Number.parseInt(token.value),
                duration: 0
            };
            this.io1();
            return;
        } else if (token !== undefined && token.type === TokenType.ENDLINE) {
            this.currentProcess.io.push(...this.currentIOs);
            this.processes.push(this.currentProcess);
            this.checkNext();
            return;
        }
        throw new Error('Unaccepted expression: After IO');
     }

     private io1() {
        const token = this.tokens.shift();
        if (token !== undefined && token.type === TokenType.COLON) {
            this.io2();
            return;
        }
        throw new Error('Unaccepted expression: After IO, there must be a colon');
     }

    private  io2() {
        const token = this.tokens.shift();
        if (token !== undefined && token.type === TokenType.INTEGER) {
            this.currentIO.duration = Number.parseInt(token.value);
            this.currentIOs.push(Object.create(this.currentIO));
            this.io();
            return;
        }
        throw new Error('Unaccepted expression: After colon, there must be a duration for IO');
     }

     private checkNext() {
        const token = this.tokens.shift();
        if (token !== undefined && token.type === TokenType.IDENTIFIER) {
            this.currentProcess = {
                name: token.value,
                arrivedAt: 0, 
                burstTime: 0, 
                io: []
            };
            this.at();
        }
     }
}
