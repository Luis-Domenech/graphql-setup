#/bin/sh

# Assumes you have setup ssh keys

# Build and Push docker image to repo
sudo docker build -t dockerUsername/repoName:latest .
sudo docker push dockerUsername/repoName:latest

# Login to VPS and pull and setup app
ssh root@serverAddress "docker image prune -a -f && docker container prune -f && docker volume prune -f && docker network prune -f && docker pull dockerUsername/repoName:latest && docker tag dockerUsername/repoName:latest dokku/api:latest && dokku tags:deploy api latest"