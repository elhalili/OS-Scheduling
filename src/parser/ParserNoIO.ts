import { Process } from "../types";
import { Parser } from "./Parser";
import { Token, TokenType } from "./Scanner";

/**
 * ParserNoIO class parses tokens representing processes without IO cycles.
 */
export class ParserNoIO extends Parser {
    /** The current process being parsed. */
    private currentProcess: Process;

    /**
     * Creates an instance of ParserNoIO.
     * @param tokens The tokens to be parsed.
     */
    constructor(tokens: Token[]) {
        super(tokens);
        this.currentProcess = {
            name: 'DEFAULT PARSER',
            arrivedAt: 0,
            burstTime: 0,
            io: []
        };
    }

    /**
     * Parses the tokens into an array of processes without IO cycles.
     * @returns An array of parsed processes without IO cycles.
     */
    parse(): Process[] {
        this.line();
        return Object.create(this.processes);
    }

    /**
     * Parses a line of tokens.
     */
    private line() {
        const token = this.tokens.shift();
        if (token !== undefined && token.type === TokenType.IDENTIFIER) {
            this.currentProcess.name = token.value;
            this.at();
            return;
        }
        throw new Error('Unaccepted expression: The line must start with an identifier');
    }

    /**
     * Parses the arrival time of a process.
     */
    private at() {
        const token = this.tokens.shift();
        if (token !== undefined && token.type === TokenType.INTEGER) {
            this.currentProcess.arrivedAt = Number.parseInt(token.value);
            this.bt();
            return;
        }
        throw new Error('Unaccepted expression: After an identifier must be the burst time');
    }

    /**
     * Parses the burst time of a process and pushes it into the processes array.
     */
    private bt() {
        const token = this.tokens.shift();
        if (token !== undefined && token.type === TokenType.INTEGER) {
            this.currentProcess.burstTime = Number.parseInt(token.value);
            this.processes.push(Object.create(this.currentProcess));
            this.checkNext();
            return;
        }
        throw new Error('Unaccepted expression: After the burst time must be the arrive time');
    }

    /**
     * Checks the next line of tokens.
     */
    private checkNext() {
        const token = this.tokens.shift();
        if (token !== undefined && token.type === TokenType.ENDLINE) {
            this.currentProcess = {
                name: 'DEFAULT PARSER',
                arrivedAt: 0,
                burstTime: 0,
                io: []
            };
            this.line();
        }
    }
}
