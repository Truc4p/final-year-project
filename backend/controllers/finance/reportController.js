const CustomReport = require('../../models/finance/customReport');
const Invoice = require('../../models/finance/invoice');
const Bill = require('../../models/finance/bill');
const BusinessExpense = require('../../models/finance/businessExpense');
const CashFlowTransaction = require('../../models/finance/cashFlowTransaction');
const Budget = require('../../models/finance/budget');
const ChartOfAccounts = require('../../models/finance/chartOfAccounts');
const GeneralLedger = require('../../models/finance/generalLedger');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Helper function to build query from filters
const buildQuery = (filters) => {
  const query = {};
  
  filters.forEach(filter => {
    const { field, operator, value } = filter;
    
    switch (operator) {
      case 'equals':
        query[field] = value;
        break;
      case 'not_equals':
        query[field] = { $ne: value };
        break;
      case 'contains':
        query[field] = { $regex: value, $options: 'i' };
        break;
      case 'not_contains':
        query[field] = { $not: { $regex: value, $options: 'i' } };
        break;
      case 'greater_than':
        query[field] = { $gt: value };
        break;
      case 'less_than':
        query[field] = { $lt: value };
        break;
      case 'between':
        if (Array.isArray(value) && value.length === 2) {
          query[field] = { $gte: value[0], $lte: value[1] };
        }
        break;
      case 'in':
        query[field] = { $in: Array.isArray(value) ? value : [value] };
        break;
      case 'not_in':
        query[field] = { $nin: Array.isArray(value) ? value : [value] };
        break;
      case 'is_null':
        query[field] = null;
        break;
      case 'is_not_null':
        query[field] = { $ne: null };
        break;
    }
  });
  
  return query;
};

// Helper function to get data from data source
const getDataFromSource = async (dataSource, query, columns) => {
  const models = {
    invoices: Invoice,
    bills: Bill,
    expenses: BusinessExpense,
    transactions: CashFlowTransaction,
    budgets: Budget,
    accounts: ChartOfAccounts,
    general_ledger: GeneralLedger
  };

  const Model = models[dataSource];
  if (!Model) throw new Error('Invalid data source');

  // Build select fields from columns
  const selectFields = columns.length > 0 
    ? columns.map(c => c.field).join(' ')
    : '';

  return await Model.find(query).select(selectFields).lean();
};

