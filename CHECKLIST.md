# ✅ Checklist dla zespołu - CV Generator B2B

## Dla użytkowników końcowych (rekruterzy)

### Przed pierwszym użyciem:
- [ ] Otrzymałem link do aplikacji od administratora
- [ ] Link działa i widzę stronę CV Generator
- [ ] Wiem gdzie znaleźć pliki CV kandydatów

### Przygotowanie CV:
- [ ] CV jest w formacie PDF lub DOCX
- [ ] Plik nie jest większy niż 10 MB
- [ ] CV zawiera podstawowe informacje (imię, nazwisko, doświadczenie)

### Proces generowania:
1. [ ] Wchodzę na stronę aplikacji
2. [ ] Przeciągam plik CV lub klikam "wybierz plik"
3. [ ] Widzę plik na liście
4. [ ] Klikam "Generuj szablony B2B"
5. [ ] Czekam na przetworzenie (~30 sekund)
6. [ ] Pobieram gotowy plik DOCX

### Po pobraniu:
- [ ] Otwieram plik w Microsoft Word
- [ ] Sprawdzam czy logo B2B jest widoczne (góra i dół)
- [ ] Sprawdzam czy wszystkie sekcje są wypełnione
- [ ] Poprawiam ewentualne błędy
- [ ] Zapisuję i wysyłam do klienta

---

## Dla administratora IT

### Instalacja (pierwsze uruchomienie):
- [ ] Zainstalowałem Node.js 18+
- [ ] Zainstalowałem Python 3.8+
- [ ] Zainstalowałem pakiety Python (`pip3 install python-docx lxml mammoth`)
- [ ] Zainstalowałem poppler-utils (dla PDF)
- [ ] Sklonowałem repozytorium lub rozpakowałem ZIP
- [ ] Uruchomiłem `npm install`
- [ ] Stworzyłem plik `.env.local` z kluczem API
- [ ] Uruchomiłem `npm run dev` (test lokalny)

### Deployment:
- [ ] Wybrałem platformę hostingu (Vercel/VPS/Docker)
- [ ] Skonfigurowałem zmienne środowiskowe
- [ ] Przesłałem szablon firmowy do `public/`
- [ ] Zrobiłem build (`npm run build`)
- [ ] Uruchomiłem aplikację
- [ ] Przetestowałem z przykładowym CV

### Po deployment:
- [ ] Aplikacja działa pod publicznym URL
- [ ] Udostępniłem link zespołowi (30 osób)
- [ ] Ustawiłem monitoring kosztów API (Anthropic console)
- [ ] Ustawiłem alerty dla dziwnego ruchu
- [ ] Dodałem backup szablonu firmowego

---

## Dla managera/product ownera

### Planowanie:
- [ ] Określiłem budżet na API (~$1,500/miesiąc dla 1500 CV)
- [ ] Przeszkoliłem zespół z używania aplikacji
- [ ] Stworzyłem dokumentację dla nowych pracowników
- [ ] Ustawiłem proces zgłaszania błędów

### Monitoring:
- [ ] Sprawdzam koszty API co tydzień
- [ ] Zbieram feedback od zespołu
- [ ] Śledzę ile CV jest przetwarzanych dziennie
- [ ] Planuję update'y i ulepszenia

### KPIs do śledzenia:
- [ ] Liczba przetworzonych CV / dzień
- [ ] Średni czas przetwarzania
- [ ] Koszt na jedno CV
- [ ] Liczba błędów / problem reports
- [ ] Poziom satysfakcji zespołu (1-10)

---

## Częste problemy i rozwiązania

### ❌ Problem: "Nie mogę przesłać pliku"
**Rozwiązanie:** Sprawdź czy plik jest PDF lub DOCX i nie jest większy niż 10 MB

### ❌ Problem: "Długo się przetwarza"
**Rozwiązanie:** Normalne, Claude API potrzebuje 20-60 sekund na przetworzenie

### ❌ Problem: "Wygenerowane CV ma błędy"
**Rozwiązanie:** 
1. Otwórz plik w Word
2. Popraw ręcznie
3. Zgłoś błąd administratorowi z przykładem

### ❌ Problem: "Brak logo w wygenerowanym CV"
**Rozwiązanie:** 
1. Sprawdź czy szablon_firmowy.docx jest w folderze `public/`
2. Zrestartuj aplikację
3. Spróbuj ponownie

### ❌ Problem: "Aplikacja nie działa"
**Rozwiązanie:** Skontaktuj się z IT/administratorem z opisem błędu

---

## 📞 Eskalacja problemów

**Poziom 1:** Użytkownik próbuje sam (restart, sprawdź plik)  
**Poziom 2:** Pytanie kolegi z zespołu  
**Poziom 3:** Zgłoszenie do IT/administratora  
**Poziom 4:** Kontakt z developerem aplikacji  

---

## 🎯 Cele miesięczne

Ustaw cele dla swojego zespołu:
- [ ] Przetworzyć X CV w tym miesiącu
- [ ] Utrzymać koszty poniżej $Y
- [ ] Osiągnąć satysfakcję zespołu min. 8/10
- [ ] Zero dni przestoju aplikacji

---

Powodzenia! 🚀
