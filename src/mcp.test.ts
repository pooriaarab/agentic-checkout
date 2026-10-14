import { describe, expect, it } from "vitest";
import { createMcpServer } from "./mcp.js";
describe("mcp",()=>it("creates server",()=>expect(createMcpServer()).toBeDefined()));
