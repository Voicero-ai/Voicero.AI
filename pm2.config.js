module.exports = {
  apps: [
    {
      name: "nextjs-app",
      script: "server.js",
      instances: "max", // Use all available CPUs
      exec_mode: "cluster",
      max_memory_restart: "2G", // Increased for long-running tasks
      // Increase timeout for long-running requests
      kill_timeout: 60000, // Increased to 60 seconds
      // Wait time before force reload
      wait_ready: true,
      // Graceful shutdown
      shutdown_with_message: true,
      env: {
        NODE_ENV: "production",
        NEXT_RUNTIME: "nodejs",
        // Increase timeouts for long-running tasks
        API_TIMEOUT: "300000", // 5 minutes
        NEXT_SERVER_MAX_HEADER_SIZE: "32768",
      },
    },
  ],
};
