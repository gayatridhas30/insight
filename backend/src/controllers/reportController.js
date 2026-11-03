import { Event, FeedbackForm, FeedbackResponse, AIAnalysis, Recommendation } from '../models/index.js';
import { reportService } from '../services/reportService.js';

export const exportExcel = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const form = await FeedbackForm.findOne({ eventId });
    const responses = await FeedbackResponse.find({ eventId }).lean();
    const analysis = await AIAnalysis.findOne({ eventId }).sort({ createdAt: -1 }).lean();
    const recommendations = await Recommendation.find({ eventId }).lean();

    const buffer = await reportService.generateExcelReport({
      event,
      form,
      responses,
      analysis,
      recommendations,
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=InsightLoop-Report-${event.code}.xlsx`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

export const exportPDF = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const responses = await FeedbackResponse.find({ eventId }).lean();
    const analysis = await AIAnalysis.findOne({ eventId }).sort({ createdAt: -1 }).lean();
    const recommendations = await Recommendation.find({ eventId }).lean();

    const buffer = await reportService.generatePDFReport({
      event,
      responses,
      analysis,
      recommendations,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=InsightLoop-Report-${event.code}.pdf`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};
