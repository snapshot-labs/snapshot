#!/bin/bash

echo $(pwd)

docker --version
aws --version

echo $TRAVIS_COMMIT
commit=$(git rev-parse --short=7 $TRAVIS_COMMIT)

accountID=$(aws sts get-caller-identity --output text --query 'Account')
regionID=us-west-2
application=governance
registryURL="zilliqa/$application"

#eval "$(aws ecr get-login --no-include-email --region $regionID)"
echo "$DOCKER_API_TOKEN" | docker login -u "$DOCKER_USERNAME" --password-stdin

rm -rf "$application"-artifact
mkdir -p "$application"-artifact/build/

docker build --build-arg REACT_APP_DEPLOY_ENV="stg" -t "tempimagebuild:$commit" .
docker create --name extractbuild "tempimagebuild:$commit"
docker cp extractbuild:/usr/share/nginx/html/. $(pwd)/"$application"-artifact/build/
docker rm extractbuild
docker push "$registryURL"

cd "$application"-artifact
cd build
echo $commit > "$application"-artifact-commit.txt
zip -r "$application"-artifact.zip .
aws s3 sync . s3://"$application"-static-artifact --exclude='*' --include=''"$application"'-artifact.zip'

cd ..
echo $(date) > date_created.txt
aws s3 sync . s3://"$application"-static-artifact --exclude='*' --include='date_created.txt'
