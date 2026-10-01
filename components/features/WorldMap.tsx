'use client';

import { useState, useMemo, useEffect } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Geography as GeographyType } from 'react-simple-maps';
import { Idea, Plan } from '@/lib/types';
import Modal from '../ui/Modal';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Link from 'next/link';
import { formatDateRange } from '@/lib/utils';

const GEO_URL = '/data/world-atlas.json';

interface WorldMapProps {
  ideas: Idea[];
  plans: Plan[];
  allPlans?: Plan[];
}

interface TooltipData {
  countryName: string;
  iso2: string;
  ideas: Idea[];
  plans: Plan[];
}

// ISO2 → ISO3 (kept for reference, not used for color lookup)
const ISO2_TO_ISO3: Record<string, string> = {
  'AF': 'AFG', 'AL': 'ALB', 'DZ': 'DZA', 'AR': 'ARG', 'AU': 'AUS',
  'AT': 'AUT', 'AZ': 'AZE', 'BS': 'BHS', 'BH': 'BHR', 'BD': 'BGD',
  'BB': 'BRB', 'BY': 'BLR', 'BE': 'BEL', 'BZ': 'BLZ', 'BJ': 'BEN',
  'BT': 'BTN', 'BO': 'BOL', 'BA': 'BIH', 'BW': 'BWA', 'BR': 'BRA',
  'BN': 'BRN', 'BG': 'BGR', 'BF': 'BFA', 'BI': 'BDI', 'CV': 'CPV',
  'KH': 'KHM', 'CM': 'CMR', 'CA': 'CAN', 'CF': 'CAF', 'TD': 'TCD',
  'CL': 'CHL', 'CN': 'CHN', 'CO': 'COL', 'KM': 'COM', 'CD': 'COD',
  'CG': 'COG', 'CR': 'CRI', 'CI': 'CIV', 'HR': 'HRV', 'CU': 'CUB',
  'CY': 'CYP', 'CZ': 'CZE', 'DK': 'DNK', 'DJ': 'DJI', 'DM': 'DMA',
  'DO': 'DOM', 'EC': 'ECU', 'EG': 'EGY', 'SV': 'SLV', 'GQ': 'GNQ',
  'ER': 'ERI', 'EE': 'EST', 'SZ': 'SWZ', 'ET': 'ETH', 'FJ': 'FJI',
  'FI': 'FIN', 'FR': 'FRA', 'GA': 'GAB', 'GM': 'GMB', 'GE': 'GEO',
  'DE': 'DEU', 'GH': 'GHA', 'GR': 'GRC', 'GD': 'GRD', 'GT': 'GTM',
  'GN': 'GIN', 'GW': 'GNB', 'GY': 'GUY', 'HT': 'HTI', 'HN': 'HND',
  'HU': 'HUN', 'IS': 'ISL', 'IN': 'IND', 'ID': 'IDN', 'IR': 'IRN',
  'IQ': 'IRQ', 'IE': 'IRL', 'IL': 'ISR', 'IT': 'ITA', 'JM': 'JAM',
  'JP': 'JPN', 'JO': 'JOR', 'KZ': 'KAZ', 'KE': 'KEN', 'KI': 'KIR',
  'KP': 'PRK', 'KR': 'KOR', 'KW': 'KWT', 'KG': 'KGZ', 'LA': 'LAO',
  'LV': 'LVA', 'LB': 'LBN', 'LS': 'LSO', 'LR': 'LBR', 'LY': 'LBY',
  'LI': 'LIE', 'LT': 'LTU', 'LU': 'LUX', 'MG': 'MDG', 'MW': 'MWI',
  'MY': 'MYS', 'MV': 'MDV', 'ML': 'MLI', 'MT': 'MLT', 'MH': 'MHL',
  'MR': 'MRT', 'MU': 'MUS', 'MX': 'MEX', 'FM': 'FSM', 'MD': 'MDA',
  'MC': 'MCO', 'MN': 'MNG', 'ME': 'MNE', 'MA': 'MAR', 'MZ': 'MOZ',
  'MM': 'MMR', 'NA': 'NAM', 'NR': 'NRU', 'NP': 'NPL', 'NL': 'NLD',
  'NZ': 'NZL', 'NI': 'NIC', 'NE': 'NER', 'NG': 'NGA', 'MK': 'MKD',
  'NO': 'NOR', 'OM': 'OMN', 'PK': 'PAK', 'PW': 'PLW', 'PS': 'PSE',
  'PA': 'PAN', 'PG': 'PNG', 'PY': 'PRY', 'PE': 'PER', 'PH': 'PHL',
  'PL': 'POL', 'PT': 'PRT', 'QA': 'QAT', 'RO': 'ROU', 'RU': 'RUS',
  'RW': 'RWA', 'KN': 'KNA', 'LC': 'LCA', 'VC': 'VCT', 'WS': 'WSM',
  'SM': 'SMR', 'ST': 'STP', 'SA': 'SAU', 'SN': 'SEN', 'RS': 'SRB',
  'SC': 'SYC', 'SL': 'SLE', 'SG': 'SGP', 'SK': 'SVK', 'SI': 'SVN',
  'SB': 'SLB', 'SO': 'SOM', 'ZA': 'ZAF', 'SS': 'SSD', 'ES': 'ESP',
  'LK': 'LKA', 'SD': 'SDN', 'SR': 'SUR', 'SE': 'SWE', 'CH': 'CHE',
  'SY': 'SYR', 'TW': 'TWN', 'TJ': 'TJK', 'TZ': 'TZA', 'TH': 'THA',
  'TL': 'TLS', 'TG': 'TGO', 'TO': 'TON', 'TT': 'TTO', 'TN': 'TUN',
  'TR': 'TUR', 'TM': 'TKM', 'TV': 'TUV', 'UG': 'UGA', 'UA': 'UKR',
  'AE': 'ARE', 'GB': 'GBR', 'US': 'USA', 'UY': 'URY', 'UZ': 'UZB',
  'VU': 'VUT', 'VA': 'VAT', 'VE': 'VEN', 'VN': 'VNM', 'YE': 'YEM',
  'ZM': 'ZMB', 'ZW': 'ZWE',
  // Also include territories / special codes present in TopoJSON
  'HK': 'HKG',
};

