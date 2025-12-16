# Use official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define volume for SQLite database
# Ideally this matches where we write the DB in server.js
# server.js default is current dir (which is /usr/src/app)
# But it's better to isolate it in a subdir if possible,
# or just rely on the mount path in K8s overriding/mapping to it.
# We'll just document that /usr/src/app (or specific file) needs persistence.

# Command to run the application
CMD [ "node", "server.js" ]
