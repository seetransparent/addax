FROM node:8.15.1-stretch

WORKDIR /app
ENTRYPOINT ["bash", "entrypoint.sh"]
CMD ["addax", "start", "80"]

RUN set -ex \
  && apt-get update \
  && apt-get install -y awscli

COPY server.js package.json package-lock.json index.js authentication.js entrypoint.sh /app/
ENV AWS_DEFAULT_REGION=eu-central-1
RUN set -ex \
  && aws configure set default.s3.signature_version s3v4 \
  && npm install -g addax 