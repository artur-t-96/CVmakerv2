# 🚀 Quick Start - CV Generator B2B

## Najszybsza instalacja (5 minut)

### 1. Zainstaluj zależności

```bash
cd cv-generator-webapp
npm install
```

### 2. Skopiuj szablon firmowy

Upewnij się, że plik `szablon_firmowy.docx` jest w folderze `public/`:
```bash
ls public/szablon_firmowy.docx
```

### 3. Dodaj klucz API

Stwórz plik `.env.local`:
```bash
echo "ANTHROPIC_API_KEY=twoj-klucz-api" > .env.local
```

Zastąp `twoj-klucz-api` swoim kluczem od Anthropic (https://console.anthropic.com/)

### 4. Uruchom aplikację

```bash
npm run dev
```

### 5. Otwórz w przeglądarce

Wejdź na: **http://localhost:3000**

---

## ✅ Gotowe!

Teraz możesz:
1. Przeciągać pliki CV (PDF/DOCX)
2. Kliknąć "Generuj szablony B2B"
3. Pobrać gotowe CV w formacie B2B Network

---

## 🐛 Problemy?

### "Cannot find module '@anthropic-ai/sdk'"
```bash
npm install
```

### "ANTHROPIC_API_KEY is not defined"
Sprawdź czy plik `.env.local` istnieje i zawiera klucz API

### "Cannot read file szablon_firmowy.docx"
Skopiuj szablon do folderu `public/`

---

## 📦 Deployment na produkcję

Zobacz pełną instrukcję w pliku **DEPLOYMENT.md**

Najłatwiejszy sposób: **Vercel** (za darmo!)
1. Push kod na GitHub
2. Połącz z Vercel
3. Dodaj `ANTHROPIC_API_KEY` w ustawieniach
4. Deploy!
