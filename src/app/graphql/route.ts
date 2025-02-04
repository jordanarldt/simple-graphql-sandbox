import { NextRequest } from "next/server";
import { getTokenType } from "../../lib/token";
import { TokenType } from "../../types/graphql";

export async function POST(req: NextRequest) {
  const gqlTarget = process.env.GRAPHQL_TARGET;
  const gqlToken = process.env.GRAPHQL_TOKEN;
  
  if (!gqlTarget || !gqlToken) {
    throw new Error("GRAPHQL_TARGET and GRAPHQL_TOKEN environment variables are required");
  }

  const customerId = req.headers.get("x-bc-customer-id");
  const customerIdHeader: Record<string, unknown> = customerId ? { "x-bc-customer-id": customerId } : {};
  const requestAuthHeader = req.headers.get("Authorization");
  const requestToken = requestAuthHeader?.split("Bearer ")[1];
  const authHeader = requestAuthHeader ? { Authorization: requestAuthHeader } : { Authorization: `Bearer ${gqlToken}` };
  const headers = {
    "Content-Type": req.headers.get("Content-Type") ?? "application/json",
    Accept: req.headers.get("Accept") ?? "application/json",
    ...authHeader,
    ...customerIdHeader,
  };

  if (getTokenType(requestToken ?? gqlToken) === TokenType.SIMPLE && customerId) {
    console.warn("[WARNING] You are using a simple GraphQL token but providing a customer ID. Did you mean to use a customer impersonation token?");
  }

  const resp = await fetch(gqlTarget, {
    method: "POST",
    headers,
    body: JSON.stringify(await req.json()),
  });

  return resp;
}