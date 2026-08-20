export interface DocumentConfig {
  copies: number;
  colorMode: 'B&W' | 'Color';
  paperSize: 'A4' | 'A3' | 'Legal' | 'Other';
  sides: 'Single-sided' | 'Double-sided';
  binding: 'None' | 'Spiral' | 'Project Binding' | 'Soft Binding' | 'Hard Binding';
  paperType: '70 GSM Standard' | '80 GSM Premium' | 'Glossy' | 'Photo Paper';
  estimatedPageCount?: number;
}

export function calculateItemPrice(config: DocumentConfig, ratesMap?: Record<string, number>): number {
  const pages = Math.max(1, config.estimatedPageCount || 10);
  const copies = Math.max(1, config.copies || 1);

  // Default rate fallbacks if dynamic map not supplied
  const rates = {
    bw_a4_single: ratesMap?.['bw_a4_single'] ?? 2.0,
    bw_a4_double: ratesMap?.['bw_a4_double'] ?? 1.5,
    color_a4_single: ratesMap?.['color_a4_single'] ?? 10.0,
    color_a4_double: ratesMap?.['color_a4_double'] ?? 8.0,
    bw_a3_single: ratesMap?.['bw_a3_single'] ?? 5.0,
    color_a3_single: ratesMap?.['color_a3_single'] ?? 25.0,
    spiral_binding: ratesMap?.['spiral_binding'] ?? 35.0,
    spiral_binding_heavy: ratesMap?.['spiral_binding_heavy'] ?? 50.0,
    project_hard_binding: ratesMap?.['project_hard_binding'] ?? 180.0,
    soft_cover_binding: ratesMap?.['soft_cover_binding'] ?? 25.0,
    paper_80gsm_extra: ratesMap?.['paper_80gsm_extra'] ?? 0.5,
  };

  let perPageRate = 2.0;

  if (config.paperSize === 'A3') {
    perPageRate = config.colorMode === 'Color' ? rates.color_a3_single : rates.bw_a3_single;
  } else {
    // A4 / Legal / Default
    if (config.colorMode === 'Color') {
      perPageRate = config.sides === 'Double-sided' ? rates.color_a4_double : rates.color_a4_single;
    } else {
      perPageRate = config.sides === 'Double-sided' ? rates.bw_a4_double : rates.bw_a4_single;
    }
  }

  // Paper type surcharge
  let paperSurcharge = 0;
  if (config.paperType === '80 GSM Premium') {
    paperSurcharge = rates.paper_80gsm_extra;
  } else if (config.paperType === 'Glossy') {
    paperSurcharge = 3.0;
  } else if (config.paperType === 'Photo Paper') {
    paperSurcharge = 5.0;
  }

  const printTotal = (perPageRate + paperSurcharge) * pages * copies;

  // Binding total
  let bindingTotal = 0;
  if (config.binding === 'Spiral') {
    bindingTotal = pages > 100 ? rates.spiral_binding_heavy : rates.spiral_binding;
  } else if (config.binding === 'Project Binding' || config.binding === 'Hard Binding') {
    bindingTotal = rates.project_hard_binding;
  } else if (config.binding === 'Soft Binding') {
    bindingTotal = rates.soft_cover_binding;
  }

  return Math.round((printTotal + bindingTotal) * 100) / 100;
}
