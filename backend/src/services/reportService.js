import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

class ReportService {
  /**
   * Export event feedback and intelligence as Excel (.xlsx)
   */
  async generateExcelReport({ event, form, responses, analysis, recommendations }) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'InsightLoop Intelligence Platform';
    workbook.created = new Date();

    // 1. Overview Sheet
    const overviewSheet = workbook.addWorksheet('Event Overview');
    overviewSheet.columns = [
      { header: 'Property', key: 'prop', width: 28 },
      { header: 'Value', key: 'val', width: 45 },
    ];
    overviewSheet.addRows([
      { prop: 'Event Title', val: event.title },
      { prop: 'Event Code', val: event.code },
      { prop: 'Category', val: event.category },
      { prop: 'Venue Type', val: event.venueType },
      { prop: 'Location', val: event.location },
      { prop: 'Total Responses', val: responses.length },
      { prop: 'Target Responses', val: event.targetResponses },
      { prop: 'Response Rate', val: `${Math.round((responses.length / (event.targetResponses || 1)) * 100)}%` },
      { prop: 'Sentiment - Positive', val: analysis?.sentimentSummary?.positive || 0 },
      { prop: 'Sentiment - Neutral', val: analysis?.sentimentSummary?.neutral || 0 },
      { prop: 'Sentiment - Negative', val: analysis?.sentimentSummary?.negative || 0 },
      { prop: 'Average Sentiment Score', val: analysis?.sentimentSummary?.averageScore || 0 },
    ]);

    overviewSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    overviewSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '17243A' } };

    // 2. Feedback Responses Sheet
    const responseSheet = workbook.addWorksheet('Participant Responses');
    responseSheet.columns = [
      { header: 'ID', key: 'id', width: 12 },
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Participant', key: 'name', width: 25 },
      { header: 'Language', key: 'lang', width: 12 },
      { header: 'Sentiment', key: 'sentiment', width: 14 },
      { header: 'Original Text', key: 'textOriginal', width: 40 },
      { header: 'Translated Text (English)', key: 'textTranslated', width: 40 },
      { header: 'Rating / NPS', key: 'rating', width: 14 },
    ];

    responses.forEach((r, idx) => {
      const textAns = r.answers?.find((a) => a.textResponseOriginal || a.textResponseTranslated);
      const ratingAns = r.answers?.find((a) => a.ratingValue !== undefined);

      responseSheet.addRow({
        id: idx + 1,
        date: new Date(r.createdAt).toLocaleString(),
        name: r.isAnonymous ? 'Anonymous' : r.participantName || 'Anonymous',
        lang: r.submissionLanguage || 'en',
        sentiment: r.sentimentLabel || 'neutral',
        textOriginal: textAns?.textResponseOriginal || textAns?.audioTranscriptionOriginal || 'N/A',
        textTranslated: textAns?.textResponseTranslated || 'N/A',
        rating: ratingAns?.ratingValue || 'N/A',
      });
    });

    responseSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    responseSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7058' } };

    // 3. AI Recommendations Sheet
    if (recommendations && recommendations.length > 0) {
      const recSheet = workbook.addWorksheet('AI Recommendations');
      recSheet.columns = [
        { header: 'Priority', key: 'priority', width: 14 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Recommendation Title', key: 'title', width: 35 },
        { header: 'Suggested Action', key: 'action', width: 45 },
        { header: 'Projected Impact', key: 'impact', width: 35 },
      ];

      recommendations.forEach((rec) => {
        recSheet.addRow({
          priority: rec.priority.toUpperCase(),
          category: rec.category,
          title: rec.title,
          action: rec.suggestedAction,
          impact: rec.impact,
        });
      });

      recSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      recSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '292D35' } };
    }

    return workbook.xlsx.writeBuffer();
  }

  /**
   * Export event feedback report as PDF
   */
  async generatePDFReport({ event, responses, analysis, recommendations }) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers = [];

        doc.on('data', (buffer) => buffers.push(buffer));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Header Banner
        doc.rect(0, 0, doc.page.width, 100).fill('#17243A');

        doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold')
          .text('INSIGHTLOOP EVENT INTELLIGENCE REPORT', 40, 30);
        doc.fontSize(11).font('Helvetica')
          .text(`Generated on ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}`, 40, 60);

        doc.moveDown(4);

        // Event Metadata
        doc.fillColor('#292D35').fontSize(18).font('Helvetica-Bold').text(event.title);
        doc.fontSize(10).font('Helvetica').fillColor('#636C7C')
          .text(`Event Code: ${event.code}  |  Category: ${event.category}  |  Location: ${event.location || 'Online'}`);

        doc.moveDown();
        doc.strokeColor('#E7ECF3').lineWidth(1).moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
        doc.moveDown();

        // Key Metrics Grid
        const total = responses.length;
        const target = event.targetResponses || 50;
        const rate = Math.round((total / target) * 100);
        const pos = analysis?.sentimentSummary?.positive || 0;
        const neg = analysis?.sentimentSummary?.negative || 0;
        const neu = analysis?.sentimentSummary?.neutral || 0;

        doc.fontSize(14).font('Helvetica-Bold').fillColor('#17243A').text('Executive Summary & Metrics');
        doc.moveDown(0.5);

        doc.fontSize(10).font('Helvetica').fillColor('#292D35')
          .text(`• Total Responses Collected: ${total} of ${target} target (${rate}% response rate)`)
          .text(`• Sentiment Distribution: Positive: ${pos} | Neutral: ${neu} | Negative: ${neg}`)
          .text(`• Overall Experience Index: ${analysis?.sentimentSummary?.averageScore >= 0 ? '+' : ''}${analysis?.sentimentSummary?.averageScore || 0.0}`);

        doc.moveDown();

        // Key Positive Highlights
        if (analysis?.positiveHighlights?.length) {
          doc.fontSize(12).font('Helvetica-Bold').fillColor('#7D9272').text('Key Strengths & Positive Highlights');
          doc.moveDown(0.3);
          analysis.positiveHighlights.slice(0, 3).forEach((h) => {
            doc.fontSize(10).font('Helvetica').fillColor('#292D35').text(`✔ ${h.highlight}`);
          });
          doc.moveDown();
        }

        // Recurring Friction Points
        if (analysis?.recurringIssues?.length) {
          doc.fontSize(12).font('Helvetica-Bold').fillColor('#FF7058').text('Recurring Friction Points & Areas for Improvement');
          doc.moveDown(0.3);
          analysis.recurringIssues.slice(0, 3).forEach((issue) => {
            doc.fontSize(10).font('Helvetica').fillColor('#292D35').text(`✖ [${issue.severity.toUpperCase()}] ${issue.issue}`);
          });
          doc.moveDown();
        }

        // Actionable AI Recommendations
        if (recommendations && recommendations.length) {
          doc.fontSize(12).font('Helvetica-Bold').fillColor('#17243A').text('Actionable AI Recommendations');
          doc.moveDown(0.3);
          recommendations.slice(0, 3).forEach((rec, idx) => {
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#FF7058').text(`${idx + 1}. ${rec.title} (${rec.priority.toUpperCase()} PRIORITY)`);
            doc.font('Helvetica').fillColor('#292D35').text(`   Action: ${rec.suggestedAction}`);
            doc.fontSize(9).fillColor('#636C7C').text(`   Projected Impact: ${rec.impact}`);
            doc.moveDown(0.5);
          });
        }

        // Footer
        doc.fontSize(8).fillColor('#9AA3B2').text(
          'InsightLoop Universal Event Feedback Platform — Confidential report generated automatically.',
          40,
          doc.page.height - 30,
          { align: 'center', width: doc.page.width - 80 }
        );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

export const reportService = new ReportService();
