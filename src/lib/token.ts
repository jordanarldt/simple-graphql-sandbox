import { decode } from "jsonwebtoken";
import { TokenType } from "../types/graphql";

export function getTokenType(jwt: string): TokenType {
  const decoded = decode(jwt) as Record<string, unknown>;

  if (decoded && "token_type" in decoded) {
    switch (decoded.token_type) {
      case 1: return TokenType.SIMPLE;
      case 2: return TokenType.CUSTOMER_IMPERSONATION;
      default:
        throw new Error("Invalid token type received in the JWT");
    }
  } else {
    throw new Error("Invalid token type received in the JWT");
  }
}