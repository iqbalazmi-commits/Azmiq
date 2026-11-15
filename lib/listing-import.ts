/* ===========================================================================
   LISTING FILE IMPORT

   Reads a product listings file - Amazon Seller Central's Category Listings
   Report or All Listings Report, or any similar spreadsheet saved as tab- or
   comma-separated text - into draft rows the admin can review and import.

   Runs in the browser, so a large report never has to be uploaded in full.
   Column names vary between Amazon reports and marketplaces, so each field is
   matched against a list of known names rather than one fixed layout, and the
   header row is found by looking for the row that matches the most of them
   (Amazon flat files put two rows of template notes above the real header).
   =========================================================================== */

export type ListingRow = {
  /** Position in the file, used as the React key and in messages. */
  line: number;
  title: string;
  description: string;
  summary: string;
  /** As written in the file ("24.99"); edited in the preview before import. */
  price: string;
  compareAt: string;
  inventory: number;
  sku: string;
  images: string[];
};

export type ParsedListings =
  | { ok: true; rows: ListingRow[]; skipped: number }
  | { ok: false; error: string };

const MAX_IMAGES = 8;

/* Normalised column name -> field. Normalising strips case, spaces, dashes
   and underscores, so "item_name", "item-name" and "Item Name" all match. */
const FIELD_NAMES = {
  title: ["itemname", "title", "producttitle", "productname", "name"],
  description: ["productdescription", "itemdescription", "description"],
  price: ["standardprice", "price", "yourprice", "sellingprice", "ourprice"],
  listPrice: ["listprice", "rrp", "msrp", "listpricewithtax"],
  quantity: ["quantity", "qty", "stock", "availablequantity", "quantityavailable"],
  sku: ["itemsku", "sellersku", "sku", "contributionsku"],
  parentChild: ["parentchild"],
  mainImage: ["mainimageurl", "imageurl", "mainimage", "image"],
} as const satisfies Record<string, readonly string[]>;
type Field = keyof typeof FIELD_NAMES;
const BULLET = /^(bulletpoint|keyproductfeatures|keyfeature)\d*$/;
const OTHER_IMAGE = /^(otherimageurl|additionalimageurl|imageurl|image)\d+$/;

