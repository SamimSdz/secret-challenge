import fs from "fs";

import csv from "csv-parser";

// check if input CSV is specified on CLI
if (process.argv.length < 3) {
  // throw error CLI input is not specified
  console.error("Please specify input CSV file");
  process.exit(1);
}

// find file and load it in memory
const filePath = process.argv[2];
const inputStream = fs.createReadStream(filePath);

// initialize output
let output = `id,json,is_valid\n`;

// read input CSV
inputStream
  .on("error", (error) => {
    // throw error if file does not exist
    console.error("can not read input file! ", error.message);
    process.exit(1);
  })
  // parse CSV
  .pipe(csv())
  .on("data", (data: { id: string; json: string }) => {
    try {
      // fix bad quotation marks
      data.json = data.json.replace(/“|”/gm, '"');

      // destructure CSV data
      const { id, json } = data;

      // parse CSV input file data
      const parsedData = JSON.parse(json) as string[];

      // calculate side size
      const side = Math.sqrt(parsedData.length);

      // check if row data is valid (if SQRT of number of cells has decimals the data is invalid)
      if (side % 1 !== 0) {
        // this input is INVALID
        output += `${id},"[]",false` + `\n`;
      } else {
        // this input is VALID
        // so create a matrix from the parsed data
        const matrix: string[][] = [];
        // fill out our matrix array
        for (let i = 0; i < side; i++) {
          const slice = parsedData.splice(0, side);
          matrix.push(slice);
        }

        // rotate matrix
        const newMatrix = rotateOneToLeft(matrix);

        // write to output
        output += `${id},"[${newMatrix}]",true` + `\n`;
      }
    } catch (error: any) {
      console.log(error);

      console.error(`Invalid input! `, error?.message || "");
      process.exit(1);
    }
  })
  .on("end", () => {
    // write output to CSV file
    console.log(output.substring(0, output.length - 1));
    process.exit(0);
  });

// function for rotating the matrix one step to left
function rotateOneToLeft(matrix: string[][]): string[][] {
  // matrix size
  const size = matrix.length;

  // rotateable layers
  const rotateableLayers = Math.floor(size / 2);

  // loop through rotateable layers
  for (let i = 0; i < rotateableLayers; i++) {
    // identify start and end index of layer (both row and column index because of square matrix)
    const startIndex = i;
    const endIndex = size - startIndex - 1;

    // identify each layer side
    const topSide = matrix[startIndex].slice(startIndex, endIndex + 1);
    const rightSide = matrix.map((row) => row[endIndex]).slice(startIndex, endIndex + 1);
    const bottomSide = matrix[endIndex].slice(startIndex, endIndex + 1);
    const leftSide = matrix.map((row) => row[startIndex]).slice(startIndex, endIndex + 1);
    // combine all sides
    const allSides = [topSide, rightSide, bottomSide, leftSide];

    // sequencely add side items to an array for rotation
    const sequence: string[] = [];
    allSides.map((sideElements, sideIndex) => {
      if (sideIndex > 0) {
        // bottom and left sides are reversed to respect them as sequential
        if (sideIndex > 1) sideElements = sideElements.reverse();
        // remove first element of each side (except first side) to avoid duplicates
        sideElements.shift();
      }
      sequence.push(...sideElements);
    });
    // remove last elemnt because it is already added to the sequence on first layer
    sequence.pop();
    // push sequence to left
    sequence.push(sequence.shift() as string);

    // replace sides with rotated sequence
    allSides.map((sideArr, sideIndex) => {
      let side: string[] = [];
      if (sideIndex === 0) {
        // first row has no changes
        side = sequence.splice(0, sideArr.length);
      } else {
        // other rows have first element duplicated from previous row to complete each side
        side = sequence.splice(0, sideArr.length);
        const prevSide = allSides[sideIndex - 1];
        side.unshift(prevSide[prevSide.length - 1]);
      }
      // replace side with rotated sequence
      allSides[sideIndex] = side;
    });
    // add first element of first side to the end of last side to complete the cycle
    allSides[3].push(allSides[0][0]);

    // replace matrix sides with rotated sides
    // replace top side
    matrix[startIndex].splice(startIndex, endIndex - startIndex + 1, ...allSides[0]);
    // replace right side
    matrix.map((_, rowIndex) => {
      if (rowIndex >= startIndex && rowIndex <= endIndex) {
        matrix[rowIndex][endIndex] = allSides[1][rowIndex - startIndex];
      }
    });
    // replace bottom side (reversed to respect the sequence)
    allSides[2].reverse();
    matrix[endIndex].splice(startIndex, endIndex - startIndex + 1, ...allSides[2]);
    // replace left side (reversed to respect the sequence)
    allSides[3].reverse();
    matrix.map((_, rowIndex) => {
      if (rowIndex >= startIndex && rowIndex <= endIndex) {
        matrix[rowIndex][startIndex] = allSides[3][rowIndex - startIndex];
      }
    });
  }

  return matrix;
}

// // pretty print matrix
// function prettyPrintMatrix(matrix: string[][]) {
//   matrix.map((row) => {
//     let rowStr = "";
//     row.map((cell) => {
//       rowStr +=
//         cell +
//         Array(5 - String(cell).length)
//           .fill(" ")
//           .join("");
//     });
//     console.log(rowStr);
//   });
// }
