import { type } from 'os';

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.module.rules.push({
            test: /\.py$/,
            type: 'asset/source',
        });

        return config;
    }
};

export default nextConfig;
