# Secret Challenge Solution

I work with a list of numbers that represent a table which my program has to interpret correctly.

Since there is nothing but a flat list, the program infer the rows and columns from this data, if needed. Also If the square edge length is odd and there is a singular field in the middle of the table, it is not moved.

**The task is to rotate the table to the left.**

## Ecosystem

- Using `process.argv` to obtain the arguments passed to the program
- Using `fs` module for streaming input file
- Using `csv-parser` package for reading CSV file
- Using `console` to log (stdout) result

## Installation & Execution

    # install dependencies
    npm install

    # serve with hot reload
    npm start:dev

    # lint project
    npm run lint

    # build for production
    npm run build

    # serve production build (node cli.js input.csv > output.csv)
    npm start

## How it works

You can see my hand written solution [HERE](./secret-challenge-solution.pdf) as a PDF file.

1. Stream input CSV using `fs` module and parse it using `csv-parser`.
2. Calculate side size with square root:
   - If SQRT of side has decimals then data is **INVALID** and `${rowIndex},"[]",false` will be printed.
   - If SQRT of side has **NOT** decimals then data is **VALID** and we continue below steps.
3. Create a matrix from input array.
4. Get matrix size.
5. Calculate rotatable layers based on size (finding outermost to innermost squares for rotation):

   | N×N | Size | Rotatable Layers `(size/2)` |
   | --- | ---- | --------------------------- |
   | 1x1 | 1    | 0                           |
   | 2x2 | 2    | 1                           |
   | 3x3 | 3    | 1                           |
   | 4x4 | 4    | 2                           |
   | 5x5 | 5    | 2                           |
   | ... | ...  | ...                         |

6. For each rotatable layer:
   1. Create a sequence array from top, right, bottom and left sides.
   2. Delete duplicate values from sequence to have a flat list.
   3. Rotate the sequence to left (shift and push the array).
   4. Create new sides from rotated sequence flat list.
   5. Replace new sides with main matrix sides.
7. Create output from rotated matrix and write it to `stdout`.
