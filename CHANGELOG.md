# CV Generator B2B - CHANGELOG

## v3.0 (2024) - 3 nowe funkcje

### 🆕 Funkcja 1: Technologie przy każdej pozycji
- Każda pozycja w sekcji "DOŚWIADCZENIE" ma teraz podsekcję **"Technologie:"**
- AI automatycznie wyodrębnia technologie z opisu obowiązków
- Jeśli technologie nie są wprost wymienione, AI dedukuje je z kontekstu
- Format: `Technologie: React, Node.js, PostgreSQL, Docker, AWS`

### 🆕 Funkcja 2: Przycisk "🪄 AI Enhance" (opcjonalny)
- Toggle przed przyciskiem "Generuj"
- **Smart Deduction** - AI dodaje typowe obowiązki na podstawie stanowiska i branży
- **Agresywna dedukcja technologii** - więcej technologii per pozycja (6-10)
- Przykład: "Senior Java Developer w banku" → automatycznie dodaje: code review, mentoring, współpraca z analitykami, dokumentacja techniczna

### 🆕 Funkcja 3: Upload Profilu Championa (opcjonalny)
- Po uploadzie CV pojawia się modal z opcją dodania Profilu Championa
- Można pominąć (checkbox "Nie pokazuj ponownie w tej sesji")
- Jeśli dodasz Profil Championa:
  - Sekcja "DLACZEGO [IMIĘ]" jest **matchowana do wymagań klienta**
  - Punkty podkreślają spełnienie MUST-HAVE z profilu
  - Język korzyści dla klienta (nie kandydata)
  - Odniesienia do kontekstu projektu

---

## Jak używać nowych funkcji

### Standardowy flow (bez zmian):
1. Upload CV → Generuj → Pobierz

### Z AI Enhance:
1. Upload CV
2. Włącz toggle "🪄 AI Enhance"
3. Generuj → CV ma rozbudowane obowiązki i więcej technologii

### Z Profilem Championa:
1. Upload CV
2. W modalu kliknij i wybierz plik Profilu Championa (DOCX/PDF)
3. Kliknij "Kontynuuj z profilem"
4. Generuj → Sekcja WHY jest dopasowana do wymagań klienta

### Wszystko razem:
1. Upload CV
2. Dodaj Profil Championa
3. Włącz AI Enhance
4. Generuj → Maksymalnie rozbudowane CV dopasowane do wymagań

---

## Zmiany techniczne

### `app/page.tsx`
- Nowe stany: `aiEnhance`, `championProfile`, `showChampionModal`, `skipChampion`
- Modal do uploadu Profilu Championa
- Toggle AI Enhance z wizualnym stylem B2B
- Info o dodanym Profilu Championa z opcją usunięcia

### `app/api/generate/route.ts`
- Rozszerzony `EXTRACTION_PROMPT` o pole `technologies` w experience
- Nowy `ENHANCED_EXTRACTION_PROMPT` dla trybu AI Enhance
- Dynamiczny prompt z kontekstem Champion Profile
- Obsługa uploadu i ekstrakcji tekstu z Profilu Championa

### `lib/generate_cv.py`
- Wyświetlanie technologii po liście obowiązków w formacie: `Technologie: X, Y, Z`
- Styl: bold etykieta + regular lista

---

## Kompatybilność wsteczna
✅ Wszystkie poprzednie funkcje działają bez zmian
✅ Nowe funkcje są opcjonalne
✅ Szablon firmowy bez zmian
✅ Style i formatowanie bez zmian
