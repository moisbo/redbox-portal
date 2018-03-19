#! /bin/bash

RBP_PS=$(docker ps -f name=redboxportal_redbox_1 -q)

docker stop $RBP_PS
docker start $RBP_PS

