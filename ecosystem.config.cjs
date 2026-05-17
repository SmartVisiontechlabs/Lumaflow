module.exports = {
  apps: [
    {
      name: "lumaflow-backend",
      script: "server/index.ts",
      // Using tsx to execute the typescript file without manual compilation
      interpreter: "./node_modules/.bin/tsx",
      instances: 1, // Change to 'max' for cluster mode if needed
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3001,
      }
    }
  ]
};
