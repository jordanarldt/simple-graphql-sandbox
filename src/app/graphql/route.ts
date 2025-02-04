import { NextRequest } from "next/server";
import { getTokenType } from "../../lib/token";
import { TokenType } from "../../types/graphql";

const customerAccessTokenHeaderName = "x-bc-customer-access-token";
const customerIdHeaderName = "x-bc-customer-id";

function getCustomerHeader(headers: Headers): Record<string, string> {
  const customerId = headers.get("x-bc-customer-id");
  const customerAccessToken = headers.get("x-bc-customer-access-token");

  if (customerId && customerAccessToken) {
    console.warn("[WARNING] You are providing both a customer ID and a customer access token. You can only use one. The customer access token will be used.");

    return { [customerAccessTokenHeaderName]: customerAccessToken };
  }

  if (customerId) {
    return { [customerIdHeaderName]: customerId };
  }

  if (customerAccessToken) {
    return { [customerAccessTokenHeaderName]: customerAccessToken };
  }

  return {};
}

export async function POST(req: NextRequest) {
  const gqlTarget = process.env.GRAPHQL_TARGET;
  const gqlToken = process.env.GRAPHQL_TOKEN;
  
  if (!gqlTarget || !gqlToken) {
    throw new Error("GRAPHQL_TARGET and GRAPHQL_TOKEN environment variables are required");
  }

  const requestAuthHeader = req.headers.get("Authorization");
  const requestToken = requestAuthHeader?.split("Bearer ")[1];
  const authHeader = requestAuthHeader ? { Authorization: requestAuthHeader } : { Authorization: `Bearer ${gqlToken}` };
  const customerHeader = getCustomerHeader(req.headers);
  const headers = {
    "Content-Type": req.headers.get("Content-Type") ?? "application/json",
    Accept: req.headers.get("Accept") ?? "application/json",
    ...authHeader,
    ...customerHeader,
  };

  if (getTokenType(requestToken ?? gqlToken) === TokenType.SIMPLE && customerIdHeaderName in customerHeader) {
    console.warn("[WARNING] You are using a simple GraphQL token but providing a customer ID. Did you mean to use a customer impersonation token?");
  }

  const resp = await fetch(gqlTarget, {
    method: "POST",
    headers,
    body: JSON.stringify(await req.json()),
  });

  return resp;
}