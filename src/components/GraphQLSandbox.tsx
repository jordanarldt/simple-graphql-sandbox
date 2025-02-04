"use client";

import Script from "next/script";

function embedSandbox() {
  if ("EmbeddedSandbox" in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (window.EmbeddedSandbox as any)({
      target: "#sandbox",
      initialEndpoint: `${window.location.href}graphql`,
      initialState: {
        pollForSchemaUpdates: false,
      },
    })
  }
}
export const GraphQLSandbox = () => {
  return (
    <>
      <div id="sandbox" className="absolute top-0 bottom-0 left-0 right-0"></div>
      <Script
        src="https://embeddable-sandbox.cdn.apollographql.com/_latest/embeddable-sandbox.umd.production.min.js"
        onLoad={embedSandbox}
      />
    </>
  );
};
