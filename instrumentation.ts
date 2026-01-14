export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Fix for custom fetch failures in Node 20+ (Happy Eyeballs / IPv6 issues)
    // We replace the global dispatcher to force IPv4
    try {
      const { setGlobalDispatcher, Agent } = await import("undici");
      const agent = new Agent({
        connect: {
          family: 4,
        },
      });
      setGlobalDispatcher(agent);
      console.log(
        "Instrumentation: Enforced IPv4 for Undici/Fetch successfully."
      );
    } catch (error) {
      console.error(
        "Instrumentation: Failed to configure Undici IPv4 agent.",
        error
      );
    }
  }
}
