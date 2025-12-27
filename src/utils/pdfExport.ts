import jsPDF from 'jspdf';
import type { InvestmentData, XIRRResult } from '../types/investment';
import { generatePaymentSchedule } from './xirr';

interface PDFExportOptions {
  data: InvestmentData;
  result: XIRRResult;
  currency: string;
  symbol: string;
  formatDisplay: (idr: number) => string;
  formatAbbrev: (idr: number) => string;
  rate: number;
}

// Light theme color palette (matching the new design)
const COLORS = {
  white: [255, 255, 255] as [number, number, number],
  background: [250, 250, 250] as [number, number, number],
  surface: [255, 255, 255] as [number, number, number],
  surfaceAlt: [249, 250, 251] as [number, number, number],
  border: [229, 231, 235] as [number, number, number],
  borderLight: [243, 244, 246] as [number, number, number],
  primary: [34, 197, 94] as [number, number, number],  // Green
  primaryDark: [22, 163, 74] as [number, number, number],
  textPrimary: [17, 24, 39] as [number, number, number],  // Gray-900
  textSecondary: [107, 114, 128] as [number, number, number],  // Gray-500
  textMuted: [156, 163, 175] as [number, number, number],  // Gray-400
  red: [239, 68, 68] as [number, number, number],
  redLight: [254, 226, 226] as [number, number, number],
  green: [34, 197, 94] as [number, number, number],
  greenLight: [220, 252, 231] as [number, number, number],
  greenDark: [22, 101, 52] as [number, number, number],
  orange: [249, 115, 22] as [number, number, number],
  orangeLight: [255, 237, 213] as [number, number, number],
  cyan: [6, 182, 212] as [number, number, number],
  cyanLight: [207, 250, 254] as [number, number, number],
};

