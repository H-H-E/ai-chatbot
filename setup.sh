#!/bin/bash

# Setup script for enhanced token counting and rate limiting

echo "Installing required packages..."

# Install Langchain packages for token counting
pnpm add @langchain/openai @langchain/anthropic

# Optional: Install Redis package for production rate limiting
# Uncomment the line below if you want to use Redis-based rate limiting
# pnpm add @upstash/redis

echo "Setting up environment variables..."
# Check if .env exists, if not create it
if [ ! -f .env ]; then
  touch .env
  echo "Created .env file"
fi

# Add model API keys if they don't exist
grep -q "ANTHROPIC_API_KEY" .env || echo "ANTHROPIC_API_KEY=your_api_key_here" >> .env

# Optional: Add Redis configuration
# Uncomment these lines if you want to use Redis-based rate limiting
# grep -q "REDIS_URL" .env || echo "REDIS_URL=your_redis_url_here" >> .env
# grep -q "REDIS_TOKEN" .env || echo "REDIS_TOKEN=your_redis_token_here" >> .env

echo "Setup completed!"
echo "Remember to update your API keys in the .env file."
echo "For production, consider using Redis-based rate limiting by uncommenting the relevant sections in setup.sh and lib/redis-rate-limit.ts" 