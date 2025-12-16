# 🏗️ Architektura CV Generator B2B

## Diagram przepływu danych

```
┌─────────────────────────────────────────────────────────────┐
│                      UŻYTKOWNIK (30 osób)                    │
│                                                               │
│  1. Przeciąga CV (PDF/DOCX) → Przeglądarka                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js + React)                 │
│                                                               │
│  • Upload CV files (drag & drop)                            │
│  • Progress tracking UI                                      │
│  • Download results                                          │
│  • Tailwind CSS (branding B2B)                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP POST /api/generate
                         │ FormData (file)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Next.js API Routes)                 │
│                                                               │
│  2. Odbiera plik CV                                          │
│  3. Ekstraktuje tekst:                                       │
│     • PDF → pdf-parse                                        │
│     • DOCX → mammoth                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Tekst CV
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   CLAUDE API (Anthropic)                     │
│                                                               │
│  4. Analizuje CV i wyodrębnia:                              │
│     • Dane osobowe (imię, nazwisko)                         │
│     • Stanowisko                                             │
│     • Doświadczenie zawodowe                                 │
│     • Umiejętności                                           │
│     • Edukacja                                               │
│     • Certyfikaty                                            │
│     • Języki                                                 │
│                                                               │
│  5. Zwraca strukturalny JSON                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ JSON z danymi
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              GENERATOR DOCX (Python lub Node.js)             │
│                                                               │
│  6. Kopiuje szablon_firmowy.docx jako bazę                  │
│  7. Wypełnia szablon danymi:                                 │
│     • Nagłówek główny (stanowisko + imię)                   │
│     • DLACZEGO [IMIĘ] (marketing points)                    │
│     • EDUKACJA (tabela)                                      │
│     • UMIEJĘTNOŚCI (bullet points)                          │
│     • CERTYFIKATY                                            │
│     • JĘZYKI                                                 │
│     • DOŚWIADCZENIE                                          │
│     • RODO                                                   │
│  8. Zachowuje header/footer z logo                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ DOCX file (binary)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND RESPONSE                        │
│                                                               │
│  9. Zwraca DOCX jako download                               │
│     Content-Type: application/vnd.openxml...                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Response (DOCX)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                         UŻYTKOWNIK                           │
│                                                               │
│  10. Pobiera gotowe CV w formacie B2B                       │
│  11. Otwiera w Microsoft Word                               │
│  12. Poprawia jeśli trzeba                                  │
│  13. Wysyła do klienta ✅                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Komponenty systemu

### 1. Frontend (React/Next.js)
**Lokalizacja:** `app/page.tsx`  
**Odpowiedzialność:**
- UI/UX dla użytkowników
- Upload plików (drag & drop)
- Wyświetlanie statusu przetwarzania
- Download gotowych CV

**Technologie:**
- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS
- File API

---

### 2. Backend API (Next.js API Routes)
**Lokalizacja:** `app/api/generate/route.ts`  
**Odpowiedzialność:**
- Odbieranie plików CV
- Ekstrakcja tekstu (PDF/DOCX)
- Komunikacja z Claude API
- Generowanie DOCX
- Zwracanie wyników

**Technologie:**
- Next.js API Routes
- Anthropic SDK
- pdf-parse (PDF)
- mammoth (DOCX)
- python-docx (generowanie) LUB docx (Node.js)

---

### 3. Claude API (Anthropic)
**Endpoint:** `https://api.anthropic.com/v1/messages`  
**Model:** `claude-sonnet-4-20250514`  
**Odpowiedzialność:**
- Analiza tekstu CV
- Ekstrakcja ustrukturyzowanych danych
- Inteligentne mapowanie do formatu B2B

**Input:** Surowy tekst CV  
**Output:** JSON z danymi kandydata

---

### 4. Generator DOCX
**Lokalizacja:** `lib/generate_cv.py` (Python) lub `route-simple.ts` (Node.js)  
**Odpowiedzialność:**
- Kopiowanie szablonu firmowego
- Wypełnianie danymi
- Zachowanie formatowania i logo
- Generowanie finalnego DOCX

**Input:** JSON z danymi  
**Output:** Plik DOCX z logo B2B

---

## Przepływ requestu (szczegółowo)

### Timing breakdown (dla 1 CV):

```
00:00s - Użytkownik wybiera plik
00:01s - Upload do serwera (~1MB)
00:02s - Ekstrakcja tekstu z PDF/DOCX
00:03s - Wysłanie do Claude API
00:33s - Claude analizuje i zwraca JSON (30s)
00:34s - Generowanie DOCX z szablonu
00:35s - Download pliku do użytkownika
```

**Total: ~35 sekund na CV**

---

## Koszty breakdown

### Na jedno CV:
```
1. Claude API:
   - Input tokens: ~2,000 (CV text)
   - Output tokens: ~1,500 (JSON response)
   - Cost: ~$1.00

2. Hosting (Vercel):
   - Function execution: ~35s
   - Bandwidth: ~1MB up + 200KB down
   - Cost: $0.00 (w darmowym tier)

TOTAL per CV: ~$1.00
```

### Miesięcznie (1500 CV):
```
- Claude API: $1,500
- Hosting: $0
- Bandwidth: $0
- Storage: $0

TOTAL: $1,500/month
```

---

## Skalowanie

### Current capacity:
- **Vercel Free Tier:**
  - 100GB bandwidth/month ✅
  - 100 hours function execution/month ✅
  - Unlimited requests ✅

### Dla 1500 CV/month:
- Bandwidth: ~1.5GB (✅ w limicie)
- Execution time: ~15 hours (✅ w limicie)

### Jeśli będzie więcej CV:
Upgrade na Vercel Pro ($20/month) daje:
- 1TB bandwidth
- 1000 hours execution
- = ~50,000 CV/month capacity

---

## Security & Privacy

### Dane użytkownika:
- ❌ NIE są zapisywane na serwerze
- ❌ NIE ma bazy danych
- ✅ Temporary files usuwane po przetworzeniu
- ✅ Claude API nie trenuje na danych użytkownika

### API Key security:
- ✅ Przechowywany w zmiennych środowiskowych
- ✅ NIE w kodzie źródłowym
- ✅ Tylko backend ma dostęp

### Access control:
- Obecnie: brak (publiczny link)
- Opcjonalnie: dodaj middleware z hasłem

---

## Monitoring & Observability

### Co monitorować:

1. **Koszty API:**
   - Anthropic Console: https://console.anthropic.com
   - Alerty przy przekroczeniu budżetu

2. **Błędy:**
   - Vercel Logs (runtime errors)
   - Client-side errors (console)

3. **Performance:**
   - Avg. processing time
   - Success rate
   - Failed requests

4. **Usage:**
   - CV processed per day
   - Peak hours
   - User activity

---

## Backup & Disaster Recovery

### Co backupować:
- ✅ `szablon_firmowy.docx` (krytyczny!)
- ✅ Kod aplikacji (Git)
- ✅ Zmienne środowiskowe (secure notes)

### W razie awarii:
1. Sprawdź Vercel status
2. Sprawdź Anthropic API status
3. Re-deploy z GitHuba
4. Przywróć szablon z backupu

---

## Future improvements (opcjonalne)

1. **Queue system** - dla bulk processing
2. **Database** - historia CV
3. **Admin panel** - statystyki
4. **Email alerts** - gdy CV gotowe
5. **PDF output** - oprócz DOCX
6. **Multi-language** - CV w wielu językach
7. **Custom templates** - różne szablony na projekt

---

To tyle! System jest prosty, skalowalny i tani. 🚀