// Helper to truncate text to fit width
function truncateText(doc: jsPDF, text: string, maxWidth: number): string {
  if (doc.getTextWidth(text) <= maxWidth) return text;
  let truncated = text;
  while (doc.getTextWidth(truncated + '...') > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '...';
}

// Calculate Deal Rating based on XIRR
function getDealRating(xirr: number): { rating: string; color: [number, number, number]; confidence: number } {
  if (xirr >= 0.25) return { rating: 'Excellent', color: COLORS.green, confidence: 92 };
  if (xirr >= 0.18) return { rating: 'Very Good', color: COLORS.green, confidence: 85 };
  if (xirr >= 0.12) return { rating: 'Good', color: COLORS.primaryDark, confidence: 78 };
  if (xirr >= 0.08) return { rating: 'Fair', color: COLORS.orange, confidence: 70 };
  if (xirr >= 0) return { rating: 'Below Average', color: COLORS.orange, confidence: 60 };
  return { rating: 'Poor', color: COLORS.red, confidence: 50 };
}

// Generate AI summary text
function generateAISummary(
  data: InvestmentData,
  result: XIRRResult,
  symbol: string,
  formatDisplay: (idr: number) => string,
  pricePerSqm: number
): string {
  const xirr = (result.rate * 100).toFixed(1);
  const years = (result.holdPeriodMonths / 12).toFixed(1);
  const location = data.property.location || 'the selected area';
  const projectName = data.property.projectName || 'This property';

  const appreciation = data.property.totalPrice > 0
    ? ((data.exit.projectedSalesPrice - data.property.totalPrice) / data.property.totalPrice) * 100
    : 0;

  let strategy = '';
  if (data.exit.strategyType === 'flip') {
    strategy = 'likely targeting a flip upon construction completion';
  } else if (data.exit.strategyType === 'rent-resell') {
    strategy = 'planning to generate rental income before resale';
  } else {
    strategy = 'focusing on long-term rental yield';
  }

  return `${projectName} in ${location} presents a ${result.rate >= 0.15 ? 'high-alpha' : 'moderate'} investment profile. The projected XIRR of ${xirr}% over a ${years}-year horizon indicates a ${result.rate >= 0.2 ? 'robust' : 'reasonable'} short-term capital appreciation play, ${strategy}. At ${symbol}${formatDisplay(Math.round(pricePerSqm * (data.property.currency === 'IDR' ? 1 : 1)))} per sqm, the entry point is ${appreciation >= 25 ? 'highly competitive' : 'reasonable'} for this region.`;
}

// Get market risk assessment
function getMarketRisk(holdPeriodMonths: number, appreciation: number): string {
  if (holdPeriodMonths <= 18 && appreciation <= 30) return 'Low';
  if (holdPeriodMonths <= 24 && appreciation <= 40) return 'Moderate';
  return 'High';
}

// Draw rounded rectangle helper
function drawRoundedRect(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: boolean = true,
  stroke: boolean = false
) {
  doc.roundedRect(x, y, w, h, r, r, fill ? (stroke ? 'FD' : 'F') : 'S');
}

export function generatePDFReport(options: PDFExportOptions): void {
  const { data, result, currency, symbol, formatDisplay, rate } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Calculate derived values
  const pricePerSqm = data.property.propertySize > 0
    ? Math.round(data.property.totalPrice / data.property.propertySize / rate)
    : 0;
  const totalROI = result.totalInvested > 0
    ? (result.netProfit / result.totalInvested) * 100
    : 0;
  const appreciation = data.property.totalPrice > 0
    ? ((data.exit.projectedSalesPrice - data.property.totalPrice) / data.property.totalPrice) * 100
    : 0;
  const closingCosts = data.exit.projectedSalesPrice * (data.exit.closingCostPercent / 100);
  const netProceeds = data.exit.projectedSalesPrice - closingCosts;
  const dealRating = getDealRating(result.rate);
  const marketRisk = getMarketRisk(result.holdPeriodMonths, appreciation);

  // Convert IDR to display currency
  const toDisplay = (idr: number): number => Math.round(idr / rate);

  // ============================================
  // PAGE BACKGROUND
  // ============================================
  doc.setFillColor(...COLORS.background);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // ============================================
  // HEADER SECTION
  // ============================================

  // CONFIDENTIAL badge
  doc.setFillColor(...COLORS.orangeLight);
  doc.roundedRect(margin, yPos, 28, 5, 1, 1, 'F');
  doc.setTextColor(...COLORS.orange);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFIDENTIAL', margin + 14, yPos + 3.5, { align: 'center' });

  // INVESTMENT REPORT label
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('INVESTMENT REPORT', margin + 32, yPos + 3.5);

  // Generated date (right side)
  doc.setTextColor(...COLORS.textMuted);
  doc.setFontSize(6);
  doc.text('GENERATED ON', pageWidth - margin, yPos + 2, { align: 'right' });
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  doc.text(dateStr, pageWidth - margin, yPos + 6, { align: 'right' });
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(`Base Currency: ${currency}`, pageWidth - margin, yPos + 10, { align: 'right' });

  yPos += 10;

  // Project Name (large)
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(truncateText(doc, data.property.projectName || 'Untitled Project', contentWidth * 0.6), margin, yPos);
  yPos += 6;

  // Location and property size
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const locationText = `📍 ${data.property.location || 'Location not set'}`;
  const sizeText = data.property.propertySize > 0 ? ` · ${data.property.propertySize} m² Property` : '';
  doc.text(locationText + sizeText, margin, yPos);
  yPos += 10;

  // ============================================
  // KEY METRICS ROW (5 boxes)
  // ============================================
  const metricBoxWidth = (contentWidth - 8) / 5;
  const metricBoxHeight = 28;

  doc.setFillColor(...COLORS.surface);
  drawRoundedRect(doc, margin, yPos, contentWidth, metricBoxHeight, 3, true, false);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(margin, yPos, contentWidth, metricBoxHeight, 3, 3, 'S');

  const metrics = [
    {
      label: 'PROJECTED XIRR',
      value: `${(result.rate * 100).toFixed(1)}%`,
      subtitle: 'Internal Rate of Return',
      color: result.rate >= 0 ? COLORS.green : COLORS.red
    },
    {
      label: 'NET PROFIT',
      value: `${result.netProfit >= 0 ? '+' : ''}${symbol}${toDisplay(Math.abs(result.netProfit)).toLocaleString()}`,
      subtitle: 'Total Gain on Exit',
      color: COLORS.textPrimary
    },
    {
      label: 'TOTAL ROI',
      value: `${totalROI.toFixed(1)}%`,
      subtitle: 'Return on Investment',
      color: COLORS.textPrimary
    },
    {
      label: 'TOTAL INVESTMENT',
      value: `${symbol}${toDisplay(result.totalInvested).toLocaleString()}`,
      subtitle: 'Including Fees',
      color: COLORS.textPrimary
    },
    {
      label: 'INV. PERIOD',
      value: `${(result.holdPeriodMonths / 12).toFixed(1)} Yrs`,
      subtitle: `${Math.floor(result.holdPeriodMonths / 12)} Year${Math.floor(result.holdPeriodMonths / 12) !== 1 ? 's' : ''} ${result.holdPeriodMonths % 12} Months`,
      color: COLORS.textPrimary
    },
  ];

  metrics.forEach((metric, i) => {
    const boxX = margin + 2 + i * metricBoxWidth;

    // Divider line (except first)
    if (i > 0) {
      doc.setDrawColor(...COLORS.borderLight);
      doc.line(boxX - 1, yPos + 5, boxX - 1, yPos + metricBoxHeight - 5);
    }

    doc.setTextColor(...COLORS.textMuted);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.text(metric.label, boxX + 2, yPos + 7);

    doc.setTextColor(...metric.color);
    doc.setFontSize(i === 0 ? 14 : 11);
    doc.setFont('helvetica', 'bold');
    doc.text(metric.value, boxX + 2, yPos + 16);

    doc.setTextColor(...COLORS.textMuted);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.text(metric.subtitle, boxX + 2, yPos + 22);
  });

  yPos += metricBoxHeight + 6;

  // ============================================
  // AI DEAL ANALYZER SUMMARY
  // ============================================
  const aiCardHeight = 42;
  doc.setFillColor(...COLORS.surface);
  drawRoundedRect(doc, margin, yPos, contentWidth, aiCardHeight, 3);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(margin, yPos, contentWidth, aiCardHeight, 3, 3, 'S');

  // Left section - Deal Rating
  const ratingBoxWidth = 42;
  doc.setFillColor(...COLORS.surfaceAlt);
  drawRoundedRect(doc, margin + 4, yPos + 4, ratingBoxWidth, aiCardHeight - 8, 2);

  // Rating icon (simple circle with checkmark)
  doc.setFillColor(...COLORS.greenLight);
  doc.circle(margin + 4 + ratingBoxWidth / 2, yPos + 14, 6, 'F');
  doc.setTextColor(...COLORS.green);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('✓', margin + 4 + ratingBoxWidth / 2, yPos + 16, { align: 'center' });

  doc.setTextColor(...COLORS.textMuted);
  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.text('DEAL RATING', margin + 4 + ratingBoxWidth / 2, yPos + 24, { align: 'center' });

  doc.setTextColor(...dealRating.color);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(dealRating.rating, margin + 4 + ratingBoxWidth / 2, yPos + 31, { align: 'center' });

  doc.setTextColor(...COLORS.textMuted);
  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.text(`AI Confidence: ${dealRating.confidence}%`, margin + 4 + ratingBoxWidth / 2, yPos + 36, { align: 'center' });

  // Right section - Summary
  const summaryX = margin + ratingBoxWidth + 12;
  const summaryWidth = contentWidth - ratingBoxWidth - 16;

  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Deal Analyzer Summary', summaryX, yPos + 10);

  // BETA badge
  doc.setFillColor(...COLORS.border);
  doc.roundedRect(summaryX + doc.getTextWidth('AI Deal Analyzer Summary') + 2, yPos + 6, 12, 5, 1, 1, 'F');
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(5);
  doc.text('BETA', summaryX + doc.getTextWidth('AI Deal Analyzer Summary') + 8, yPos + 9.5, { align: 'center' });

  // Summary text
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  const summaryText = generateAISummary(data, result, symbol, formatDisplay, pricePerSqm);
  const splitSummary = doc.splitTextToSize(summaryText, summaryWidth);
  doc.text(splitSummary.slice(0, 3), summaryX, yPos + 16);

  // Tags row
  const tagY = yPos + aiCardHeight - 8;
  const tags = [
    { icon: '↗', text: appreciation >= 20 ? 'High Appreciation Potential' : 'Moderate Appreciation', color: COLORS.green },
    { icon: '⏱', text: `Inv. Period: ${Math.floor(result.holdPeriodMonths / 12)} Year${Math.floor(result.holdPeriodMonths / 12) !== 1 ? 's' : ''} ${result.holdPeriodMonths % 12} Months`, color: COLORS.textSecondary },
    { icon: '⚠', text: `Market Risk: ${marketRisk}`, color: marketRisk === 'Low' ? COLORS.green : (marketRisk === 'Moderate' ? COLORS.orange : COLORS.red) },
  ];

  let tagX = summaryX;
  tags.forEach((tag) => {
    const tagWidth = doc.getTextWidth(tag.text) + 10;
    doc.setFillColor(...COLORS.surfaceAlt);
    doc.roundedRect(tagX, tagY, tagWidth, 5, 1, 1, 'F');
    doc.setTextColor(...tag.color);
    doc.setFontSize(5);
    doc.text(`${tag.icon}  ${tag.text}`, tagX + 2, tagY + 3.5);
    tagX += tagWidth + 3;
  });

  yPos += aiCardHeight + 6;

  // ============================================
  // TWO COLUMN LAYOUT - ACQUISITION & EXIT
  // ============================================
  const colWidth = (contentWidth - 6) / 2;
  const detailsCardHeight = 52;

  // LEFT: Acquisition Details
  doc.setFillColor(...COLORS.surface);
  drawRoundedRect(doc, margin, yPos, colWidth, detailsCardHeight, 3);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(margin, yPos, colWidth, detailsCardHeight, 3, 3, 'S');

  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('🏠  Acquisition Details', margin + 6, yPos + 10);

  const acqDetails = [
    { label: 'Purchase Price', value: `${symbol} ${toDisplay(data.property.totalPrice).toLocaleString()}` },
    { label: 'Price per sqm', value: pricePerSqm > 0 ? `${symbol} ${pricePerSqm.toLocaleString()} / m²` : 'N/A' },
    { label: 'Purchase Date', value: data.property.purchaseDate ? new Date(data.property.purchaseDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-') : 'Not set' },
    { label: 'Completion Date', value: data.property.handoverDate ? new Date(data.property.handoverDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-') : 'Not set' },
    { label: 'Booking Fee', value: `${symbol} ${toDisplay(data.payment.bookingFee).toLocaleString()}` },
  ];

  acqDetails.forEach((item, i) => {
    const rowY = yPos + 16 + i * 7;
    doc.setTextColor(...COLORS.textSecondary);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, margin + 6, rowY);
    doc.setTextColor(...COLORS.textPrimary);
    doc.setFont('helvetica', 'bold');
    doc.text(item.value, margin + colWidth - 6, rowY, { align: 'right' });
  });

  // RIGHT: Exit Strategy
  const rightColX = margin + colWidth + 6;
  doc.setFillColor(...COLORS.surface);
  drawRoundedRect(doc, rightColX, yPos, colWidth, detailsCardHeight, 3);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(rightColX, yPos, colWidth, detailsCardHeight, 3, 3, 'S');

  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('↗  Exit Strategy', rightColX + 6, yPos + 10);

  // Gross Sale Price box
  doc.setFillColor(...COLORS.surfaceAlt);
  drawRoundedRect(doc, rightColX + 6, yPos + 14, (colWidth - 18) / 2, 14, 2);
  doc.setTextColor(...COLORS.textMuted);
  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.text('Gross Sale Price', rightColX + 8, yPos + 18);
  doc.setTextColor(...COLORS.green);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`${symbol} ${toDisplay(data.exit.projectedSalesPrice).toLocaleString()}`, rightColX + 8, yPos + 24);

  // Closing Costs box
  const closingBoxX = rightColX + 6 + (colWidth - 18) / 2 + 4;
  doc.setFillColor(...COLORS.surfaceAlt);
  drawRoundedRect(doc, closingBoxX, yPos + 14, (colWidth - 18) / 2, 14, 2);
  doc.setTextColor(...COLORS.textMuted);
  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.text('Closing Costs', closingBoxX + 2, yPos + 18);
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`${symbol} ${toDisplay(closingCosts).toLocaleString()}`, closingBoxX + 2, yPos + 24);
  doc.setTextColor(...COLORS.textMuted);
  doc.setFontSize(5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.exit.closingCostPercent}% Total Expenses`, closingBoxX + 2, yPos + 27);

  // Net Proceeds row
  doc.setFillColor(...COLORS.greenLight);
  drawRoundedRect(doc, rightColX + 6, yPos + 32, colWidth - 12, 12, 2);
  doc.setTextColor(...COLORS.greenDark);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Net Proceeds from Sale', rightColX + 10, yPos + 40);
  doc.setFontSize(10);
  doc.text(`${symbol} ${toDisplay(netProceeds).toLocaleString()}`, rightColX + colWidth - 10, yPos + 40, { align: 'right' });

  yPos += detailsCardHeight + 6;

  // ============================================
  // TWO COLUMN LAYOUT - PAYMENT & CASH FLOW CHART
  // ============================================
  const paymentCardHeight = 50;

  // LEFT: Payment Structure
  doc.setFillColor(...COLORS.surface);
  drawRoundedRect(doc, margin, yPos, colWidth, paymentCardHeight, 3);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(margin, yPos, colWidth, paymentCardHeight, 3, 3, 'S');

  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('💳  Payment Structure', margin + 6, yPos + 10);

  const downPayment = data.property.totalPrice * (data.payment.downPaymentPercent / 100);
  const remaining = data.property.totalPrice - downPayment;
  const installmentCount = data.payment.installmentMonths;
  const monthlyPayment = installmentCount > 0 ? remaining / installmentCount : 0;

  // Down Payment
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Down Payment', margin + 6, yPos + 20);
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.payment.downPaymentPercent}% upfront`, margin + 6, yPos + 25);

  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${symbol} ${toDisplay(downPayment).toLocaleString()}`, margin + colWidth - 6, yPos + 22, { align: 'right' });

  // Progress bar
  const barWidth = colWidth - 12;
  const barY = yPos + 28;
  doc.setFillColor(...COLORS.borderLight);
  drawRoundedRect(doc, margin + 6, barY, barWidth, 3, 1);
  doc.setFillColor(...COLORS.green);
  drawRoundedRect(doc, margin + 6, barY, barWidth * (data.payment.downPaymentPercent / 100), 3, 1);

  // Monthly Installments
  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Monthly Installments', margin + 6, yPos + 38);
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${installmentCount} Months x ${symbol} ${toDisplay(monthlyPayment).toLocaleString()}`, margin + 6, yPos + 43);

  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${symbol} ${toDisplay(remaining).toLocaleString()}`, margin + colWidth - 6, yPos + 40, { align: 'right' });

  // RIGHT: Cash Flow Projection Chart
  doc.setFillColor(...COLORS.surface);
  drawRoundedRect(doc, rightColX, yPos, colWidth, paymentCardHeight, 3);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(rightColX, yPos, colWidth, paymentCardHeight, 3, 3, 'S');

  doc.setTextColor(...COLORS.textMuted);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('CASH FLOW PROJECTION', rightColX + 6, yPos + 8);

  // Simple bar chart
  const chartX = rightColX + 10;
  const chartY = yPos + 14;
  const chartWidth = colWidth - 20;
  const chartHeight = 28;
  const barSpacing = chartWidth / 4;

  // Calculate scale
  const maxOutflow = Math.abs(result.totalInvested);
  const maxInflow = netProceeds;
  const maxValue = Math.max(maxOutflow, maxInflow);

  // Baseline
  const baselineY = chartY + chartHeight - 5;
  doc.setDrawColor(...COLORS.borderLight);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(chartX, baselineY, chartX + chartWidth, baselineY);
  doc.setLineDashPattern([], 0);

  // Bars
  const phases = [
    { label: 'Start', value: -downPayment, isNegative: true },
    { label: 'Pay', value: -remaining, isNegative: true },
    { label: 'Hold', value: 0, isNegative: false },
    { label: 'Exit', value: netProceeds, isNegative: false },
  ];

  phases.forEach((phase, i) => {
    const barX = chartX + i * barSpacing + barSpacing / 4;
    const barW = barSpacing / 2;

    if (phase.value !== 0) {
      const barH = Math.abs(phase.value) / maxValue * (chartHeight - 10);
      const barY = phase.isNegative ? baselineY - barH : baselineY - barH;

      doc.setFillColor(...(phase.isNegative ? COLORS.redLight : COLORS.greenLight));
      drawRoundedRect(doc, barX, barY, barW, barH, 1);
      doc.setFillColor(...(phase.isNegative ? COLORS.red : COLORS.green));
      drawRoundedRect(doc, barX, barY, barW, 2, 0.5);
    }

    // Label
    doc.setTextColor(...COLORS.textMuted);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.text(phase.label, barX + barW / 2, chartY + chartHeight, { align: 'center' });
  });

  yPos += paymentCardHeight + 6;

  // ============================================
  // CASH FLOW TIMELINE
  // ============================================
  const cashFlows = generatePaymentSchedule(data);
  const timelineCardHeight = Math.min(8 + cashFlows.length * 6 + 8, 60);

  doc.setTextColor(...COLORS.textPrimary);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Cash Flow Timeline', margin, yPos + 4);
  yPos += 8;

  doc.setFillColor(...COLORS.surface);
  drawRoundedRect(doc, margin, yPos, contentWidth, timelineCardHeight, 3);
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(margin, yPos, contentWidth, timelineCardHeight, 3, 3, 'S');

  // Table header
  const colWidths = [35, 50, 35, 35, 35];
  let tableX = margin + 4;
  const headers = ['DATE', 'EVENT', 'INFLOW', 'OUTFLOW', 'NET FLOW'];

  doc.setFillColor(...COLORS.surfaceAlt);
  doc.rect(margin + 2, yPos + 2, contentWidth - 4, 6, 'F');

  headers.forEach((header, i) => {
    doc.setTextColor(...COLORS.textMuted);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.text(header, tableX, yPos + 6);
    tableX += colWidths[i];
  });

  // Table rows (limited to fit on page)
  let runningTotal = 0;
  const maxRows = Math.min(cashFlows.length, 7);

  cashFlows.slice(0, maxRows).forEach((cf, i) => {
    const rowY = yPos + 10 + i * 6;
    tableX = margin + 4;
    runningTotal += cf.amount;

    const dateStr = cf.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const isInflow = cf.amount > 0;
    const eventName = isInflow ? 'Exit/Sale' : (i === 0 ? 'Down Payment' : 'Installment');

    doc.setTextColor(...COLORS.textSecondary);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(dateStr, tableX, rowY);
    tableX += colWidths[0];

    doc.setTextColor(...COLORS.textPrimary);
    doc.text(eventName, tableX, rowY);
    tableX += colWidths[1];

    // Inflow
    doc.setTextColor(...COLORS.green);
    doc.text(isInflow ? `${symbol}${toDisplay(cf.amount).toLocaleString()}` : '-', tableX, rowY);
    tableX += colWidths[2];

    // Outflow
    doc.setTextColor(...COLORS.red);
    doc.text(!isInflow ? `${symbol}${toDisplay(Math.abs(cf.amount)).toLocaleString()}` : '-', tableX, rowY);
    tableX += colWidths[3];

    // Net Flow
    doc.setTextColor(...(runningTotal >= 0 ? COLORS.green : COLORS.red));
    doc.text(`${symbol}${toDisplay(runningTotal).toLocaleString()}`, tableX, rowY);
  });

  if (cashFlows.length > maxRows) {
    doc.setTextColor(...COLORS.textMuted);
    doc.setFontSize(5);
    doc.text(`... and ${cashFlows.length - maxRows} more entries`, margin + 4, yPos + 10 + maxRows * 6);
  }

  yPos += timelineCardHeight + 6;

  // ============================================
  // FOOTER
  // ============================================
  const footerY = pageHeight - 10;
  doc.setDrawColor(...COLORS.border);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setTextColor(...COLORS.textMuted);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated by BaliInvest XIRR Calculator', margin, footerY);

  // Exchange rate note
  if (currency !== 'IDR') {
    doc.text(`Exchange Rate: 1 ${currency} = ${rate.toLocaleString()} IDR`, pageWidth - margin, footerY, { align: 'right' });
  }

  // ============================================
  // SAVE PDF
  // ============================================
  const projectName = data.property.projectName || 'Investment';
  const fileName = `BaliInvest_${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
