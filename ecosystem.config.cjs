module.exports = {
  apps: [
    {
      name: "creditremovers-app",
      cwd: __dirname,
      script: "server/index.js",
      exec_mode: "fork",
      instances: 1,
      watch: false,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: process.env.PORT || "4174",
      },
    },
  ],
};
