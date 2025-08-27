# Stage 1: The Builder Stage
# This stage is responsible for installing ALL dependencies and building the application.
# It uses the full node image as it's discarded later.
FROM node:20 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the package files first to leverage Docker's layer caching.
# This makes subsequent builds much faster if these files don't change.
COPY package*.json ./

# Install all dependencies (including dev dependencies for build process)
# Using `npm ci` for consistent builds.
RUN npm ci

# Copy the entire source code after dependencies are installed
COPY . .

# Run the build command as defined in your package.json.
# This is a resource-intensive step and is handled once here.
RUN npm run build

# Stage 2: The Production Stage
# This stage creates a lean, production-ready image.
# Using a smaller alpine image to reduce final size.
FROM node:20-alpine AS production

# Set the working directory
WORKDIR /app

# Copy package.json to the production stage
# This is needed for the production dependency installation.
COPY package*.json ./

# Install ONLY production dependencies to keep the image small
# and to ensure a clean slate without dev dependencies.
RUN npm ci --omit=dev

# Copy the entire built application from the builder stage
# This includes the build output (dist) and all other necessary files
# from the `/app` directory.
COPY --from=builder /app/ ./

# Expose the correct port for the application to be accessible
EXPOSE 3000

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["npm", "start"]
