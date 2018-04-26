#! /bin/bash

# Run With Sudo

INSTANCE_ID=redbox-portal_redboxportal_1
LOGPATH=$(docker inspect --format='{{.LogPath}}' $INSTANCE_ID)
RBP_PS=$(docker ps -f name=redbox-portal_redboxportal_1 -q)

docker stop $RBP_PS
cat /dev/null > $LOGPATH
docker start $RBP_PS
