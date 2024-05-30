import { Token } from "./Scanner";
import { Process } from "../types";

/**
 * Abstract class representing a parser for tokenized input.
 */
export abstract class Parser {
    /** Array of tokens to be parsed. */
    protected tokens: Token[];
    /** Array of processes parsed from the tokens. */
    protected processes: Process[];

    /**
     * Constructs a new instance of the Parser class.
     * @param tokens An array of tokens to be parsed.
     */
    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.processes = [];
    }

    /**
     * Abstract method to be implemented by subclasses for parsing tokens into processes.
     * @returns An array of parsed processes.
     */
    abstract parse(): Process[]; 
}