// TopoJSON uses numeric ISO 3166-1 IDs (e.g. 392=Japan, 724=Spain, 840=USA)
// DB stores countries as ISO2 codes (JP, ES, US...) — this maps numeric → ISO2
const NUMERIC_TO_ISO2: Record<string, string> = {
  '004': 'AF', '008': 'AL', '012': 'DZ', '020': 'AD', '024': 'AO',
  '028': 'AG', '032': 'AR', '051': 'AM', '036': 'AU', '040': 'AT',
  '031': 'AZ', '044': 'BS', '048': 'BH', '050': 'BD', '052': 'BB',
  '112': 'BY', '056': 'BE', '084': 'BZ', '204': 'BJ', '064': 'BT',
  '068': 'BO', '070': 'BA', '072': 'BW', '076': 'BR', '096': 'BN',
  '100': 'BG', '854': 'BF', '108': 'BI', '132': 'CV', '116': 'KH',
  '120': 'CM', '124': 'CA', '140': 'CF', '148': 'TD', '152': 'CL',
  '156': 'CN', '170': 'CO', '174': 'KM', '180': 'CD', '178': 'CG',
  '188': 'CR', '384': 'CI', '191': 'HR', '192': 'CU', '196': 'CY',
  '203': 'CZ', '208': 'DK', '262': 'DJ', '212': 'DM', '214': 'DO',
  '218': 'EC', '818': 'EG', '222': 'SV', '226': 'GQ', '232': 'ER',
  '233': 'EE', '748': 'SZ', '231': 'ET', '242': 'FJ', '246': 'FI',
  '250': 'FR', '266': 'GA', '270': 'GM', '268': 'GE', '276': 'DE',
  '288': 'GH', '300': 'GR', '308': 'GD', '320': 'GT', '324': 'GN',
  '624': 'GW', '328': 'GY', '332': 'HT', '340': 'HN', '348': 'HU',
  '352': 'IS', '356': 'IN', '360': 'ID', '364': 'IR', '368': 'IQ',
  '372': 'IE', '376': 'IL', '380': 'IT', '388': 'JM', '392': 'JP',
  '400': 'JO', '398': 'KZ', '404': 'KE', '296': 'KI', '408': 'KP',
  '410': 'KR', '414': 'KW', '417': 'KG', '418': 'LA', '428': 'LV',
  '422': 'LB', '426': 'LS', '430': 'LR', '434': 'LY', '438': 'LI',
  '440': 'LT', '442': 'LU', '450': 'MG', '454': 'MW', '458': 'MY',
  '462': 'MV', '466': 'ML', '470': 'MT', '584': 'MH', '478': 'MR',
  '480': 'MU', '484': 'MX', '583': 'FM', '498': 'MD', '492': 'MC',
  '496': 'MN', '499': 'ME', '504': 'MA', '508': 'MZ', '104': 'MM',
  '516': 'NA', '520': 'NR', '524': 'NP', '528': 'NL', '554': 'NZ',
  '558': 'NI', '562': 'NE', '566': 'NG', '807': 'MK', '578': 'NO',
  '512': 'OM', '586': 'PK', '585': 'PW', '275': 'PS', '591': 'PA',
  '598': 'PG', '600': 'PY', '604': 'PE', '608': 'PH', '616': 'PL',
  '620': 'PT', '634': 'QA', '642': 'RO', '643': 'RU', '646': 'RW',
  '659': 'KN', '662': 'LC', '670': 'VC', '882': 'WS', '674': 'SM',
  '678': 'ST', '682': 'SA', '686': 'SN', '688': 'RS', '690': 'SC',
  '694': 'SL', '702': 'SG', '703': 'SK', '705': 'SI', '090': 'SB',
  '706': 'SO', '710': 'ZA', '728': 'SS', '724': 'ES', '144': 'LK',
  '729': 'SD', '740': 'SR', '752': 'SE', '756': 'CH', '760': 'SY',
  '158': 'TW', '762': 'TJ', '834': 'TZ', '764': 'TH', '626': 'TL',
  '768': 'TG', '776': 'TO', '780': 'TT', '788': 'TN', '792': 'TR',
  '795': 'TM', '798': 'TV', '800': 'UG', '804': 'UA', '784': 'AE',
  '826': 'GB', '840': 'US', '858': 'UY', '860': 'UZ', '548': 'VU',
  '336': 'VA', '862': 'VE', '704': 'VN', '887': 'YE', '894': 'ZM',
  '716': 'ZW',
  // Territories present in TopoJSON world-atlas
  '344': 'HK', // Hong Kong
};

