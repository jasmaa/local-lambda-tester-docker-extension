# Local Lambda Tester

Test Lambda containers in Docker Desktop.

![Sceenshot of lambda testing extension](/resources/screenshot_01.png)

## Getting Started

Install the extension in Docker Desktop.

Build and run your Lambda container on your machine:

```
docker build -t <MY IMAGE> .
docker run --rm -p 9000:8080 <MY IMAGE>
```

In the extension, you can select your container and start sending JSON payloads
to it.

## Development

Build the extension from source and install:

```
make install-extension
```

Enable UI hot reload:

```
docker extension dev ui-source jasmaa/local-lambda-tester http://localhost:3000
```

Disable after testing:

```
docker extension dev reset jasmaa/local-lambda-tester
```