#/bin/sh

echo Version Number:
read VERSION

# Assumes you have setup ssh keys

# Build and Push docker image to repo
sudo docker build -t dockerUsername/repoName:$VERSION .
sudo docker push dockerUsername/repoName:$VERSION

# Login to VPS and pull and setup app
ssh root@serverAddress "docker image prune -a -f && docker container prune -f && docker volume prune -f && docker network prune -f && docker pull dockerUsername/repoName:$VERSION && docker tag dockerUsername/repoName:$VERSION dokku/api:latest && dokku tags:deploy api latest"