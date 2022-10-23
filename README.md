# Local Lambda Tester

Test Lambda containers in Docker Desktop.

![Sceenshot of lambda testing extension](/resources/screenshot_01.png)

## Getting Started

Build the extension from source and install in Docker Desktop:

```
make install-extension
```

Build and run your Lambda container on your machine:

```
docker build -t <MY IMAGE> .
docker run --rm -p 9000:8080 <MY IMAGE>
```

In the extension, you can select your container and start sending JSON payloads
to it.

## Development

Enable UI hot reload for UI changes:

```
docker extension dev ui-source jasmaa/local-lambda-tester http://localhost:3000

cd ui
npm start
```

Disable hot reload after testing:

```
docker extension dev reset jasmaa/local-lambda-tester
```

Update extension with changes and view in Docker Desktop:

```
make update-extension
```