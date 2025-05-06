module.exports = {
   apps: [
      {
         name: "whatsapp-integration", // Name shown in PM2
         script: "main.js", // Entry point of your app
         watch: false, // Optional: Set to true if you want to watch file changes
         instances: 1, // Number of instances (1 is fine for a dev tool like this)
         autorestart: true, // Restart on crash
         env: {
            NODE_ENV: "development",
            PORT: 5000,
         },
         env_production: {
            NODE_ENV: "production",
            PORT: 5000,
         },
      },
   ],
};
