// How a new home gets permitted and inspected in each city, in plain language.
// Public, sourced information (researched Oct 2026). The stage keys drive the live build tracker.

export interface Bi { es: string; en: string }

export type StageKey = 'permit' | 'power' | 'underground' | 'foundation' | 'framing' | 'insulation' | 'drywall' | 'final' | 'co';

export interface Stage {
  /** Unique within the city; cities name and split their inspections differently. */
  key: string;
  /** Name the city uses. */
  name: Bi;
  when: Bi;
  checks: Bi;
  source: string;
}

export interface Jurisdiction {
  key: string;
  name: string;
  /** Subdivision slugs this city permits. */
  communities: string[];
  office: Bi;
  checklist: Bi[];
  stages: Stage[];
  fees: Bi[];
  utilities: Bi;
  schedule: Bi;
  sources: { label: string; url: string }[];
  /** Research still pending for this city. */
  pending?: boolean;
}

const b = (es: string, en: string): Bi => ({ es, en });

export const STAGE_ORDER: StageKey[] = ['permit', 'power', 'underground', 'foundation', 'framing', 'insulation', 'drywall', 'final', 'co'];

/** Short stage names for the progress bar. */
export const STAGE_SHORT: Record<StageKey, Bi> = {
  permit: b('Permiso', 'Permit'),
  power: b('Luz de obra', 'Temp power'),
  underground: b('Plomería bajo losa', 'Under-slab plumbing'),
  foundation: b('Cimentación', 'Foundation'),
  framing: b('Estructura e instalaciones', 'Framing and rough-ins'),
  insulation: b('Aislamiento', 'Insulation'),
  drywall: b('Tablaroca y sellado', 'Drywall and air sealing'),
  final: b('Inspección final', 'Final inspection'),
  co: b('Certificado de ocupación', 'Certificate of occupancy'),
};

const MCALLEN_CHECKLIST = 'https://mcallen.net/docs/default-source/permits-inspections-files/checklist-residential-submittals-rev-1-26.pdf';
const MCALLEN_STEPS = 'https://www.buildmcallen.com/step11.html';
const MISSION_FORM = 'https://www.missiontexas.us/DocumentCenter/View/1554/Residential-Building-Permit-Applicationpdf';
const MISSION_CODE = 'https://library.municode.com/tx/mission/codes/code_of_ordinances?nodeId=PTIICOOR_CH18BUBURE_ARTIIBUCO';
const MCALLEN_FEES = 'https://mcallen.net/docs/default-source/permits-inspections-files/permit-fee-schedule.pdf';

