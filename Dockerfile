# Use the official Node.js image from the Docker Hub as the base image
FROM node:22-alpine3.19 AS base

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .


# --- Development Stage ---
FROM base AS dev
EXPOSE 5000
CMD ["sh", "-c", "npm start"]

# --- Production Build Stage ---
FROM base AS build
RUN npm run build

# --- Production Build Stage ---
FROM node:22-alpine3.19 AS prod
WORKDIR /app
COPY --from=build /app/build ./build
RUN npm install -g serve
EXPOSE 5000
CMD ["sh", "-c", "serve -p 5000 -s build"]
