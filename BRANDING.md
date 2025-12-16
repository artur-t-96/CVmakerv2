# 🎨 Branding B2B Network - Instrukcje

## Kolory firmowe

Aplikacja używa kolorów firmowych B2B Network:

### Czerwony firmowy (Header)
- **HEX:** `#E14F4F`
- **RGB:** `225, 79, 79`
- **Tailwind:** `bg-b2b-red`
- **Użycie:** Nagłówki, przyciski główne, akcenty

### Ciemnoszary (Tekst)
- **HEX:** `#373535`
- **RGB:** `55, 53, 53`
- **Tailwind:** `bg-b2b-gray`
- **Użycie:** Tekst główny, body

### Szary (Tła tabel)
- **HEX:** `#D9D9D9`
- **RGB:** `217, 217, 217`
- **Użycie:** Tła nagłówków tabel

---

## Logo B2B Network

### Gdzie dodać logo?

1. **W aplikacji webowej:**
   - Dodaj plik logo do `/public/logo-b2b.png`
   - Zmodyfikuj komponent w `app/page.tsx`:
   
   ```tsx
   // Zamień obecny placeholder:
   <div className="w-12 h-12 bg-b2b-red rounded-lg...">
     B2B
   </div>
   
   // Na obraz:
   <Image 
     src="/logo-b2b.png" 
     alt="B2B Network" 
     width={48} 
     height={48}
     className="rounded-lg"
   />
   ```

2. **W szablonie DOCX:**
   - Logo jest już w pliku `szablon_firmowy.docx`
   - Header: `image1.png` (97 KB)
   - Footer: `image2.png` (37.5 KB)

---

## Czcionki

### W aplikacji webowej:
- **Główna:** Inter (domyślnie z Next.js)
- **Można zmienić na:** Montserrat (aby dopasować do DOCX)

### W dokumentach DOCX:
- **Montserrat** - tekst główny
- **Montserrat SemiBold** - nagłówki

---

## Jak zmienić kolory w aplikacji?

### 1. Edytuj `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      'b2b-red': '#E14F4F',      // Zmień tu czerwony
      'b2b-gray': '#373535',      // Zmień tu szary
      'b2b-blue': '#YOUR_COLOR',  // Dodaj nowe kolory
    },
  },
}
```

### 2. Użyj w komponentach:

```tsx
<button className="bg-b2b-red hover:bg-b2b-blue">
  Twój przycisk
</button>
```

---

## Favicon

Dodaj favicon do `/public/favicon.ico` i zaktualizuj `app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: 'CV Generator B2B Network',
  description: '...',
  icons: {
    icon: '/favicon.ico',
  },
}
```

---

## Social Media Meta Tags

Dodaj do `app/layout.tsx` dla lepszego wyglądu przy udostępnianiu:

```tsx
export const metadata: Metadata = {
  title: 'CV Generator B2B Network',
  description: 'Generator profesjonalnych CV w formacie B2B Network v2.0',
  openGraph: {
    title: 'CV Generator B2B Network',
    description: 'Generator profesjonalnych CV',
    images: ['/og-image.png'],
  },
}
```

---

## 📸 Zrzuty ekranu

Jeśli potrzebujesz zrzutów ekranu do dokumentacji:
1. Uruchom aplikację lokalnie
2. Otwórz devtools (F12)
3. Zmień na widok mobile dla lepszego framing
4. Zrób screenshot (Cmd/Ctrl + Shift + P → "Screenshot")

---

## 🎯 Spójność brandingu

Aby zachować spójność wizualną:

✅ Używaj tylko kolorów firmowych  
✅ Używaj zaokrąglonych rogów (`rounded-lg`)  
✅ Używaj cieni (`shadow-md`, `shadow-sm`)  
✅ Zachowuj odstępy (`gap-4`, `p-8`)  
✅ Ikony SVG w kolorze `b2b-red`

---

Potrzebujesz więcej dostosowań brandingowych? Daj znać!
