# Docker-Tutorial

Caution: This tutorial is written supposed that you are installing a Node.js application 

## Dockerfile

### Basic structure of Dockerfile

- ```FROM```: Specify the base image (base image)
- ```RUN```: Run commands while creating the image
- ```COPY/ADD```: Copy files or folders to the container
- ```WORKDIR```: Set default working directory.
- ```CMD/ENTRYPOINT```: Specifies the command to be run when the container starts
- ```EXPOSE```: Opens a port so the container can receive connections

### Directory structure
```
myapp/
|-- Dockerfile
|-- app
```

### Create a simple Dockerfile

#### Step 1: Create a Docker file

First, create a file named ```Dockerfile``` in your project directory

#### Step 2: Select base image

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

#### Step 3: Create application folder in container

Set up the working directory in the container. All the following commands will be executed in this directory.

```dockerfile
# Create application folder in container
WORKDIR /usr/src/app
```

#### Step 4: Copy Files to the Container

Copy the necessary files from your local machine to the container. In this step, you can now install the necessary denpencies for the environment

```dockerfile
# Copy package.json and package-lock.json to the working directory
COPY app/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY app/ ./
```

#### Step 5: Expose Ports

Expose the port that your application will run on.

```dockerfile
# Expose the port the app runs on
EXPOSE 3000
```

#### Step 6: Define the Command to Run the Application

Specify the command to run your application when the container starts.

```dockerfile
# Define the command to run the application
CMD ["npm", "start"]
```

### How to build and run containers

1. Build Docker image: From the myapp directory (containing the dockerfile), run the command:

```bash
docker build -t my-node-app -f Dockerfile .
```

2. Run container:

```bash
docker run -d -p 3000:3000 my-node-app
```

###  Public Docker image to Docker Hub

#### Step 1: Log in to Docker Hub from Terminal
1. Use the following command to log in to Docker Hub:

```bash
docker login
```
2. Enter the username and password of the Docker Hub account.

#### Step 2: Name (tag) the Docker image
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

#### Step 3: Push image to Docker Hub
To push the image to Docker Hub, use the command:
```bash
docker push myusername/myapp:latest
```

#### Step 4: Check the image and change visibility of the image on Docker Hub
#### Step 5: Pull Image from Docker Hub on Another Machine
After the image is public, you can download it from any computer with the command:
```bash
docker pull myusername/myapp:latest
```
Then run the container as usual

### Solve Docker memory increase problem

#### Main reasons for increased Docker memory

1. Layer cache from builds
	+ Docker saves image layers for reuse in future builds.
	+ Old classes are not automatically deleted, even if you rebuild or delete the container.

2. Dangling images: Images that are not tagged or have no containers in use still exist on the system.

3. Stopped containers: Stopped containers are not automatically deleted unless you use the ```--rm``` command when running the container.

4. Volume has not been deleted: Docker stores data in volumes, even when the container is deleted. This is very useful for preserving data, but if you don't manage it well, the volume will take up a lot of memory.

5. Build cache: When building an image, Docker creates a cache for each step of the Dockerfile. If you don't clear the cache, the capacity will increase.

#### Docker memory optimization solutions

1. Clean up all redundant data
Use the command below to clean up all unused images, containers, volumes and networks
```bash
docker system prune -a --volumes
```
- ```-a```: Delete all untagged or unused images.
- ```--volumes```: Delete volumes that are no longer in use by any containers

2. Delete stopped containers
	+ List of stopped containers:
	```bash
	docker ps -a
	```
	+ Delete all stopped containers:
	```bash
	docker container prune
	```

3. Delete unnecessary images
	+ List of all images:
	```bash
	docker images
	```
	+ Delete a specific image:
	```bash
	docker rmi <image_id>
	```

4. Delete dangling images
Images without tags or no longer in use:
```bash
docker image prune
```

5. Delete volumes that are no longer in use
	+ List of volumes:
	```bash
	docker volume ls
	```
	+ Delete unused volumes:
	```bash
	docker volume prune
	```

## Docker Compose

Docker Compose is a tool used to define and manage multi-container applications in Docker. Instead of running individual containers with the docker run command, Docker Compose allows you to define the configuration of all containers in a YAML file, typically named ```docker-compose.yml```. You can then start, stop, or manage the entire application with just a few commands.

### Basic Structure of Docker Compose file

```yaml
version: '3.8'  # Specify the Docker Compose file version (ensure compatibility with your Docker Engine)

services:  # Define the services (containers) that make up your application
  service_name:  # Name of the service (e.g., "web", "db", etc.)
    image: image_name:tag  # The Docker image and its version/tag (e.g., nginx:latest)
    build:  # (Optional) If building the image from a Dockerfile, specify the context or Dockerfile
      context: ./path_to_context  # Path to the build context
      dockerfile: Dockerfile  # (Optional) Specify the Dockerfile if not named "Dockerfile"
    ports:  # Map container ports to host ports
      - "host_port:container_port"
    environment:  # Set environment variables
      - ENV_VAR_NAME=value
    volumes:  # Mount host directories or volumes into the container
      - ./local_path:/container_path
    depends_on:  # Define service dependencies (ensures this service starts after the dependencies)
      - dependent_service_name
    command:  # (Optional) Override the default command of the Docker image
      - "custom_command"

networks:  # (Optional) Specify custom networks for the services
  default:  # Define a default network or custom ones as needed
    driver: bridge  # Network driver type
```

Example:

```yaml
version: '3.8'

services:
  web:  # Define a web server service
    image: nginx:latest  # Use the official Nginx image
    ports:
      - "8080:80"  # Map host port 8080 to container port 80
    volumes:
      - ./html:/usr/share/nginx/html  # Mount local "html" folder to the Nginx HTML directory
    depends_on:
      - db  # Start the "db" service before this service

  db:  # Define a database service
    image: mysql:5.7  # Use the MySQL 5.7 image
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword  # Set root password
      - MYSQL_DATABASE=mydatabase  # Create a default database
    volumes:
      - db_data:/var/lib/mysql  # Persist MySQL data using a named volume

volumes:  # Define named volumes
  db_data:
```

Detailed Explanation of Each Section:

1. ```version```: Specifies the version of the Docker Compose file format. The most common version is 3.8. Ensure compatibility with your Docker Engine
2. ```services```: Defines the services (containers) in your application. Each service represents a container and includes its image, ports, volumes, and other settings.
3. ```image```: Specifies the Docker image to use for the service.
4. ```ports```: Maps ports from the container to the host. Structure: ```host_port:container_port```

### Start the Application
1. Open a terminal and navigate to the directory containing the ```docker-compose.yml file```.
2. Run the command:
```bash
docker-compose up
```
Use the -d flag to run in detached mode (background):
```bash
docker-compose up -d
```
### Manage Containers
- Check service status:
```bash
docker-compose ps
```
- Stop all services:
```bash
docker-compose down
```
- Remove services but retain data (volumes):
```bash
docker-compose down --volumes
```
- View logs:
```bash
docker-compose logs -f
```