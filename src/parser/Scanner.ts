import { readFile } from 'fs/promises';

/**
 * Enum representing the different types of tokens.
 */
export enum TokenType {
  /** Identifier token type. */
  IDENTIFIER,
  /** Integer token type. */
  INTEGER,
  /** Colon token type. */
  COLON,
  /** Endline token type. */
  ENDLINE,
}

/**
 * Interface representing a token with its type and value.
 */
export interface Token {
  /** The type of the token. */
  type: TokenType;
  /** The value of the token. */
  value: string;
}

/**
 * Scanner class responsible for tokenizing input files.
 */
export class Scanner {
  private static readonly IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z_0-9]*/;
  private static readonly INTEGER_REGEX = /^\d+/;
  private static readonly COLON_REGEX = /^:/;
  private static readonly COMMENT_REGEX = /^#.*/;
  private static readonly WHITESPACE_REGEX = /^\s+/;

  private file: string;
  private fileContent: string = '';
  private tokens: Token[] = [];

  /**
   * Constructs a new instance of the Scanner class.
   * @param filename The name of the file to be scanned.
   */
  constructor(filename: string) {
    this.file = filename;
  }

  /**
   * Reads the content of the file asynchronously.
   */
  async readFile(): Promise<void> {
    try {
      this.fileContent = await readFile(this.file, 'utf-8');
    } catch (err) {
      console.error('Error reading file:', err);
    }
  }

  /**
   * Tokenizes the content of the file.
   * @returns An array of tokens extracted from the file content.
   */
  tokenize(): Token[] {
    const lines = this.fileContent.split('\n');

    for (const line of lines) {
      let trimmedLine = line.trim();

      // Skip empty lines and comments
      if (trimmedLine === '' || Scanner.COMMENT_REGEX.test(trimmedLine)) {
        continue;
      }

      while (trimmedLine.length > 0) {
        let match: RegExpMatchArray | null;

        // Check for identifier
        if ((match = trimmedLine.match(Scanner.IDENTIFIER_REGEX)) !== null) {
          this.tokens.push({ type: TokenType.IDENTIFIER, value: match[0] });
        }
        // Check for integer
        else if ((match = trimmedLine.match(Scanner.INTEGER_REGEX)) !== null) {
          this.tokens.push({ type: TokenType.INTEGER, value: match[0] });
        }
        // Check for colon
        else if ((match = trimmedLine.match(Scanner.COLON_REGEX)) !== null) {
          this.tokens.push({ type: TokenType.COLON, value: match[0] });
        }
        // Skip whitespace
        else if ((match = trimmedLine.match(Scanner.WHITESPACE_REGEX)) !== null) {
          // No token added for whitespace
        } else {
          throw new Error(`Unexpected token in line: ${trimmedLine}`);
        }

        // Remove the matched part from the line
        if (match) {
          trimmedLine = trimmedLine.slice(match[0].length).trim();
        }
      }

      // Add endline token
      this.tokens.push({ type: TokenType.ENDLINE, value: '\n' });
    }

    return this.tokens;
  }
}
