import { describe, expect, it, vi } from "vitest";
import { runCli } from "./cli.js";
describe("cli",()=>{it("defaults create to dry run",async()=>{const log=vi.spyOn(console,"log").mockImplementation(()=>{});expect(await runCli(["create","--price","price_fixture"])).toBe(0);expect(log).toHaveBeenCalledWith(expect.stringContaining('"dryRun":true'));log.mockRestore();});});
