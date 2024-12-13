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
FROM node:16
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

## How to build and run containers

1. Build Docker image: From the myapp directory (containing the dockerfile), run the command:

```bash
docker build -t my-node-app -f Dockerfile .
```

2. Run container:

```bash
docker run -d -p 3000:3000 my-node-app
```

##  Public Docker image to Docker Hub

### Step 1: Log in to Docker Hub from Terminal
1. Use the following command to log in to Docker Hub:

```bash
docker login
```
2. Enter the username and password of the Docker Hub account.

### Step 2: Name (tag) the Docker image
Docker Hub requires images to be named in the format: ```<username>/<repository>:<tag>```
For example: If your username is ```myusername``` and you want to create a ```myapp``` repository, then you need to name the image as follows:
```bash
docker tag my-node-app myusername/myapp:latest
```
- ```my-node-app```: Local image name.
- ```myusername/myapp:latest```:
	+ ```myusername```: Docker Hub account name.
	+ ```myapp```: Name of the repository (application) you want to create.
	+ ```latest```: Tag of image version (default).

### Step 3: Push image to Docker Hub
To push the image to Docker Hub, use the command:
```bash
docker push myusername/myapp:latest
```

### Step 4: Check the image and change visibility of the image on Docker Hub
### Step 5: Pull Image from Docker Hub on Another Machine
After the image is public, you can download it from any computer with the command:
```bash
docker pull myusername/myapp:latest
```
Then run the container as usual

##  Solve Docker memory increase problem

### Main reasons for increased Docker memory

1. Layer cache from builds
- Docker saves image layers for reuse in future builds.
- Old classes are not automatically deleted, even if you rebuild or delete the container.

2. Dangling images: Images that are not tagged or have no containers in use still exist on the system.

3. Stopped containers: Stopped containers are not automatically deleted unless you use the ```--rm``` command when running the container.

4. Volume has not been deleted: Docker stores data in volumes, even when the container is deleted. This is very useful for preserving data, but if you don't manage it well, the volume will take up a lot of memory.

5. Build cache: When building an image, Docker creates a cache for each step of the Dockerfile. If you don't clear the cache, the capacity will increase.
