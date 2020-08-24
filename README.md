 Addax

Simple HTTP proxy to serve private S3 files to authenticated clients.

## Installation

```jascript
npm install -g addax
```

## Getting started

`addax` exposes the contents of a (configurable) s3 (or MinIO) bucket to HTTP clients. The
clients trying to access the files must authenticate themselves providing a
token parameter in the url. Each token grants (recursive) access to one (and
only one) directory in the bucket. If the request does not have a token or if
the provided token does not match the directory in the requested path, the
request is denied. If the authentication is successful, `addax` will generate
the corresponding presigned s3 url for the requested file and answer with a
redirection.

The commands `addax adduser <s3-user-directory>` and `addax rmuser
<s3-user-directory>` are used to generate or remove a token for the given
directory. <s3-user-directory> is the name of the directory stored in the root
of the S3 bucket. It should not contain slashes.

```javascript
addax adduser user1
```

To generate a shareable url use `addax sign <s3-user-directory> <filepath>`.
Keep in mind that `<filepath>` should be *relative* to `<s3-user-directory>`.

```javascript
addax sign user1 some/path/file.txt
```

To start the server use `addax start <port>`.

## Requirements

`addax` uses the `aws` command line interface utilities to generate the presigned
urls. For that reason, the `aws` command must be installed on the system and
configured with the correct user account and region. The command `aws configure`
provides an interactive wizard to set up this configuration.

## Configuration

In addition to `aws`, `addax` need some configuration of its own. The host used
for the generated signed urls and the s3 bucket must be specified in the file
named `config.json` inside `addax`'s directory. This file is expected to have
the following structure:

```json
{
  "rootPath": "s3-bucket",
  "endpoint": "http://user:pass@localhost:9000",
  "host": "localhost:3000"
}
```

The property `rootPath` can take just the name of the s3
bucket(`"public-files"`), or a bucket and a path inside that bucket
(`"files/shared/public"`).

The property `endpoint` must be only included when pointing to a MinIO server.
AWS S3 will be used as default if no endpoint is specified.

The property `host` is used by the `addax sign` command to generate signed urls.
It should be the public domain or IP of the server running `addax`.

## Docker

If you want to run the app with docker just run  `docker run addax -e AWS_ACCESS_KEY_ID=youraccesskey -e AWS_SECRET_ACCESS_KEY=yoursecretaccesskey`.
**Remember** to have auth.json and config.json when you run, either way it will fail.

Also if you dont want to build the container locally you can dowload addax from DockerHub https://hub.docker.com/r/seetransparent/addax
