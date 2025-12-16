# CV Generator B2B - Web Application

Profesjonalna aplikacja webowa do masowego generowania CV w formacie B2B Network v2.0.

## Funkcje

✅ Upload wielu CV jednocześnie (PDF, DOCX)
✅ Przetwarzanie przez Claude API
✅ Download gotowych szablonów B2B
✅ Responsywny interfejs
✅ Branding B2B Network

## Wymagania

- Node.js 18+ 
- Claude API Key (Anthropic)

## Instalacja

```bash
npm install
```

## Konfiguracja

Stwórz plik `.env.local`:

```
ANTHROPIC_API_KEY=twoj-klucz-api
```

## Uruchomienie lokalnie

```bash
npm run dev
```

Aplikacja będzie dostępna pod: http://localhost:3000

## Deployment na Vercel

1. Zaloguj się na https://vercel.com
2. Kliknij "Import Project"
3. Wybierz folder z aplikacją
4. Dodaj zmienną środowiskową `ANTHROPIC_API_KEY`
5. Deploy!

## Technologie

- Next.js 14 (React framework)
- Tailwind CSS (styling)
- Claude API (przetwarzanie CV)
- python-docx (generowanie DOCX)

## Struktura

```
cv-generator-webapp/
├── app/
│   ├── page.tsx          # Główny interfejs
│   ├── layout.tsx        # Layout aplikacji
│   └── api/
│       └── generate/     # API endpoint dla generowania CV
├── public/
│   ├── logo.png          # Logo B2B Network
│   └── szablon_firmowy.docx
├── components/
│   └── CVUploader.tsx    # Komponent upload
└── package.json
```

## Koszty

- Hosting: **DARMOWY** (Vercel)
- Claude API: ~$1 za CV
- 1500 CV/miesiąc = ~$1,500/miesiąc
