#! /bin/sh
MONGO_PS=$(docker ps -f name=redboxportal_mongodb_1 -q)
docker exec -it $MONGO_PS /bin/sh -c "mongo 'redbox-portal' --eval 'db.workspaceapp.drop();'"

RBP_PS=$(docker ps -f name=redboxportal_redboxportal_1 -q)
docker stop  $RBP_PS
docker start  $RBP_PS
