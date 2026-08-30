/**
 * Synthetic "screenshot" plates for the fixture Vault. TasteVault has no real
 * References yet; these stand in for captured Evidence so the wall reads as a
 * wall. They are deliberately neutral — structural greys, no brand colour — so
 * the Portal's own palette is what carries the design. Replace with real
 * captures once the scanning server and browser extension exist.
 */

type Variant =
  | "palette"
  | "docs"
  | "list"
  | "canvas"
  | "settings"
  | "landing"
  | "editor"
  | "table"
  | "toolbar";

const BODY: Record<Variant, string> = {
  palette: `<rect width='800' height='600' fill='%23202433'/><rect x='120' y='120' width='560' height='72' rx='14' fill='%232f3550'/><rect x='150' y='234' width='360' height='18' rx='5' fill='%23444c72'/><rect x='150' y='276' width='430' height='18' rx='5' fill='%23444c72'/><rect x='150' y='318' width='300' height='18' rx='5' fill='%236570a0'/>`,
  docs: `<rect width='800' height='600' fill='%23fbfaf7'/><rect x='0' y='0' width='150' height='600' fill='%23f0eee9'/><rect x='540' y='0' width='260' height='600' fill='%230a1f33'/><rect x='190' y='70' width='260' height='16' fill='%23c9c6bf'/><rect x='190' y='104' width='300' height='16' fill='%23e2dfd8'/><rect x='190' y='138' width='230' height='16' fill='%23e2dfd8'/><rect x='576' y='70' width='190' height='14' fill='%23486a86'/>`,
  list: `<rect width='800' height='600' fill='%23ffffff'/><rect x='60' y='120' width='680' height='2' fill='%23e5e7eb'/><rect x='60' y='150' width='360' height='16' fill='%23111827'/><rect x='60' y='210' width='680' height='2' fill='%23e5e7eb'/><rect x='60' y='240' width='300' height='16' fill='%236b7280'/><rect x='60' y='300' width='680' height='2' fill='%23e5e7eb'/><circle cx='700' cy='158' r='7' fill='%2316a34a'/><circle cx='700' cy='248' r='7' fill='%2316a34a'/>`,
  canvas: `<rect width='800' height='600' fill='%23111014'/><circle cx='250' cy='230' r='78' fill='none' stroke='%23808896' stroke-width='4'/><circle cx='500' cy='340' r='108' fill='none' stroke='%236570a0' stroke-width='4'/><circle cx='360' cy='150' r='44' fill='none' stroke='%23aab0bd' stroke-width='4'/>`,
  settings: `<rect width='800' height='600' fill='%23f4eee6'/><rect x='50' y='46' width='700' height='56' fill='%23d8ccbe'/><rect x='50' y='128' width='250' height='20' fill='%23c3b4a2'/><rect x='50' y='168' width='700' height='386' fill='%23e7ddd0'/><rect x='84' y='204' width='300' height='318' fill='%23d8ccbe'/><rect x='420' y='204' width='300' height='240' fill='%23cdb9a8'/>`,
  landing: `<rect width='800' height='600' fill='%23f3ebe6'/><rect x='100' y='70' width='600' height='420' fill='%23dccabf'/><rect x='150' y='120' width='250' height='150' fill='%23c19a8b'/><rect x='430' y='260' width='200' height='130' fill='%23b08876'/><rect x='250' y='340' width='320' height='48' fill='%23a0a0a0'/>`,
  editor: `<rect width='800' height='600' fill='%23ffffff'/><rect x='100' y='120' width='10' height='210' fill='%23111'/><rect x='134' y='124' width='340' height='26' fill='%23eee'/><rect x='134' y='170' width='290' height='22' fill='%23f3f3f3'/><rect x='134' y='206' width='320' height='22' fill='%23f3f3f3'/><rect x='134' y='242' width='250' height='22' fill='%23f3f3f3'/>`,
  table: `<rect width='800' height='600' fill='%23f7f8fa'/><rect x='50' y='80' width='700' height='52' fill='%23e9edf2'/><rect x='50' y='132' width='700' height='52' fill='%23ffffff'/><rect x='50' y='184' width='700' height='52' fill='%23f2f5f8'/><rect x='50' y='236' width='700' height='52' fill='%23ffffff'/><rect x='350' y='132' width='110' height='52' fill='%23cfd6df'/>`,
  toolbar: `<rect width='800' height='600' fill='%231b2436'/><rect x='120' y='150' width='560' height='84' rx='16' fill='%233a4468'/><rect x='156' y='182' width='330' height='20' rx='6' fill='%238b93b8'/>`,
};

export function screenshot(variant: Variant): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>${BODY[variant]}</svg>`;
  return `data:image/svg+xml,${svg.replace(/#/g, "%23")}`;
}