// Get all reports
exports.getReports = async (req, res) => {
  try {
    const { 
      category, 
      isTemplate, 
      isPublic,
      search,
      page = 1, 
      limit = 20 
    } = req.query;

    const query = {};
    
    // Filter by category
    if (category) query.category = category;
    if (isTemplate !== undefined) query.isTemplate = isTemplate === 'true';
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Only show reports user can access
    if (!query.isPublic) {
      query.$or = [
        { createdBy: req.user._id },
        { isPublic: true },
        { 'sharedWith.user': req.user._id }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      CustomReport.find(query)
        .populate('createdBy', 'username email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      CustomReport.countDocuments(query)
    ]);

    res.json({
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
  }
};

// Get single report
exports.getReport = async (req, res) => {
  try {
    const report = await CustomReport.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('sharedWith.user', 'username email');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check access
    if (!report.canAccess(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: 'Failed to fetch report', error: error.message });
  }
};

// Create report
exports.createReport = async (req, res) => {
  try {
    const reportData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Calculate next run if scheduled
    const report = new CustomReport(reportData);
    if (report.schedule && report.schedule.enabled) {
      report.schedule.nextRun = report.calculateNextRun();
    }

    await report.save();
    await report.populate('createdBy', 'username email');

    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Failed to create report', error: error.message });
  }
};

// Update report
exports.updateReport = async (req, res) => {
  try {
    const report = await CustomReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check edit permission
    if (!report.canEdit(req.user._id)) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    Object.assign(report, req.body);

    // Recalculate next run if schedule changed
    if (report.schedule && report.schedule.enabled) {
      report.schedule.nextRun = report.calculateNextRun();
    }

    await report.save();
    await report.populate('createdBy', 'username email');

    res.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ message: 'Failed to update report', error: error.message });
  }
};

// Delete report
exports.deleteReport = async (req, res) => {
  try {
    const report = await CustomReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Only creator can delete
    if (report.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can delete report' });
    }

    await report.deleteOne();
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Failed to delete report', error: error.message });
  }
};

// Run report and get data
exports.runReport = async (req, res) => {
  try {
    const report = await CustomReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check access
    if (!report.canAccess(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Build query from filters
    const query = buildQuery(report.filters || []);

    // Get data
    let data = await getDataFromSource(report.dataSource, query, report.columns || []);

    // Apply grouping if specified
    if (report.groupBy && report.groupBy.field) {
      const grouped = {};
      data.forEach(row => {
        const key = row[report.groupBy.field];
        if (!grouped[key]) {
          grouped[key] = { group: key, records: [], aggregates: {} };
        }
        grouped[key].records.push(row);
      });

      // Calculate aggregations
      Object.values(grouped).forEach(group => {
        if (report.groupBy.aggregations) {
          report.groupBy.aggregations.forEach(agg => {
            const values = group.records.map(r => r[agg.field]).filter(v => v != null);
            switch (agg.function) {
              case 'sum':
                group.aggregates[agg.field] = values.reduce((a, b) => a + b, 0);
                break;
              case 'avg':
                group.aggregates[agg.field] = values.length > 0 
                  ? values.reduce((a, b) => a + b, 0) / values.length 
                  : 0;
                break;
              case 'count':
                group.aggregates[agg.field] = values.length;
                break;
              case 'min':
                group.aggregates[agg.field] = Math.min(...values);
                break;
              case 'max':
                group.aggregates[agg.field] = Math.max(...values);
                break;
            }
          });
        }
      });

      data = Object.values(grouped);
    }

    // Apply sorting
    if (report.sortBy && report.sortBy.field) {
      data.sort((a, b) => {
        const aVal = a[report.sortBy.field];
        const bVal = b[report.sortBy.field];
        const order = report.sortBy.order === 'desc' ? -1 : 1;
        return aVal > bVal ? order : aVal < bVal ? -order : 0;
      });
    }

    // Update run stats
    report.lastRunAt = new Date();
    report.runCount += 1;
    await report.save();

    res.json({ data, report });
  } catch (error) {
    console.error('Error running report:', error);
    res.status(500).json({ message: 'Failed to run report', error: error.message });
  }
};

// Export report to PDF
exports.exportPDF = async (req, res) => {
  try {
    const report = await CustomReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (!report.canAccess(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get report data
    const query = buildQuery(report.filters || []);
    const data = await getDataFromSource(report.dataSource, query, report.columns || []);

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.name}.pdf"`);
    
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text(report.name, { align: 'center' });
    doc.moveDown();
    
    if (report.description) {
      doc.fontSize(12).text(report.description);
      doc.moveDown();
    }

    // Add generation date
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown();

    // Add data table
    if (data.length > 0) {
      const columns = report.columns || Object.keys(data[0]).map(key => ({ field: key, label: key }));
      
      // Table headers
      doc.fontSize(10);
      let x = 50;
      columns.forEach(col => {
        doc.text(col.label || col.field, x, doc.y, { width: 100, continued: true });
        x += 110;
      });
      doc.text('');
      doc.moveDown();

      // Table rows (limit to first 100 for PDF)
      data.slice(0, 100).forEach(row => {
        x = 50;
        columns.forEach(col => {
          const value = row[col.field] || '';
          doc.text(String(value), x, doc.y, { width: 100, continued: true });
          x += 110;
        });
        doc.text('');
      });
    } else {
      doc.text('No data available');
    }

    doc.end();
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ message: 'Failed to export PDF', error: error.message });
  }
};

// Export report to Excel
exports.exportExcel = async (req, res) => {
  try {
    const report = await CustomReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (!report.canAccess(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get report data
    const query = buildQuery(report.filters || []);
    const data = await getDataFromSource(report.dataSource, query, report.columns || []);

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(report.name.substring(0, 31)); // Sheet name limit

    // Add headers
    const columns = report.columns || Object.keys(data[0] || {}).map(key => ({ field: key, label: key }));
    worksheet.columns = columns.map(col => ({
      header: col.label || col.field,
      key: col.field,
      width: 20
    }));

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    data.forEach(row => {
      worksheet.addRow(row);
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${report.name}.xlsx"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting Excel:', error);
    res.status(500).json({ message: 'Failed to export Excel', error: error.message });
  }
};

// Duplicate report
exports.duplicateReport = async (req, res) => {
  try {
    const original = await CustomReport.findById(req.params.id);

    if (!original) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (!original.canAccess(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const duplicate = new CustomReport({
      ...original.toObject(),
      _id: undefined,
      name: `${original.name} (Copy)`,
      createdBy: req.user._id,
      sharedWith: [],
      runCount: 0,
      lastRunAt: null,
      createdAt: undefined,
      updatedAt: undefined
    });

    await duplicate.save();
    await duplicate.populate('createdBy', 'username email');

    res.status(201).json(duplicate);
  } catch (error) {
    console.error('Error duplicating report:', error);
    res.status(500).json({ message: 'Failed to duplicate report', error: error.message });
  }
};

// Share report
exports.shareReport = async (req, res) => {
  try {
    const { userIds, permission } = req.body;

    const report = await CustomReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Only creator can share
    if (report.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can share report' });
    }

    // Add users to sharedWith
    userIds.forEach(userId => {
      const existing = report.sharedWith.find(s => s.user.toString() === userId.toString());
      if (!existing) {
        report.sharedWith.push({ user: userId, permission: permission || 'view' });
      }
    });

    await report.save();
    await report.populate('sharedWith.user', 'username email');

    res.json(report);
  } catch (error) {
    console.error('Error sharing report:', error);
    res.status(500).json({ message: 'Failed to share report', error: error.message });
  }
};

// Get report templates
exports.getTemplates = async (req, res) => {
  try {
    const templates = await CustomReport.find({ isTemplate: true })
      .populate('createdBy', 'username')
      .sort({ name: 1 });

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Failed to fetch templates', error: error.message });
  }
};

// Get popular reports
exports.getPopularReports = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const reports = await CustomReport.getPopularReports(parseInt(limit));
    res.json(reports);
  } catch (error) {
    console.error('Error fetching popular reports:', error);
    res.status(500).json({ message: 'Failed to fetch popular reports', error: error.message });
  }
};
