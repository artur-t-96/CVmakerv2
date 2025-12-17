import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Metryki requestów
interface RequestMetrics {
  requestId: string
  startTime: number
  endTime?: number
  durationMs?: number
  attempts: number
  success: boolean
  errorType?: string
  statusCode?: number
}

// Funkcja do retry z exponential backoff
async function callClaudeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 4,
  requestId: string
): Promise<T> {
  const metrics: RequestMetrics = {
    requestId,
    startTime: Date.now(),
    attempts: 0,
    success: false,
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    metrics.attempts = attempt + 1

    try {
      console.log(`[${requestId}] Próba ${attempt + 1}/${maxRetries + 1}`)
      const result = await fn()

      metrics.success = true
      metrics.endTime = Date.now()
      metrics.durationMs = metrics.endTime - metrics.startTime

      console.log(`[${requestId}] Sukces po ${metrics.attempts} próbach, czas: ${metrics.durationMs}ms`)

      return result
    } catch (error: any) {
      metrics.errorType = error?.error?.error?.type || error?.type || 'unknown'
      metrics.statusCode = error?.status

      const isOverloaded = metrics.statusCode === 529 || metrics.errorType === 'overloaded_error'
      const shouldRetry = error?.headers?.['x-should-retry'] === 'true' || isOverloaded

      console.error(`[${requestId}] Próba ${attempt + 1} nieudana:`, {
        errorType: metrics.errorType,
        status: metrics.statusCode,
        shouldRetry,
        message: error?.message || error?.error?.error?.message
      })

      if (attempt === maxRetries || !shouldRetry) {
        metrics.endTime = Date.now()
        metrics.durationMs = metrics.endTime - metrics.startTime

        console.error(`[${requestId}] Wszystkie próby wyczerpane. Metryki:`, metrics)
        throw error
      }

      const delayMs = Math.pow(2, attempt + 1) * 1000
      console.log(`[${requestId}] Oczekiwanie ${delayMs}ms przed kolejną próbą...`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  throw new Error('Nieoczekiwany błąd w retry logic')
}

// Prompt do ekstrakcji danych z CV (Polski)
const EXTRACTION_PROMPT_PL = `Jesteś ekspertem w analizie CV. Przeanalizuj dostarczone CV i wyodrębnij następujące informacje w formacie JSON:

{
  "name": "Pełne imię i nazwisko",
  "first_name": "Imię",
  "position": "Główne stanowisko/tytuł zawodowy (np. 'Java Developer', 'Senior DevOps Engineer')",
  "why_points": [
    "3-5 kluczowych punktów marketingowych według schematu:",
    "1. [X] lat doświadczenia jako [Stanowisko], w tym [Y] lat w [Największa firma]",
    "2. Specjalizacja w technologiach: [Top 4-5 technologii]",
    "3. Praktyczne doświadczenie w [kluczowy projekt/osiągnięcie]",
    "4. Znajomość [metodologie/procesy]",
    "5. [Certyfikaty lub dodatkowe kompetencje]"
  ],
  "education": [
    {
      "dates": "YYYY lub MM.YYYY – MM.YYYY",
      "institution": "Nazwa uczelni",
      "degree": "Kierunek i stopień",
      "location": "Miasto, Kraj"
    }
  ],
  "skills": [
    {
      "label": "Kategoria umiejętności:",
      "content": "Lista umiejętności"
    }
  ],
  "certifications": [
    "Nazwa certyfikatu – Wystawca (rok)"
  ],
  "languages": [
    "Język – poziom (np. Polski – ojczysty, Angielski – biegły)"
  ],
  "experience": [
    {
      "dates": "MM.YYYY – currently",
      "company": "Nazwa firmy",
      "industry": "Branża firmy (np. IT, Fintech, E-commerce, Telekomunikacja, Bankowość, Retail, Produkcja)",
      "position": "Stanowisko",
      "responsibilities": [
        "Lista obowiązków i osiągnięć"
      ],
      "technologies": [
        "Lista technologii używanych w tej roli"
      ]
    }
  ]
}

KRYTYCZNE ZASADY:
1. Zwróć TYLKO poprawny JSON, bez żadnego dodatkowego tekstu
2. Format dat: MM.YYYY dla zakresów (np. 03.2020 – 11.2023), YYYY dla pojedynczych lat
3. Sekcja "why_points" musi być marketingowa i atrakcyjna - NIE używaj edukacji jako argumentu w why_points!
4. Wyodrębnij minimum 5 kategorii umiejętności
5. Jeśli brak certyfikatów, dodaj przynajmniej szkolenia/kursy
6. Minimum 2 języki (zawsze Polski + inne)
7. Uporządkuj doświadczenie od najnowszego
8. Używaj polskich znaków (ą, ć, ę, ł, ń, ó, ś, ź, ż)

ZASADY DLA WHY_POINTS:
- NIGDY nie używaj edukacji/studiów jako argumentu w why_points
- Skup się TYLKO na: doświadczeniu zawodowym, technologiach, projektach, osiągnięciach, certyfikatach
- Edukacja jest w osobnej sekcji i nie powinna być powtarzana w why_points

TECHNOLOGIE W DOŚWIADCZENIU:
- Dla każdej pozycji wyodrębnij technologie, języki programowania, frameworki, narzędzia, bazy danych, platformy chmurowe
- Jeśli technologie nie są wprost wymienione, dedukuj je z kontekstu obowiązków
- Sortuj: języki programowania → frameworki → bazy danych → narzędzia → chmura
- Minimum 3-5 technologii per pozycja jeśli to rola techniczna

Odpowiedz TYLKO JSON-em, bez markdown, bez \`\`\`json, bez żadnego tekstu poza JSON.`

// Prompt do ekstrakcji danych z CV (English)
const EXTRACTION_PROMPT_EN = `You are an expert in CV analysis. Analyze the provided CV and extract the following information in JSON format:

{
  "name": "Full name",
  "first_name": "First name",
  "position": "Main position/job title (e.g., 'Java Developer', 'Senior DevOps Engineer')",
  "why_points": [
    "3-5 key marketing points according to the following scheme:",
    "1. [X] years of experience as [Position], including [Y] years at [Biggest company]",
    "2. Specialization in technologies: [Top 4-5 technologies]",
    "3. Practical experience in [key project/achievement]",
    "4. Knowledge of [methodologies/processes]",
    "5. [Certifications or additional competencies]"
  ],
  "education": [
    {
      "dates": "YYYY or MM.YYYY – MM.YYYY",
      "institution": "University name",
      "degree": "Field of study and degree",
      "location": "City, Country"
    }
  ],
  "skills": [
    {
      "label": "Skill category:",
      "content": "List of skills"
    }
  ],
  "certifications": [
    "Certificate name – Issuer (year)"
  ],
  "languages": [
    "Language – level (e.g., Polish – native, English – fluent)"
  ],
  "experience": [
    {
      "dates": "MM.YYYY – MM.YYYY or currently",
      "company": "Company name",
      "industry": "Company industry (e.g., IT, Fintech, E-commerce, Telecommunications, Banking, Retail, Manufacturing)",
      "position": "Position",
      "responsibilities": [
        "List of duties and achievements"
      ],
      "technologies": [
        "List of technologies used in this role"
      ]
    }
  ]
}

CRITICAL RULES:
1. Return ONLY valid JSON, without any additional text
2. Date format: MM.YYYY for ranges (e.g., 03.2020 – 11.2023), YYYY for single years
3. The "why_points" section must be marketing-oriented and attractive - NEVER use education as an argument in why_points!
4. Extract at least 5 skill categories
5. If no certifications, add at least training/courses
6. Minimum 2 languages
7. Sort experience from newest to oldest
8. Use proper English language

RULES FOR WHY_POINTS:
- NEVER use education/studies as an argument in why_points
- Focus ONLY on: work experience, technologies, projects, achievements, certifications
- Education is in a separate section and should not be repeated in why_points

TECHNOLOGIES IN EXPERIENCE:
- For each position extract technologies, programming languages, frameworks, tools, databases, cloud platforms
- If technologies are not explicitly mentioned, deduce them from the context of responsibilities
- Sort: programming languages → frameworks → databases → tools → cloud
- Minimum 3-5 technologies per position if it's a technical role

Answer with JSON ONLY, no markdown, no \`\`\`json, no text besides JSON.`

// Prompt rozszerzony dla AI Enhance (Polski)
const ENHANCED_EXTRACTION_PROMPT_PL = `${EXTRACTION_PROMPT_PL}

TRYB AI ENHANCE - DODATKOWE INSTRUKCJE:

WAŻNE: Zastosuj poniższe ulepszenia do WSZYSTKICH pozycji w doświadczeniu, WŁĄCZNIE z aktualną/bieżącą pozycją (gdzie data końcowa to "currently" lub brak daty końcowej). NIE pomijaj żadnej pozycji!

1. SMART DEDUCTION obowiązków:
   - Na podstawie stanowiska, firmy i branży DODAJ typowe obowiązki, które kandydat prawdopodobnie wykonywał/wykonuje ale nie wymienił
   - Przykład: "Senior Java Developer w banku" → dodaj: code review, mentoring juniorów, współpraca z analitykami biznesowymi, udział w planowaniu sprintów, dokumentacja techniczna
   - Przykład: "DevOps Engineer" → dodaj: monitoring i alerting, incident management, capacity planning, security hardening
   - Dodaj 2-4 dodatkowe obowiązki per pozycja (KAŻDA pozycja, także aktualna!), sformułowane naturalnie
   - NIE zaznaczaj które obowiązki są dodane

2. AGRESYWNA DEDUKCJA technologii:
   - Dedukuj technologie z kontekstu branży, firmy i stanowiska DLA KAŻDEJ POZYCJI
   - Przykład: "Backend Developer w fintechu" → Java/Kotlin, Spring Boot, PostgreSQL, Kafka, Docker, Kubernetes, AWS
   - Przykład: "Frontend Developer w software house" → React, TypeScript, Redux, Webpack, Jest, CSS-in-JS
   - Przykład: "Data Engineer" → Python, Spark, Airflow, SQL, dbt, Snowflake/BigQuery
   - Dodaj typowy stack technologiczny dla danej roli nawet jeśli nie wymieniony wprost
   - Dla każdej pozycji (WŁĄCZNIE Z AKTUALNĄ) minimum 6-10 technologii`

// Prompt rozszerzony dla AI Enhance (English)
const ENHANCED_EXTRACTION_PROMPT_EN = `${EXTRACTION_PROMPT_EN}

AI ENHANCE MODE - ADDITIONAL INSTRUCTIONS:

IMPORTANT: Apply the enhancements below to ALL positions in experience, INCLUDING the current/ongoing position (where end date is "currently" or missing). DO NOT skip any position!

1. SMART DEDUCTION of responsibilities:
   - Based on position, company and industry, ADD typical responsibilities that the candidate probably performed/performs but didn't list
   - Example: "Senior Java Developer at a bank" → add: code review, mentoring juniors, collaboration with business analysts, sprint planning participation, technical documentation
   - Example: "DevOps Engineer" → add: monitoring and alerting, incident management, capacity planning, security hardening
   - Add 2-4 additional responsibilities per position (EVERY position, including current one!), naturally phrased
   - DO NOT mark which responsibilities are added

2. AGGRESSIVE TECHNOLOGY DEDUCTION:
   - Deduce technologies from industry, company and position context FOR EVERY POSITION
   - Example: "Backend Developer at fintech" → Java/Kotlin, Spring Boot, PostgreSQL, Kafka, Docker, Kubernetes, AWS
   - Example: "Frontend Developer at software house" → React, TypeScript, Redux, Webpack, Jest, CSS-in-JS
   - Example: "Data Engineer" → Python, Spark, Airflow, SQL, dbt, Snowflake/BigQuery
   - Add typical tech stack for the role even if not explicitly mentioned
   - Minimum 6-10 technologies per position (INCLUDING CURRENT ONE)`

// Funkcja do konwersji PDF/DOCX na tekst
async function extractTextFromFile(filePath: string, fileName: string): Promise<string> {
  const ext = path.extname(fileName).toLowerCase()

  if (ext === '.pdf') {
    const { stdout } = await execAsync(`pdftotext "${filePath}" -`)
    return stdout
  } else if (ext === '.docx' || ext === '.doc') {
    const mammoth = require('mammoth')
    const buffer = await fs.readFile(filePath)
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  throw new Error('Nieobsługiwany format pliku')
}

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const requestStartTime = Date.now()

  console.log(`[${requestId}] Rozpoczęcie przetwarzania requestu`)

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const language = (formData.get('language') as string) || 'pl'
    const aiEnhance = formData.get('aiEnhance') === 'true'
    const blindCV = formData.get('blindCV') === 'true'

    console.log(`[${requestId}] Language: ${language}, AI Enhance: ${aiEnhance}, Blind CV: ${blindCV}`)

    if (!file) {
      return NextResponse.json(
        { error: 'Brak pliku' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const tempDir = '/tmp'
    const sanitizedFileName = file.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
    const tempFilePath = path.join(tempDir, `upload_${Date.now()}_${sanitizedFileName}`)
    await fs.writeFile(tempFilePath, buffer)

    try {
      console.log(`[${requestId}] Ekstraktuję tekst z pliku...`)
      const extractionStart = Date.now()
      const cvText = await extractTextFromFile(tempFilePath, file.name)
      console.log(`[${requestId}] Ekstrakcja tekstu zakończona w ${Date.now() - extractionStart}ms`)

      // Wybierz odpowiedni prompt na podstawie języka i AI Enhance
      let finalPrompt: string
      if (language === 'en') {
        finalPrompt = aiEnhance ? ENHANCED_EXTRACTION_PROMPT_EN : EXTRACTION_PROMPT_EN
      } else {
        finalPrompt = aiEnhance ? ENHANCED_EXTRACTION_PROMPT_PL : EXTRACTION_PROMPT_PL
      }

      console.log(`[${requestId}] Wysyłam do Claude API...`)
      const message = await callClaudeWithRetry(
        () => anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: `${finalPrompt}\n\nCV do analizy:\n\n${cvText}`
            }
          ]
        }),
        4,
        requestId
      )

      const responseText = message.content[0].type === 'text'
        ? message.content[0].text
        : ''

      console.log('Odpowiedź Claude:', responseText)

      let cleanedResponse = responseText.trim()
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

      const candidateData = JSON.parse(cleanedResponse)

      // Dodaj język i opcje do danych kandydata
      candidateData.language = language
      candidateData.blind_cv = blindCV

      console.log('Generuję DOCX...')
      const sanitizedName = candidateData.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
      const outputPath = path.join(tempDir, `CV_${sanitizedName}.docx`)
      const templatePath = path.join(process.cwd(), 'public', 'szablon_firmowy.docx')
      const pythonScriptPath = path.join(process.cwd(), 'lib', 'generate_cv.py')

      const dataPath = path.join(tempDir, `data_${Date.now()}.json`)
      await fs.writeFile(dataPath, JSON.stringify(candidateData, null, 2), { encoding: 'utf-8' })

      await execAsync(
        `python3 "${pythonScriptPath}" "${dataPath}" "${templatePath}" "${outputPath}"`
      )

      const docxBuffer = await fs.readFile(outputPath)

      await fs.unlink(tempFilePath)
      await fs.unlink(dataPath)
      await fs.unlink(outputPath)

      const totalDuration = Date.now() - requestStartTime
      console.log(`[${requestId}] Request zakończony sukcesem. Całkowity czas: ${totalDuration}ms`)

      return new NextResponse(docxBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="CV_B2B_${sanitizedName}.docx"`,
          'X-Request-ID': requestId,
          'X-Processing-Time-MS': totalDuration.toString(),
        },
      })

    } catch (error) {
      try {
        await fs.unlink(tempFilePath)
      } catch {}
      throw error
    }

  } catch (error) {
    const totalDuration = Date.now() - requestStartTime
    console.error(`[${requestId}] Błąd podczas przetwarzania (czas: ${totalDuration}ms):`, error)

    return NextResponse.json(
      {
        error: 'Błąd podczas przetwarzania CV',
        details: error instanceof Error ? error.message : 'Nieznany błąd',
        requestId
      },
      {
        status: 500,
        headers: {
          'X-Request-ID': requestId,
          'X-Processing-Time-MS': totalDuration.toString(),
        }
      }
    )
  }
}
