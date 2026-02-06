# Build stage
FROM node:18-bullseye-slim AS build
WORKDIR /app

# Build-time Vite env vars (public)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Copy package files and install dependencies (fall back to npm install if no lockfile)
COPY package*.json ./
ENV NODE_OPTIONS=--max_old_space_size=4096
RUN npm ci --silent || npm install --legacy-peer-deps --silent

# Copy rest of the app, build
COPY . .
RUN npm run build

# Production stage - nginx
FROM nginx:stable-alpine AS production
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
