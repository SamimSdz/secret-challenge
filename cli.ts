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

// initialize CSV output
let output = `id,json,is_valid\n`;

// read and modify CSV
inputStream
  .on("error", () => {
    // throw error if file does not exist
    console.error("can not read input file");
    process.exit(1);
  })
  // parse CSV
  .pipe(csv())
  .on("data", (data: IInputCsv) => {
    // Parse CSV input file data
    const { id, json } = data;
    const parsed = JSON.parse(json) as number[];

    // Check if row data is valid
    if (Math.sqrt(parsed.length) % 1 !== 0) {
      output += `${id},"[]",false` + `\n`;
    } else {
      output += `OK` + `\n`;
    }
  })
  .on("end", () => {
    console.log(output.substring(0, output.length - 1));
  });

interface IInputCsv {
  id: string;
  json: string;
}
