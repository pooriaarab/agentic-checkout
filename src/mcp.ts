import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createPaymentLink, getPaymentLinkStatus } from "./core.js";
const result=(value:unknown)=>({content:[{type:"text" as const,text:JSON.stringify(value)}]});
export function createMcpServer() { const server=new McpServer({name:"agentic-checkout",version:"0.1.0"}); server.registerTool("create_payment_link",{description:"Create a Stripe Checkout payment link. Dry run is the default.",inputSchema:{priceId:z.string(),quantity:z.number().int().min(1).optional(),successUrl:z.string().optional(),dryRun:z.boolean().optional()}},async input=>{try{return result(await createPaymentLink(input));}catch(error){return {...result({error:error instanceof Error?error.message:String(error)}),isError:true};}}); server.registerTool("get_payment_link_status",{description:"Read a Stripe payment link status. Dry run is the default.",inputSchema:{id:z.string(),dryRun:z.boolean().optional()}},async input=>{try{return result(await getPaymentLinkStatus(input.id,{dryRun:input.dryRun}));}catch(error){return {...result({error:error instanceof Error?error.message:String(error)}),isError:true};}}); return server; }
export async function startMcp(){const server=createMcpServer();await server.connect(new StdioServerTransport());}
