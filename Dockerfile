# Using Node.js version 16
FROM node:16

# Create application folder in container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY app/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY app/ ./

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "start"]