export const JURISDICTIONS: Jurisdiction[] = [
  {
    key: 'mcallen',
    name: 'McAllen',
    communities: ['one-place-pecan'],
    office: b(
      'Departamento de Permisos e Inspecciones de McAllen, 311 N. 15th St. Los permisos y resultados quedan registrados en el portal en línea de la ciudad.',
      'McAllen Building Permits & Inspections, 311 N. 15th St. Permits and results are recorded in the city’s online portal.',
    ),
    checklist: [
      b('El plano del fraccionamiento debe estar registrado: sin eso la ciudad no recibe la solicitud.', 'The subdivision plat must be recorded: without it the city will not accept the application.'),
      b('Solicitud residencial completa (descripción legal, áreas habitable y no habitable, altura, recámaras).', 'Complete residential application (legal description, living and non-living area, height, bedrooms).'),
      b('Plano de sitio con linderos, servidumbres, retiros y accesos.', 'Site plan with property lines, easements, setbacks and access.'),
      b('Planta, fachadas, detalle de escalera y detalles de muro cortafuego entre casas (townhomes).', 'Floor plan, elevations, stair detail and fire-wall details between units (townhomes).'),
      b('Diseño firmado por ingeniero bajo el código IRC 2024 (cimentación y arriostramiento).', 'Engineer-sealed design under the 2024 IRC (foundation and wall bracing).'),
      b('Reporte de cumplimiento energético IECC 2024 y cálculos de aire acondicionado (Manual J, D y S).', '2024 IECC energy compliance report and HVAC load calculations (Manual J, D and S).'),
      b('Plan de drenaje y detención aprobado por Ingeniería de la ciudad, si el plano lo exige.', 'Drainage and detention plan approved by City Engineering, if the plat requires it.'),
      b('Permisos de electricidad, plomería, gas y aire: los saca cada contratista con licencia y registro en la ciudad.', 'Electrical, plumbing, gas and HVAC permits: each licensed, city-registered contractor pulls its own.'),
    ],
    stages: [
      { key: 'permit', name: b('Permiso de construcción', 'Building permit'), when: b('Se firman condiciones y se pagan derechos en la oficina. Sin permiso no se empieza.', 'Conditions are signed and fees paid at the office. No work starts without it.'), checks: b('Revisión de planos y documentos de la lista.', 'Plan and document review against the checklist.'), source: 'https://www.buildmcallen.com/step10.html' },
      { key: 'power', name: b('Poste de luz temporal', 'Electrical temporary pole'), when: b('Después de solicitar el permiso. AEP Texas conecta tras la inspección.', 'After the permit application. AEP Texas connects after inspection.'), checks: b('Instalación del poste de luz de obra según el código eléctrico.', 'Construction power pole installed to the electrical code.'), source: MCALLEN_STEPS },
      { key: 'underground', name: b('Plomería bajo losa', 'Rough-in plumbing (underground)'), when: b('Antes de cimbrar y colar la losa.', 'Before forming and pouring the slab.'), checks: b('Material aprobado, pendientes correctas, ventilación y prueba de agua de 10 pies.', 'Approved material, correct slope, venting and a 10-ft water test.'), source: MCALLEN_STEPS },
      { key: 'foundation', name: b('Cimentación (acero)', 'Foundation / steel'), when: b('Con cimbra, acero y barrera de humedad puestos, antes del colado.', 'With forms, steel and vapor barrier in place, before the pour.'), checks: b('Zanjas, varilla, malla, anclas, barrera de humedad y nivel de piso verificado con tránsito.', 'Trenches, rebar, mesh, anchor bolts, vapor barrier and floor elevation checked by transit.'), source: MCALLEN_STEPS },
      { key: 'framing', name: b('Estructura con instalaciones', 'Framing (with electrical, mechanical and plumbing rough-ins)'), when: b('Con la casa techada y todas las instalaciones ocultas, antes de aislar.', 'Once dried-in with all rough-ins done, before insulation.'), checks: b('Estructura, anclajes, arriostramiento, instalaciones eléctricas, de aire, plomería y gas.', 'Framing, anchors, bracing, electrical, HVAC, plumbing and gas.'), source: MCALLEN_STEPS },
      { key: 'insulation', name: b('Aislamiento', 'Insulation'), when: b('Con el aislamiento colocado, antes de la tablaroca.', 'With insulation installed, before drywall.'), checks: b('Cobertura y valores R según el reporte energético.', 'Coverage and R-values per the energy report.'), source: MCALLEN_STEPS },
      { key: 'drywall', name: b('Sellado (infiltración)', 'Infiltration'), when: b('Con la tablaroca colocada.', 'With drywall hung.'), checks: b('Sellado de muros exteriores, perforaciones y cajas eléctricas según el código de energía.', 'Sealing of exterior walls, penetrations and outlet boxes per the energy code.'), source: MCALLEN_STEPS },
      { key: 'final', name: b('Inspección final (todos los departamentos)', 'Final inspection (all departments)'), when: b('Al terminar. Cada departamento que reprueba cobra $48 de reinspección.', 'At completion. Each department that fails charges a $48 reinspection.'), checks: b('Barandales, cerraduras, campana, puertas, instalaciones terminadas y equipos.', 'Railings, locks, hood vent, doors, finished trades and equipment.'), source: MCALLEN_STEPS },
      { key: 'co', name: b('Certificado de ocupación', 'Certificate of occupancy'), when: b('Con todas las finales aprobadas.', 'With every final approved.'), checks: b('Nadie puede habitar la casa sin este certificado.', 'No one may live in the home without it.'), source: MCALLEN_STEPS },
    ],
    fees: [
      b('Permiso de construcción: $0.16 por ft² (habitable + no habitable).', 'Building permit: $0.16 per sq ft (living + non-living).'),
      b('Toma de agua 5/8" x 3/4": $650 si ya existe, $1,250 si es nueva. Sin cuotas de impacto de agua o drenaje.', 'Water tap 5/8" x 3/4": $650 existing, $1,250 new. No water or sewer impact fees.'),
      b('Cuota de parques: $700 por casa si no se pagó al registrar el fraccionamiento.', 'Park fee: $700 per home unless paid at platting.'),
      b('Permisos de oficios: base de $15.60 a $39.60 más cargos por salida o equipo.', 'Trade permits: $15.60 to $39.60 base plus per-outlet or equipment charges.'),
    ],
    utilities: b(
      'Agua y drenaje: McAllen Public Utility (depósito residencial $100, conexión $25). Luz: AEP Texas (poste temporal y servicio permanente). Gas: Texas Gas Service.',
      'Water and sewer: McAllen Public Utility ($100 residential deposit, $25 connection). Power: AEP Texas (temporary pole and permanent service). Gas: Texas Gas Service.',
    ),
    schedule: b(
      'Las inspecciones se piden por teléfono (956-681-1328) o en el portal. Por la mañana: pedirla entre las 12:00 del día anterior y las 6:59. Resultados por correo: etiqueta verde aprobada, roja reprobada.',
      'Inspections are requested by phone (956-681-1328) or online. Morning slots: request between 12:00 the day before and 6:59. Results by email: green tag passed, red tag failed.',
    ),
    sources: [
      { label: 'McAllen: lista de requisitos residenciales (rev. 1/2026)', url: MCALLEN_CHECKLIST },
      { label: 'Build McAllen: inspecciones', url: MCALLEN_STEPS },
      { label: 'McAllen: tabla de derechos', url: MCALLEN_FEES },
      { label: 'McAllen Public Utility: nuevo servicio', url: 'https://www.mcallenpublicutility.com/residential-commercial/new-service.html' },
    ],
  },
  {
    key: 'mission',
    name: 'Mission',
    communities: ['laguna-heights', 'laguna-oaks'],
    office: b(
      'División de Inspecciones de la Ciudad de Mission (Departamento de Planeación). Laguna Heights y Laguna Oaks están dentro de los límites de la ciudad: la ciudad da los permisos e inspecciona.',
      'City of Mission Inspections Division (Planning Department). Laguna Heights and Laguna Oaks are inside city limits: the city issues permits and inspects.',
    ),
    checklist: [
      b('El lote debe estar en un plano registrado y con uso de suelo unifamiliar.', 'The lot must be in a recorded plat and zoned single-family.'),
      b('Solicitud residencial con número de propiedad del distrito de avalúo (GEO ID), lote, manzana y áreas.', 'Residential application with the appraisal district property ID (GEO ID), lot, block and areas.'),
      b('Juego de planos en hojas 11x17: sitio, cimentación, planta, instalaciones, fachadas, entrada y banqueta.', 'Plan set on 11x17 sheets: site, foundation, floor, MEP, elevations, driveway and sidewalk.'),
      b('Reporte energético REScheck 2024 y cálculo de aire acondicionado (Manual J, tonelaje y SEER).', '2024 REScheck energy report and HVAC calculation (Manual J, tonnage and SEER).'),
      b('Plano de vientos (windstorm) firmado por ingeniero: lo exige la ciudad.', 'Engineer-sealed windstorm plan: a city requirement.'),
      b('Contratista general registrado en la ciudad; cada oficio con licencia estatal saca su propio permiso.', 'General contractor registered with the city; each state-licensed trade pulls its own permit.'),
      b('Laguna Heights: plan de drenaje y detención aprobado por Ingeniería antes del permiso (nota del plano).', 'Laguna Heights: drainage and detention plan approved by Engineering before the permit (plat note).'),
      b('Certificado de tratamiento contra termitas de toda la losa.', 'Termite treatment certificate for the whole slab.'),
    ],
    stages: [
      { key: 'permit', name: b('Permiso de construcción', 'Building permit'), when: b('De 3 a 5 días hábiles para recogerlo con el paquete completo.', '3 to 5 business days to pick up with a complete package.'), checks: b('Revisión de planos, energía, vientos y retiros del plano.', 'Review of plans, energy, windstorm and plat setbacks.'), source: MISSION_FORM },
      { key: 'power', name: b('Poste de luz temporal (opcional)', 'Temporary pole (optional)'), when: b('Antes de poner luz de obra.', 'Before construction power is set.'), checks: b('Base de medidor, centro de carga, contactos protegidos y tierra física.', 'Meter can, breaker panel, protected outlets and ground rod.'), source: MISSION_CODE },
      { key: 'underground', name: b('Plomería bajo losa', 'Plumbing rough-in (underground)'), when: b('Con la tubería bajo losa instalada, antes del colado.', 'With under-slab piping in, before the pour.'), checks: b('Prueba de agua; hilos en los linderos para revisar retiros.', 'Water test; string lines on property pins to check setbacks.'), source: MISSION_FORM },
      { key: 'sewer', name: b('Toma de drenaje', 'Sewer tap'), when: b('Al conectar el drenaje de la casa a la red de la ciudad.', 'When the house sewer connects to the city main.'), checks: b('Conexión al drenaje municipal ($200 la toma de 4 pulgadas).', 'Connection to the city sewer ($200 for a 4-inch tap).'), source: MISSION_FORM },
      { key: 'foundation', name: b('Cimentación (acero)', 'Foundation (steel)'), when: b('Con cimbra, plástico, acero y anclas, antes del colado.', 'With forms, poly, steel and anchor bolts, before the pour.'), checks: b('Mínimos locales de vigas y varilla (por ejemplo vigas exteriores de 12x30 pulgadas en una planta).', 'Local beam and rebar minimums (e.g. 12x30-inch exterior beams for one story).'), source: MISSION_CODE },
      { key: 'nailing', name: b('Patrón de clavado', 'Nail pattern'), when: b('Con muros y techo forrados, antes de la barrera de humedad.', 'With walls and roof sheathed, before house wrap.'), checks: b('Clavado según el plano de vientos firmado.', 'Nailing per the sealed windstorm plan.'), source: MISSION_FORM },
      { key: 'framing', name: b('Estructura con instalaciones', 'Framing with rough-ins'), when: b('Con estructura e instalaciones completas, antes de aislar.', 'With framing and all rough-ins complete, before insulation.'), checks: b('Amarres contra viento de cimentación a techo, electricidad, aire, tuberías y ventilas.', 'Wind tie-downs from foundation to roof, electrical, HVAC, piping and vents.'), source: MISSION_FORM },
      { key: 'wrap', name: b('Barrera de humedad y ventanas', 'House wrap and windows'), when: b('Con barrera, tapajuntas y ventanas, antes del recubrimiento exterior.', 'With wrap, sill flashing and windows, before exterior cladding.'), checks: b('Barrera contra agua, tapajuntas en ventanas y ventanas instaladas.', 'Water-resistive barrier, window sill flashing and installed windows.'), source: MISSION_FORM },
      { key: 'insulation', name: b('Aislamiento', 'Insulation'), when: b('Con el aislamiento colocado, antes de la tablaroca.', 'With insulation installed, before drywall.'), checks: b('Mínimo local R-13 en muros y R-19 en techo; manda el código de energía si es más estricto.', 'Local minimum R-13 walls and R-19 ceilings; the energy code governs if stricter.'), source: MISSION_CODE },
      { key: 'infiltration', name: b('Sellado (infiltración)', 'Infiltration (air sealing)'), when: b('Antes de la tablaroca.', 'Before drywall.'), checks: b('Sellado de cajas eléctricas, tuberías, ductos, extractores y lámparas empotradas.', 'Sealing at electrical boxes, pipes, ducts, exhaust fans and recessed lights.'), source: MISSION_FORM },
      { key: 'flatwork', name: b('Entrada y banqueta', 'Driveway and sidewalk'), when: b('Antes de colar entrada y banqueta.', 'Before pouring driveway and sidewalk.'), checks: b('Pasajuntas lisas, concreto de 3,000 psi y ancho de banqueta.', 'Smooth dowels, 3,000 psi concrete and sidewalk width.'), source: MISSION_CODE },
      { key: 'tclear', name: b('Liberación eléctrica (T-Clear)', 'Electrical clearance (T-Clear)'), when: b('Lista para servicio permanente, antes de que AEP Texas conecte el medidor.', 'Ready for permanent service, before AEP Texas sets the meter.'), checks: b('Aprobación del servicio eléctrico; se requiere el número ESID.', 'Electrical service approval; the ESID number is required.'), source: MISSION_FORM },
      { key: 'final', name: b('Inspección final (todos los oficios)', 'Final inspection (all trades)'), when: b('Al terminar. La reinspección cuesta $50 por oficio.', 'At completion. Reinspection is $50 per trade.'), checks: b('Casa abierta y lista, lote nivelado y limpio, certificado de energía.', 'Home open and ready, lot graded and clean, energy certificate.'), source: MISSION_FORM },
      { key: 'co', name: b('Certificado de ocupación', 'Certificate of occupancy'), when: b('Con todas las finales aprobadas; se entrega en 24 a 48 horas.', 'With every final passed; issued in 24 to 48 hours.'), checks: b('La casa no se habita antes del certificado.', 'The home is not occupied before the certificate.'), source: MISSION_FORM },
    ],
    fees: [
      b('Permiso de construcción: $30 de base más $0.15 por ft² habitable y no habitable.', 'Building permit: $30 base plus $0.15 per sq ft living and non-living.'),
      b('Electricidad y plomería: de $125 a $150 cada uno según el tamaño, más cargos por muebles; aire: $60 más $7 por tonelada.', 'Electrical and plumbing: $125 to $150 each by size, plus fixture charges; HVAC: $60 plus $7 per ton.'),
      b('Toma de agua de 3/4 pulgada: $680; toma de drenaje: $200; depósito de servicio: $100.', '3/4-inch water tap: $680; sewer tap: $200; service deposit: $100.'),
      b('Certificado de ocupación: $50. Cuota de parques: $650 a $750 por casa si no se pagó al registrar el plano.', 'Certificate of occupancy: $50. Park fee: $650 to $750 per home unless paid at plat recording.'),
    ],
    utilities: b(
      'Agua y drenaje: Ciudad de Mission (toma de agua en 6 a 10 días hábiles tras el permiso). Luz: AEP Texas, que conecta después de la liberación eléctrica de la ciudad. Cuota de drenaje pluvial: $3 al mes.',
      'Water and sewer: City of Mission (water tap in 6 to 10 business days after the permit). Power: AEP Texas, which connects after the city\u2019s electrical clearance. Storm drainage fee: $3 a month.',
    ),
    schedule: b(
      'El contratista pide cada inspección al (956) 584-5161. Llamadas de 8:00 a 12:00 se inspeccionan esa tarde; de 12:00 a 5:00, a la mañana siguiente. Los planos revisados deben estar en la obra.',
      'The contractor requests each inspection at (956) 584-5161. Calls 8:00 to 12:00 are inspected that afternoon; 12:00 to 5:00, the next morning. Reviewed plans must be on site.',
    ),
    sources: [
      { label: 'Mission: solicitud de permiso residencial (rev. 06/2025)', url: MISSION_FORM },
      { label: 'Mission: Código de Ordenanzas, cap. 18', url: MISSION_CODE },
      { label: 'Mission: División de Inspecciones', url: 'https://missiontexas.us/210/Inspections-Division' },
      { label: 'Mission: solicitud de toma de agua', url: 'https://missiontexas.us/DocumentCenter/View/332/Water-Tap-Application-PDF' },
    ],
  },
];

export const jurisdictionFor = (community: string) => JURISDICTIONS.find((j) => j.communities.includes(community)) ?? null;
