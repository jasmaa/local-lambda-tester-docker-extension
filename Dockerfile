FROM --platform=$BUILDPLATFORM node:18.9-alpine3.15 AS client-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
# install
COPY ui /ui
RUN npm run build

FROM alpine AS host-builder
COPY host /host

FROM alpine
LABEL org.opencontainers.image.title="Local Lambda Tester" \
    org.opencontainers.image.description="Test Lambda containers in Docker Desktop" \
    org.opencontainers.image.vendor="Jason Maa" \
    com.docker.desktop.extension.api.version=">= 0.3.0" \
    com.docker.extension.screenshots="[{\"alt\": \"Sceenshot of lambda testing extension\", \"url\": \"https://raw.githubusercontent.com/jasmaa/local-lambda-tester-docker-extension/main/resources/screenshot_01.png\"}]" \
    com.docker.extension.detailed-description="Test Lambda containers in Docker Desktop" \
    com.docker.extension.publisher-url="" \
    com.docker.extension.additional-urls="" \
    com.docker.extension.changelog=""

# COPY docker-compose.yaml .
COPY metadata.json .
COPY resources/lambda.svg icon.svg
COPY --from=client-builder /ui/build ui
COPY --from=host-builder /host host
CMD /service -socket /run/guest-services/extension-local-lambda-tester.sock
