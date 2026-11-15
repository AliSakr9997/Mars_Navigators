FROM node:22-alpine AS ui
WORKDIR /ui
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build
FROM python:3.12-slim
WORKDIR /app
COPY server/requirements.txt server/requirements.txt
COPY planner/requirements.txt planner/requirements.txt
RUN pip install --no-cache-dir -r server/requirements.txt -r planner/requirements.txt
COPY server server
COPY planner planner
COPY --from=ui /ui/dist client/dist
CMD ["sh","-c","uvicorn --app-dir server mission_gateway:app --host 0.0.0.0 --port ${PORT:-8000}"]
