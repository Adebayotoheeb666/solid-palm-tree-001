# Stage 1: The Builder Stage
# This stage is responsible for installing ALL dependencies and building the application.
FROM node:20 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the package files first to leverage Docker's layer caching.
# This makes subsequent builds much faster if these files don't change.
COPY package*.json ./

# Install all dependencies (including dev dependencies like Vite or Next.js)
RUN npm ci --legacy-peer-deps

# Copy the entire source code after dependencies are installed
COPY . .

# Run the build command as defined in your package.json
RUN npm run build

# Stage 2: The Production Stage
# This stage creates a lean, production-ready image.
FROM node:20 AS production

# Set the working directory
WORKDIR /app

# Copy package.json to the production stage
COPY package*.json ./

# Install ONLY production dependencies to keep the image small
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy the entire application from the builder stage
# This includes the build output (dist) and all other necessary files
COPY --from=builder /app/ ./

# Expose the correct port for the application to be accessible
EXPOSE 3000

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["npm", "start"]
