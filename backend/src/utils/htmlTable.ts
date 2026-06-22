import * as cheerio from 'cheerio'

export type ParsedTable = {
  headers: string[]
  rows: Record<string, string | number | boolean | null>[]
}

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function coerceCellValue(value: string) {
  const trimmed = value.trim().replace(/\s+/g, ' ')

  if (!trimmed) {
    return null
  }

  if (/^(true|false)$/i.test(trimmed)) {
    return trimmed.toLowerCase() === 'true'
  }

  const numericCandidate = trimmed.replace(/[$,]/g, '')
  if (/^-?\d+(\.\d+)?$/.test(numericCandidate)) {
    return Number(numericCandidate)
  }

  return trimmed
}

function extractText(cell: cheerio.Cheerio<cheerio.Element>) {
  return cell
    .text()
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseTableElement($: cheerio.CheerioAPI, table: cheerio.Cheerio<cheerio.Element>): ParsedTable | null {
  const headerCells = table.find('tr').first().find('th,td')
  const headers = headerCells
    .map((index, element) => normalizeHeader(extractText($(element))) || `column_${index + 1}`)
    .get()

  if (!headers.length) {
    return null
  }

  const rows = table
    .find('tr')
    .toArray()
    .slice(1)
    .map((rowElement) => {
      const cells = $(rowElement).find('td,th').toArray()

      if (!cells.length) {
        return null
      }

      const record: Record<string, string | number | boolean | null> = {}

      headers.forEach((header, index) => {
        const cellElement = cells[index]
        record[header] = cellElement ? coerceCellValue(extractText($(cellElement))) : null
      })

      return record
    })
    .filter((row): row is Record<string, string | number | boolean | null> => Boolean(row))

  if (!rows.length) {
    return null
  }

  return { headers, rows }
}

export function parseHtmlTables(html: string): ParsedTable[] {
  const $ = cheerio.load(html)
  const tables = $('table').toArray()

  if (!tables.length) {
    throw new Error('No se encontró ninguna tabla HTML en el correo')
  }

  const parsed = tables
    .map((tableElement) => parseTableElement($, $(tableElement)))
    .filter((table): table is ParsedTable => Boolean(table))

  if (!parsed.length) {
    throw new Error('No se encontraron tablas HTML con encabezados y filas válidas')
  }

  return parsed
}

export function parseHtmlTableAtIndex(html: string, tableIndex: number): ParsedTable {
  const tables = parseHtmlTables(html)

  if (tableIndex < 0 || tableIndex >= tables.length) {
    throw new Error(`La tabla solicitada (${tableIndex + 1}) no existe. Tablas detectadas: ${tables.length}`)
  }

  return tables[tableIndex]
}
