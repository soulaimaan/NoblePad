module.exports = {
  apps: [
    {
      name: 'belgrave-guardian',
      script: './start-belgrave-guardian.cjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/guardian-error.log',
      out_file: './logs/guardian-out.log',
      time: true,
    },
    {
      name: 'community-manager',
      script: './start-community-manager.cjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/community-error.log',
      out_file: './logs/community-out.log',
      time: true,
    },
  ],
};
