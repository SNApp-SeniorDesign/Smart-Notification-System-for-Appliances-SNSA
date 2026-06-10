FROM ghcr.io/astral-sh/uv:python3.12-slim AS builder
WORKDIR /app

ENV UV_NO_CACHE=1
ENV PYTHONPATH=/app/src

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project
COPY src ./src
RUN uv sync --frozen

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]