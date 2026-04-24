const serviceTypeToMonthlyPrior: Record<string, number> = {
  Plumber: 6200,
  Electrician: 6800,
  Cleaner: 3500,
  'HVAC Technician': 6100,
  Handyman: 4200,
  Landscaper: 4100,
  Painter: 4300,
  Roofer: 5000,
  Carpenter: 5200,
  'Pest Control': 4600,
  'Pool Service': 4800,
  'Flooring Installer': 5100,
  'Appliance Repair': 3900,
  Locksmith: 4500,
  'Auto Detailer': 3800,
  'Dog Groomer': 3200,
  'Personal Trainer': 4000,
  'Pressure Washer': 3600,
  'Window Cleaner': 3400,
  'Junk Removal': 4300,
  Mover: 5500,
  'Tile & Stone': 5800,
  'Snow Removal': 3300,
  'Irrigation Specialist': 4700,
  'Tree Service': 5600,
  'Drywall & Plaster': 4400,
};

export const ALL_SERVICE_TYPES = Object.keys(serviceTypeToMonthlyPrior);

export async function fetchBlsMarketPrior(serviceType: string, state: string): Promise<number> {
  void state;
  return serviceTypeToMonthlyPrior[serviceType] ?? 4800;
}