const ZOOM_STEP = 0.5;

export default function WorldMap({ ideas, plans, allPlans }: WorldMapProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<TooltipData | null>(null);
  const [zoom, setZoom] = useState(1);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // countryData keys are ISO2 codes matching DB country codes
  const countryData = useMemo(() => {
    const data: Record<string, { ideas: Idea[]; plans: Plan[] }> = {};

    ideas.forEach(idea => {
      idea.countries.forEach(code => {
        if (!data[code]) data[code] = { ideas: [], plans: [] };
        data[code].ideas.push(idea);
      });
    });

    const plansForColor = allPlans ?? plans;
    plansForColor.forEach(plan => {
      plan.countries.forEach(code => {
        if (!data[code]) data[code] = { ideas: [], plans: [] };
        data[code].plans.push(plan);
      });
    });

    return data;
  }, [ideas, plans, allPlans]);

  // iso2: ISO2 code from DB (JP, ES, US...)
  const getCountryColor = (iso2: string): string => {
    const data = countryData[iso2];
    if (!data) return '#E0D6C8';
    const hasCompleted = data.plans.some((p: Plan) => p.status === 'completed');
    if (hasCompleted) return '#9B59B6';  // purple — completed
    const hasPlans = data.plans.some((p: Plan) => p.status !== 'completed');
    if (hasPlans) return '#27AE60';       // green — planned
    const hasIdeas = data.ideas.length > 0;
    if (hasIdeas) return '#3498DB';       // blue — idea
    return '#E0D6C8';
  };

  // Convert numeric TopoJSON ID → ISO2 code
  const geoToIso2 = (geoId: string): string => {
    return NUMERIC_TO_ISO2[geoId] ?? geoId;
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + ZOOM_STEP, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - ZOOM_STEP, 0.5));

  const handleCountryClick = (geo: GeographyType) => {
    const iso2 = geoToIso2(String(geo.id));
    setSelectedCountry({
      countryName: geo.properties.name,
      iso2,
      ideas: countryData[iso2]?.ideas ?? [],
      plans: countryData[iso2]?.plans ?? [],
    });
  };

  return (
    <div className="relative w-full h-full">
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-secondary)]">
          <div className="animate-pulse text-[var(--text-secondary)] text-sm">Loading map…</div>
        </div>
      )}
      <ComposableMap
        projectionConfig={{ scale: 147, center: [0, 0] }}
        className={`w-full h-full ${mapLoaded ? '' : 'invisible'}`}
      >
        <ZoomableGroup zoom={zoom}>
          <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const iso2 = geoToIso2(String(geo.id));
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getCountryColor(iso2)}
                  stroke="#FDFBF7"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#E67E22', cursor: 'pointer' },
                    pressed: { outline: 'none' },
                  }}
                  onMouseEnter={() => {
                    const data = countryData[iso2] ?? { ideas: [], plans: [] };
                    setTooltip({
                      countryName: geo.properties.name,
                      iso2,
                      ideas: data.ideas,
                      plans: data.plans,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => handleCountryClick(geo)}
                />
              );
            })
          }
        </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={20} className="text-[var(--text-primary)]" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
          title="Zoom out"
        >
          <ZoomOut size={20} className="text-[var(--text-primary)]" />
        </button>
      </div>

      {tooltip && (
        <div
          className="absolute z-50 px-3 py-2 bg-white rounded-lg shadow-lg border border-[var(--border)] text-sm pointer-events-none"
          style={{ left: '50%', top: '10px', transform: 'translateX(-50%)' }}
        >
          <p className="font-semibold text-[var(--text-primary)]">{tooltip.countryName}</p>
          {tooltip.ideas.length > 0 && <p className="text-[var(--idea-color)]">{tooltip.ideas.length} idea(s)</p>}
          {tooltip.plans.length > 0 && <p className="text-[var(--plan-color)]">{tooltip.plans.length} plan(es)</p>}
          {tooltip.ideas.length === 0 && tooltip.plans.length === 0 && (
            <p className="text-[var(--text-secondary)]">No trips</p>
          )}
        </div>
      )}

      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
        <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">Legend</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3498DB' }}></div>
            <span className="text-xs text-[var(--text-primary)]">Ideas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#27AE60' }}></div>
            <span className="text-xs text-[var(--text-primary)]">Plans</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#9B59B6' }}></div>
            <span className="text-xs text-[var(--text-primary)]">Completed</span>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedCountry}
        onClose={() => setSelectedCountry(null)}
        title={selectedCountry?.countryName || ''}
      >
        {selectedCountry && (
          <div className="space-y-4">
            {selectedCountry.ideas.length > 0 && (
              <div>
                <h3 className="font-semibold text-[var(--idea-color)] mb-2">Ideas</h3>
                <div className="space-y-2">
                  {selectedCountry.ideas.map(idea => (
                    <Card key={idea.id} className="p-3">
                      <p className="font-medium text-[var(--text-primary)]">{idea.title}</p>
                      {idea.estimated_start_date && (
                        <p className="text-sm text-[var(--text-secondary)]">
                          {formatDateRange(idea.estimated_start_date, idea.estimated_end_date)}
                        </p>
                      )}
                      <Link href={`/ideas/${idea.id}/edit`}>
                        <Button variant="secondary" size="sm" className="mt-2">
                          Ver idea
                        </Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {selectedCountry.plans.length > 0 && (
              <div>
                <h3 className="font-semibold text-[var(--plan-color)] mb-2">Plans</h3>
                <div className="space-y-2">
                  {selectedCountry.plans.map(plan => (
                    <Card key={plan.id} className="p-3">
                      <p className="font-medium text-[var(--text-primary)]">{plan.title}</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {formatDateRange(plan.start_date, plan.end_date)}
                      </p>
                      <Link href={`/plans/${plan.id}/edit`}>
                        <Button variant="secondary" size="sm" className="mt-2">
                          Ver plan
                        </Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {selectedCountry.ideas.length === 0 && selectedCountry.plans.length === 0 && (
              <p className="text-[var(--text-secondary)] text-center py-4">
                No trips to this country
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
