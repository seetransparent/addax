# Addax

Simple HTTP proxy to serve private S3 files to authenticated clientes.

## Installation

```jascript
npm install -g addax
```

## Getting started

`addax` exposes the contentes of a (configurable) directory in S3 that act as
the general root. The clients trying to access the files must authenticate
themselves providing a token parameter in the url. Each token grants access to
one (and only one) directory in the general root and all its subdirectories. If
the request does not have a token or if the provided token does not match the
directory in the file path, the request is denied. If the authentication is
successful, `addax` will generate the corresponding s3 url for the requested
file and answer with a redirection.

The commands `addax adduser <s3-user-directory>` and `addax rmuser
<s3-user-directory>` are used to generate or remove a token for the given
directory.

To generate a shareable url use `addax sign <s3-user-directory> <filepath>`.
Keep in mind that `<filepath>` should be *relative* to `<s3-user-directory>`.

To start the server use `addax start <port>`.

## Configuration

The host used for the generated signed urls and the general s3 root path must be
specified in the file `config.json`.

```json
{
  "rootPath": "root-s3-path",
  "host": "localhost:3000"
}
```
