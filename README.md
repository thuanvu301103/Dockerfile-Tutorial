# Dockerfile-Tutorial

Caution: This tutorial is written supposed that you are installing a Node.js application 

## Basic structure of Dockerfile

- ```FROM```: Specify the base image (base image)
- ```RUN```: Run commands while creating the image
- ```COPY/ADD```: Copy files or folders to the container
- ```WORKDIR```: Set default working directory.
- ```CMD/ENTRYPOINT```: Specifies the command to be run when the container starts
- ```EXPOSE```: Opens a port so the container can receive connections

## Directory structure
```
myapp/
|-- Dockerfile
|-- app
```

## Create a simple Dockerfile

### Step 1: Create a Docker file

First, create a file named ```Dockerfile``` in your project directory

### Step 2: Select base image

Base image is the foundation of your application. Base images are loaded from Docker Hub, which is the most popular registry for storing and sharing Docker images. For example: node, python, ubuntu, nginx, etc.

```dockerfile
# Using Node.js version 16
FROM node: 16
```
Base Image Classification
- Official Base Images (Official Image): Provided and maintained by Docker or reputable organizations. For example:
	+ ```ubuntu:``` Provides the Ubuntu operating system.
	+ ```python```: Includes Python and necessary tools.
	+ ```node```: Includes Node.js and npm.
- Minimal Base Images: Images are optimized for capacity and contain only basic components. For example:
	+ ```alpine```: A lightweight Linux image (~5MB), suitable for small applications.
- Custom Base Images (Custom Image): Built by users to serve specific needs. For example: A base image contains company-specific tools or libraries.

### Step 3: Create application folder in container

Set up the working directory in the container. All the following commands will be executed in this directory.

```dockerfile
# Create application folder in container
WORKDIR /usr/src/app
```

### Step 4: Copy Files to the Container

Copy the necessary files from your local machine to the container. In this step, you can now install the necessary denpencies for the environment

```dockerfile
# Copy package.json and package-lock.json to the working directory
COPY app/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY app/ ./
```

### Step 5: Expose Ports

Expose the port that your application will run on.

```dockerfile
# Expose the port the app runs on
EXPOSE 3000
```

### Step 6: Define the Command to Run the Application

Specify the command to run your application when the container starts.

```dockerfile
# Define the command to run the application
CMD ["npm", "start"]
```