function normalise(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Amazon .txt reports are often Windows-1252, not UTF-8. Try UTF-8 strictly
    and fall back, so "£" and accented letters survive either way. */
export function decodeListingFile(bytes: Uint8Array): { ok: true; text: string } | { ok: false; error: string } {
  // .xlsx / .xlsm files are zip archives, which start with "PK".
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
    return {
      ok: false,
      error:
        "That is an Excel file. Open it in Excel, choose File → Save As → “Text (Tab delimited) (*.txt)”, and upload the .txt file.",
    };
  }
  try {
    return { ok: true, text: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    return { ok: true, text: new TextDecoder("windows-1252").decode(bytes) };
  }
}

/** Splits tab- or comma-separated text into rows, honouring quoted fields
    (which may contain the delimiter, doubled quotes and line breaks). */
export function splitDelimited(text: string): string[][] {
  const body = text.replace(/^\uFEFF/, "");
  const firstLines = body.split(/\r?\n/, 5).join("\n");
  const delimiter = (firstLines.match(/\t/g)?.length ?? 0) >= (firstLines.match(/,/g)?.length ?? 0) ? "\t" : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (quoted) {
      if (ch === '"') {
        if (body[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"' && field === "") {
      quoted = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && body[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

type Columns = Partial<Record<Field, number>> & { bullets: number[]; otherImages: number[] };

function mapColumns(header: string[]): Columns {
  const columns: Columns = { bullets: [], otherImages: [] };
  header.forEach((raw, index) => {
    const name = normalise(raw);
    if (!name) return;
    for (const [field, names] of Object.entries(FIELD_NAMES) as [Field, readonly string[]][]) {
      if (columns[field] === undefined && names.includes(name)) {
        columns[field] = index;
        return;
      }
    }
    if (BULLET.test(name)) columns.bullets.push(index);
    else if (OTHER_IMAGE.test(name)) columns.otherImages.push(index);
  });
  return columns;
}

function score(columns: Columns): number {
  return (
    (Object.keys(FIELD_NAMES) as Field[]).filter((f) => columns[f] !== undefined).length +
    columns.bullets.length +
    columns.otherImages.length
  );
}

/** Amazon descriptions often carry simple HTML; keep the words and the
    paragraph breaks, drop the markup. */
export function htmlToText(input: string): string {
  return input
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|li|h[1-6])\s*>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanPrice(raw: string): string {
  const match = raw.replace(/,/g, "").match(/\d+(\.\d{1,2})?/);
  return match ? match[0] : "";
}

function firstSentence(text: string, max = 200): string {
  const flat = text.replace(/\s+/g, " ").trim();
  const sentence = flat.match(/^.*?[.!?](\s|$)/)?.[0]?.trim() ?? flat;
  return sentence.length <= max ? sentence : `${sentence.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

export function parseListingFile(text: string): ParsedListings {
  const table = splitDelimited(text);
  if (table.length < 2) return { ok: false, error: "That file looks empty." };

  // The real header is whichever of the first rows names the most fields.
  let headerIndex = -1;
  let columns: Columns = { bullets: [], otherImages: [] };
  for (let i = 0; i < Math.min(6, table.length); i++) {
    const candidate = mapColumns(table[i]);
    if (candidate.title !== undefined && score(candidate) > score(columns)) {
      headerIndex = i;
      columns = candidate;
    }
  }
  if (headerIndex === -1 || columns.title === undefined) {
    return {
      ok: false,
      error:
        "Could not find a product name column. Use Amazon’s Category Listings Report or All Listings Report, saved as tab-delimited text or CSV.",
    };
  }

  const cell = (row: string[], index: number | undefined) => (index === undefined ? "" : (row[index] ?? "").trim());

  const rows: ListingRow[] = [];
  let skipped = 0;

  table.slice(headerIndex + 1).forEach((row, offset) => {
    const title = htmlToText(cell(row, columns.title)).replace(/\s+/g, " ").slice(0, 200);
    // Amazon "parent" rows are variation groupings, not things you can buy.
    if (!title || cell(row, columns.parentChild).toLowerCase() === "parent") {
      skipped++;
      return;
    }

    const bullets = columns.bullets.map((i) => htmlToText(cell(row, i))).filter(Boolean);
    // The shop shows a paragraph per blank-line-separated block, so every line
    // of the listing becomes its own paragraph rather than running together.
    const body = htmlToText(cell(row, columns.description)).split(/\n+/).join("\n\n");
    const description = [body, ...bullets.map((b) => `• ${b}`)].filter(Boolean).join("\n\n");

    const images = [cell(row, columns.mainImage), ...columns.otherImages.map((i) => cell(row, i))]
      .filter((url) => /^https?:\/\//i.test(url))
      .filter((url, i, all) => all.indexOf(url) === i)
      .slice(0, MAX_IMAGES);

    const price = cleanPrice(cell(row, columns.price));
    const listPrice = cleanPrice(cell(row, columns.listPrice));
    const quantity = Number.parseInt(cell(row, columns.quantity), 10);

    rows.push({
      line: headerIndex + offset + 2,
      title,
      description,
      summary: firstSentence(bullets[0] ?? body),
      price,
      compareAt: listPrice && price && Number(listPrice) > Number(price) ? listPrice : "",
      inventory: Number.isFinite(quantity) && quantity > 0 ? quantity : 0,
      sku: cell(row, columns.sku).slice(0, 60),
      images,
    });
  });

  if (rows.length === 0) return { ok: false, error: "No products were found in that file." };
  return { ok: true, rows, skipped };
}
