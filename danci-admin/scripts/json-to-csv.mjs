import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultInputPath = path.join(scriptDirectory, "PEPXiaoXue6_1.json");
const inputPath = path.resolve(process.argv[2] ?? defaultInputPath);
const parsedInputPath = path.parse(inputPath);
const outputPath = path.resolve(
  process.argv[3] ?? path.join(parsedInputPath.dir, `${parsedInputPath.name}.csv`),
);

function parseRecords(source, filename) {
  const trimmed = source.trim();

  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith("[")) {
    const value = JSON.parse(trimmed);
    if (!Array.isArray(value)) {
      throw new Error(`${filename} 的顶层数据不是数组`);
    }
    return value;
  }

  return trimmed.split(/\r?\n/).map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`${filename} 第 ${index + 1} 行不是有效 JSON：${message}`);
    }
  });
}

function assertRecord(record, index) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    throw new Error(`第 ${index + 1} 条数据必须是 JSON 对象`);
  }

  for (const field of ["wordRank", "headWord", "content", "bookId"]) {
    if (!(field in record)) {
      throw new Error(`第 ${index + 1} 条数据缺少字段 ${field}`);
    }
  }
}

function escapeCsv(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

const source = await readFile(inputPath, "utf8");
const records = parseRecords(source, path.basename(inputPath));

const rows = records.map((record, index) => {
  assertRecord(record, index);
  return [
    record.wordRank,
    record.headWord,
    JSON.stringify(record.content),
    record.bookId,
  ].map(escapeCsv).join(",");
});

const header = ["wordRank", "headWord", "content", "bookId"].join(",");
const csv = `\uFEFF${[header, ...rows].join("\r\n")}\r\n`;

await writeFile(outputPath, csv, "utf8");

console.log(`转换完成：${records.length} 条记录`);
console.log(`输出文件：${outputPath}`);
