/**
 * Stopgap: neighbourhood-places has no `district` field.
 * Berlin PLZ → Ortsteil. `null` when unknown — the "Mehr in …" band does not render.
 *
 * Durable fix is a `district` select on the collection. Keep production call
 * sites of {@link districtFromPostalCode} in the data layer so swapping it
 * out is a one-line change.
 */

const EXACT: Record<string, string> = {
  '10115': 'Mitte',
  '10117': 'Mitte',
  '10119': 'Mitte',
  '10178': 'Mitte',
  '10179': 'Mitte',
  '10243': 'Friedrichshain',
  '10245': 'Friedrichshain',
  '10247': 'Friedrichshain',
  '10249': 'Friedrichshain',
  '10405': 'Prenzlauer Berg',
  '10407': 'Prenzlauer Berg',
  '10409': 'Prenzlauer Berg',
  '10435': 'Prenzlauer Berg',
  '10437': 'Prenzlauer Berg',
  '10439': 'Prenzlauer Berg',
  '10551': 'Moabit',
  '10553': 'Moabit',
  '10555': 'Moabit',
  '10557': 'Moabit',
  '10559': 'Moabit',
  '10585': 'Charlottenburg',
  '10587': 'Charlottenburg',
  '10589': 'Charlottenburg',
  '10623': 'Charlottenburg',
  '10625': 'Charlottenburg',
  '10627': 'Charlottenburg',
  '10629': 'Charlottenburg',
  '10707': 'Wilmersdorf',
  '10709': 'Wilmersdorf',
  '10711': 'Wilmersdorf',
  '10713': 'Wilmersdorf',
  '10715': 'Wilmersdorf',
  '10717': 'Wilmersdorf',
  '10719': 'Wilmersdorf',
  '10777': 'Schöneberg',
  '10779': 'Schöneberg',
  '10781': 'Schöneberg',
  '10783': 'Schöneberg',
  '10785': 'Tiergarten',
  '10787': 'Tiergarten',
  '10789': 'Schöneberg',
  '10823': 'Schöneberg',
  '10825': 'Schöneberg',
  '10827': 'Schöneberg',
  '10829': 'Schöneberg',
  '10961': 'Kreuzberg',
  '10963': 'Kreuzberg',
  '10965': 'Kreuzberg',
  '10967': 'Kreuzberg',
  '10969': 'Kreuzberg',
  '10997': 'Kreuzberg',
  '10999': 'Kreuzberg',
  '12043': 'Neukölln',
  '12045': 'Neukölln',
  '12047': 'Neukölln',
  '12049': 'Neukölln',
  '12051': 'Neukölln',
  '12053': 'Neukölln',
  '12055': 'Neukölln',
  '12057': 'Neukölln',
  '12059': 'Neukölln',
  '12101': 'Tempelhof',
  '12103': 'Tempelhof',
  '12105': 'Tempelhof',
  '12107': 'Tempelhof',
  '12109': 'Tempelhof',
  '12157': 'Friedenau',
  '12159': 'Friedenau',
  '12161': 'Steglitz',
  '12163': 'Steglitz',
  '12167': 'Steglitz',
  '12169': 'Steglitz',
  '12347': 'Britz',
  '12349': 'Britz',
  '14050': 'Westend',
  '14052': 'Westend',
  '14053': 'Westend',
  '14055': 'Westend',
  '14057': 'Charlottenburg',
  '14059': 'Charlottenburg',
  '14193': 'Grunewald',
  '14195': 'Dahlem',
  '14197': 'Wilmersdorf',
  '14199': 'Schmargendorf',
}

/** Longer prefixes first. Used only when the exact PLZ is missing. */
const PREFIX: Array<[string, string]> = [
  ['101', 'Mitte'],
  ['102', 'Friedrichshain'],
  ['103', 'Lichtenberg'],
  ['104', 'Prenzlauer Berg'],
  ['1055', 'Moabit'],
  ['1058', 'Charlottenburg'],
  ['106', 'Charlottenburg'],
  ['1070', 'Wilmersdorf'],
  ['1071', 'Wilmersdorf'],
  ['1077', 'Schöneberg'],
  ['1078', 'Tiergarten'],
  ['108', 'Schöneberg'],
  ['109', 'Kreuzberg'],
  ['120', 'Neukölln'],
  ['1210', 'Tempelhof'],
  ['1215', 'Friedenau'],
  ['1216', 'Steglitz'],
  ['123', 'Neukölln'],
  ['124', 'Treptow'],
  ['125', 'Köpenick'],
  ['126', 'Marzahn'],
  ['130', 'Hohenschönhausen'],
  ['131', 'Pankow'],
  ['133', 'Wedding'],
  ['134', 'Reinickendorf'],
  ['1350', 'Tegel'],
  ['1358', 'Spandau'],
  ['1359', 'Spandau'],
  ['1405', 'Westend'],
  ['1410', 'Wannsee'],
  ['1416', 'Zehlendorf'],
  ['1419', 'Grunewald'],
]

export function districtFromPostalCode(postalCode?: string | null): string | null {
  const code = postalCode?.replace(/\s/g, '') ?? ''
  if (!/^\d{5}$/.test(code)) return null
  const exact = EXACT[code]
  if (exact) return exact

  for (let n = 4; n >= 2; n--) {
    const prefix = code.slice(0, n)
    const hit = PREFIX.find(([p]) => p === prefix)
    if (hit) return hit[1]
  }

  return null
}
