// @ts-check
import { spawnSync } from "node:child_process";
import { serwist } from "@serwist/next/config";
import crypto from "node:crypto";

const revision = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout ?? crypto.randomUUID();

export default serwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});
