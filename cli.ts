import fs from "fs";

import csv from "csv-parser";

if (process.argv.length < 3) {
  console.error("Please specify input CSV file");
  process.exit(1);
}

const filePath = process.argv[2];
const inputStream = fs.createReadStream(filePath);

inputStream
  .pipe(csv({}))
  .on("data", (data: IInputCsv) => {
    const { id, json } = data;
    console.log(id, JSON.parse(json));
  })
  .on("end", () => {
    console.log("Finished reading the CSV file.");
  });

interface IInputCsv {
  id: string;
  json: string;
}
