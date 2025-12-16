# Instrukcja Deployment - CV Generator B2B

## 📦 Wymagania systemowe

### Na serwerze/komputerze z deployment:
- Node.js 18 lub wyższy
- Python 3.8 lub wyższy
- Pakiety systemowe:
  ```bash
  # Ubuntu/Debian
  sudo apt-get update
  sudo apt-get install -y python3 python3-pip poppler-utils
  
  # macOS
  brew install python poppler
  ```

### Pakiety Python:
```bash
pip3 install python-docx lxml mammoth
```

---

## 🚀 Deployment na Vercel (REKOMENDOWANE - za darmo!)

### Krok 1: Przygotowanie kodu

1. Skopiuj cały folder `cv-generator-webapp` do swojego GitHuba:
   ```bash
   cd cv-generator-webapp
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/twoj-user/cv-generator.git
   git push -u origin main
   ```

### Krok 2: Deploy na Vercel

1. Wejdź na https://vercel.com i zaloguj się
2. Kliknij **"Add New Project"**
3. Zaimportuj repozytorium z GitHub
4. Vercel automatycznie wykryje Next.js
5. **WAŻNE:** Dodaj zmienne środowiskowe:
   - Kliknij "Environment Variables"
   - Dodaj:
     - Key: `ANTHROPIC_API_KEY`
     - Value: `twój-klucz-api-od-anthropic`
6. Kliknij **"Deploy"**

### Krok 3: Konfiguracja Python na Vercel

⚠️ **PROBLEM:** Vercel nie obsługuje Python out-of-the-box dla Next.js

**ROZWIĄZANIE - 2 opcje:**

#### Opcja A: Przepisanie generatora na Node.js (ZALECANE)
Użyj biblioteki `docx` w Node.js zamiast Python. Wymaga przepisania `generate_cv.py`.

#### Opcja B: Użyj zewnętrznego serwisu dla Python
Deploy Python backend osobno (np. Railway, Render) i wywołuj go z Next.js.

---

## 🐳 Deployment na VPS z Dockerem

### Dockerfile

Stwórz `Dockerfile` w głównym folderze:

```dockerfile
FROM node:18-alpine

# Instaluj Python i zależności systemowe
RUN apk add --no-cache python3 py3-pip poppler-utils

# Instaluj pakiety Python
RUN pip3 install python-docx lxml mammoth --break-system-packages

WORKDIR /app

# Kopiuj pliki package
COPY package*.json ./
RUN npm ci

# Kopiuj resztę aplikacji
COPY . .

# Build Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

Stwórz `docker-compose.yml`:

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    restart: unless-stopped
```

### Deploy:

```bash
# Skopiuj .env.example do .env i wypełnij
cp .env.example .env
nano .env  # Dodaj swój API key

# Build i uruchom
docker-compose up -d

# Sprawdź logi
docker-compose logs -f
```

---

## 🖥️ Deployment na własnym serwerze (Ubuntu)

### Krok 1: Instalacja zależności

```bash
# Aktualizuj system
sudo apt-get update
sudo apt-get upgrade -y

# Instaluj Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instaluj Python i pakiety
sudo apt-get install -y python3 python3-pip poppler-utils
pip3 install python-docx lxml mammoth --break-system-packages

# Instaluj PM2 (process manager)
sudo npm install -g pm2
```

### Krok 2: Deploy aplikacji

```bash
# Skopiuj aplikację na serwer
cd /var/www
sudo git clone https://github.com/twoj-user/cv-generator.git
cd cv-generator

# Instaluj zależności
npm ci

# Stwórz .env
sudo nano .env
# Dodaj: ANTHROPIC_API_KEY=twoj-klucz

# Build aplikacji
npm run build

# Uruchom z PM2
pm2 start npm --name "cv-generator" -- start
pm2 save
pm2 startup
```

### Krok 3: Konfiguracja Nginx (opcjonalnie)

```bash
# Instaluj Nginx
sudo apt-get install -y nginx

# Konfiguracja
sudo nano /etc/nginx/sites-available/cv-generator
```

Dodaj:
```nginx
server {
    listen 80;
    server_name cv-generator.twoja-domena.pl;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktywuj:
```bash
sudo ln -s /etc/nginx/sites-available/cv-generator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Zabezpieczenia (jeśli chcesz dodać później)

### Dodanie prostego hasła

Stwórz middleware w `middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || authHeader !== 'Bearer twoje-haslo-zespolu') {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/',
}
```

---

## 📊 Monitoring kosztów

Aby monitorować użycie Claude API:

1. Wejdź na https://console.anthropic.com/settings/usage
2. Ustaw alerty kosztów
3. Sprawdzaj codziennie użycie

**Szacunkowe koszty dla 1500 CV/miesiąc:**
- Claude Sonnet 4: ~$1,500/miesiąc
- Hosting Vercel: $0 (darmowy tier)
- **TOTAL: ~$1,500/miesiąc**

---

## 🐛 Troubleshooting

### Błąd: "Module not found: python-docx"
```bash
pip3 install python-docx lxml --break-system-packages
```

### Błąd: "ANTHROPIC_API_KEY not found"
Sprawdź czy `.env` jest poprawnie skonfigurowany i zrestartuj aplikację.

### Błąd: "pdftotext: command not found"
```bash
sudo apt-get install poppler-utils
```

### Aplikacja działa ale nie generuje CV
Sprawdź logi:
```bash
# Jeśli PM2
pm2 logs cv-generator

# Jeśli Docker
docker-compose logs -f
```

---

## 📞 Wsparcie

Jeśli masz problemy z deployment:
1. Sprawdź logi aplikacji
2. Sprawdź czy wszystkie zmienne środowiskowe są ustawione
3. Sprawdź czy Python i Node.js są zainstalowane
4. Zweryfikuj czy szablon_firmowy.docx jest w folderze `public/`

---

## ✅ Checklist przed uruchomieniem

- [ ] Node.js 18+ zainstalowany
- [ ] Python 3.8+ zainstalowany
- [ ] Pakiety Python zainstalowane (python-docx, lxml, mammoth)
- [ ] poppler-utils zainstalowany (dla PDF)
- [ ] Klucz API Claude dodany do `.env`
- [ ] Szablon firmowy w `public/szablon_firmowy.docx`
- [ ] Aplikacja zbudowana (`npm run build`)
- [ ] Port 3000 dostępny (lub inny skonfigurowany)
