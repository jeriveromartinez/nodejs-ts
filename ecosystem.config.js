module.exports = {
    apps: [
        {
            name: 'base',
            script: 'dist/bootstrapper.js',
            exec_mode: 'cluster',
            instances: 'max',
            max_memory_restart: '200M',
            env: { NODE_ENV: 'production' },
        },
    ],
};
