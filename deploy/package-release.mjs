import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { execFileSync } from "node:child_process";
const release = process.argv[2];
if (!/^release-[0-9TZ-]+$/.test(release ?? ""))
  throw new Error("Supply release-YYYYMMDDTHHMMSSZ");
const root = path.resolve("deploy-artifacts", release);
fs.mkdirSync(root, { recursive: true });
const copy = (source, target = source) => {
  const dest = path.join(root, target);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(source, dest, {
    recursive: true,
    filter: (item) => !item.endsWith(".map") && !item.endsWith(".d.ts"),
  });
};
for (const file of [
  "package.json",
  "package-lock.json",
  "client/package.json",
  "server/package.json",
  "server/dist",
  "client/dist",
  "deploy/Dockerfile",
  "deploy/nginx.conf",
  "deploy/restart-api.sh",
  "deploy/backup.sh",
  "server/.env.example",
])
  copy(file);
const bootstrap = fs
  .readFileSync("server/scripts/seeds/bootstrap-admin.ts", "utf8")
  .replaceAll("../../src/", "../../dist/");
const output = ts.transpileModule(bootstrap, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
  },
}).outputText;
const dest = path.join(root, "server/scripts/seeds/bootstrap-admin.mjs");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, output);
execFileSync(
  "tar",
  [
    "-czf",
    path.resolve("deploy-artifacts", release + ".tar.gz"),
    "-C",
    root,
    ".",
  ],
  { stdio: "inherit" },
);
console.log("Release packaged:", release);
