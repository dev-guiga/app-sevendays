# API Sevendays

API Rails seguindo Rails Way, com foco em consistencia, testes e boas praticas.

## Stack
- Ruby + Rails
- MySQL
- Devise (auth)
- Pundit (autorizacao)

## Setup rapido

### 1) Variaveis de ambiente (opcional)
As configs tem defaults para desenvolvimento. Se quiser customizar:

- `DATABASE_HOST` (default: `127.0.0.1`)
- `DATABASE_PORT` (default: `3306`)
- `DATABASE_USERNAME` (default: `sevendays_api`)
- `DATABASE_PASSWORD` (default: `mysql`)
- `DATABASE_NAME` (default: `api_sevendays_development`)
- `DATABASE_NAME_TEST` (default: `api_sevendays_test`)
- `DATABASE_NAME_REPLICA` (default: `api_sevendays_replica_development`)
- `DATABASE_USERNAME_REPLICA` (default: `sevendays_api_replica`)
- `DATABASE_PASSWORD_REPLICA` (default: `mysql`)
- `DATABASE_HOST_REPLICA` (default: `127.0.0.1`)
- `DATABASE_PORT_REPLICA` (default: `3307`)
- `ENABLE_DB_REPLICA` (default: `false`; use `true` somente com replicacao real configurada)
- `CORS_ORIGINS` (default: `http://localhost:3000,http://127.0.0.1:3000`)

### 2) Dependencias
```bash
bundle install
```

### 3) Banco
```bash
bin/rails db:prepare
```

### 4) Rodar a API
```bash
bin/rails s
```

## Docker (MySQL)
```bash
docker-compose up -d
```

## Testes
```bash
bundle exec rspec
```

## Endpoints principais

### Auth (Devise)
- `POST /api/users/sign_in`
- `DELETE /api/users/sign_out`
- `POST /api/users/password`
- `PUT /api/users/password`

### Usuarios
- `POST /api/users` (signup)
- `GET /api/user` (current user)

### Owner Diary
- `POST /api/owner/diary`
- `GET /api/owner/diary`
- `PATCH /api/owner/diary`

### Owner Schedulings
- `POST /api/owner/diary/schedulings`
- `PATCH /api/owner/diary/schedulings/:id`

## Exemplos de requests

### Signup
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "first_name": "Ana",
      "last_name": "Silva",
      "username": "anas",
      "email": "ana@example.com",
      "password": "password123",
      "password_confirmation": "password123",
      "cpf": "12345678901",
      "birth_date": "1990-01-01",
      "status": "owner",
      "address_attributes": {
        "address": "Rua A, 123",
        "city": "Sao Paulo",
        "state": "SP",
        "neighborhood": "Centro"
      }
    }
  }'
```

### Sign in
```bash
curl -X POST http://localhost:3000/api/users/sign_in \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "email": "ana@example.com",
      "password": "password123"
    }
  }'
```

### Current user
```bash
curl -X GET http://localhost:3000/api/user \
  -H "Content-Type: application/json" \
  --cookie "_api_sevendays_session=SEU_COOKIE"
```

### Criar diary (owner)
```bash
curl -X POST http://localhost:3000/api/owner/diary \
  -H "Content-Type: application/json" \
  --cookie "_api_sevendays_session=SEU_COOKIE" \
  -d '{
    "diary": {
      "title": "My Diary",
      "description": "A long enough description."
    },
    "scheduling_rules": {
      "start_time": "09:00",
      "end_time": "10:00",
      "session_duration_minutes": 60,
      "week_days": [1,3,5],
      "start_date": "2026-01-29",
      "end_date": "2026-02-05"
    }
  }'
```

### Erros padronizados
Todas as respostas de erro seguem:
```json
{ "error": { "code": "...", "message": "...", "details": "..." } }
```

## CI
- Lint: RuboCop
- Security: Brakeman + bundler-audit
- Tests: RSpec
