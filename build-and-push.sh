#!/bin/bash

# Source the environment variables
set -o allexport
source .env
set +o allexport

# Exit on error
set -e

# Variables
VERSION=${1:-'prod'}
DOCKER_IMAGE=ianfrye/movie-convert
DOCKER_BUILD_CONTEXT=.

# Show usage if help is requested
if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
  echo "Usage: $0 [VERSION]"
  echo "  VERSION: Docker image tag version (default: prod)"
  echo ""
  echo "Examples:"
  echo "  $0 v2.6.9          # Build and push with version v2.6.9"
  echo "  $0 latest          # Build and push with version latest"
  echo "  $0                 # Build and push with default version prod"
  exit 0
fi


#  Build the docker image
echo "Building docker image $DOCKER_IMAGE:$VERSION"

docker buildx build --platform linux/amd64,linux/arm64 -t $DOCKER_IMAGE:$VERSION $DOCKER_BUILD_CONTEXT --no-cache

echo "Finished building docker image $DOCKER_IMAGE:$VERSION"

# Push the docker image to the registry
echo "Pushing docker image $DOCKER_IMAGE:$VERSION"

docker push $DOCKER_IMAGE:$VERSION

echo "Docker push complete"

# Clean up
docker buildx prune -a -f
docker image prune -a -f