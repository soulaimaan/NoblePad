module.exports = {
  apps: [
    {
      name: 'marketing-agent',
      script: './agents/marketing-agent-enhanced.cjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        NODE_PATH: '.',
      },
      error_file: './logs/marketing-agent-error.log',
      out_file: './logs/marketing-agent-out.log',
      time: true,
    },
    {
      name: 'banner-generator',
      script: './agents/banner-generator.cjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        NODE_PATH: '.',
      },
      error_file: './logs/banner-generator-error.log',
      out_file: './logs/banner-generator-out.log',
      time: true,
    },
  ],
};
