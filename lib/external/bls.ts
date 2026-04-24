const serviceTypeToMonthlyPrior: Record<string, number> = {
  Plumber: 6200,
  Electrician: 6800,
  Cleaner: 3500,
  'HVAC Technician': 6100,
  Handyman: 4200,
  Landscaper: 4100,
  Painter: 4300,
  Roofer: 5000,
};

export async function fetchBlsMarketPrior(serviceType: string, state: string): Promise<number> {
  void state;
  return serviceTypeToMonthlyPrior[serviceType] ?? 4800;
}
