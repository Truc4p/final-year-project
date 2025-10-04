const EmailTemplate = require('../models/emailTemplate');

// Get all email templates
const getTemplates = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;
    
    const query = { isActive: true };
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortBy]: sortDirection };
    
    const templates = await EmailTemplate.find(query)
      .populate('createdBy', 'username email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-htmlContent'); // Exclude large HTML content for list view
    
    const total = await EmailTemplate.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        templates,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates'
    });
  }
};

// Get single template by ID
const getTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await EmailTemplate.findById(id)
      .populate('createdBy', 'username email');
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: template
    });
    
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template'
    });
  }
};

// Create new email template
const createTemplate = async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const template = new EmailTemplate(templateData);
    await template.save();
    
    await template.populate('createdBy', 'username email');
    
    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template
    });
    
  } catch (error) {
    console.error('Create template error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create template'
    });
  }
};

// Update email template
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const template = await EmailTemplate.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('createdBy', 'username email');
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      data: template
    });
    
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update template'
    });
  }
};

// Delete email template
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await EmailTemplate.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    // Soft delete by setting isActive to false
    template.isActive = false;
    await template.save();
    
    res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete template'
    });
  }
};

// Preview template with sample data
const previewTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { variables = {} } = req.body;
    
    const template = await EmailTemplate.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    const rendered = template.render(variables);
    
    res.status(200).json({
      success: true,
      data: {
        template: {
          id: template._id,
          name: template.name,
          category: template.category
        },
        rendered
      }
    });
    
  } catch (error) {
    console.error('Preview template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to preview template'
    });
  }
};

// Get templates by category
const getTemplatesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const templates = await EmailTemplate.getByCategory(category);
    
    res.status(200).json({
      success: true,
      data: templates
    });
    
  } catch (error) {
    console.error('Get templates by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates by category'
    });
  }
};

// Get popular templates
const getPopularTemplates = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const templates = await EmailTemplate.getPopularTemplates(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: templates
    });
    
  } catch (error) {
    console.error('Get popular templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular templates'
    });
  }
};

// Duplicate template
const duplicateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const originalTemplate = await EmailTemplate.findById(id);
    if (!originalTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    const duplicateData = originalTemplate.toObject();
    delete duplicateData._id;
    delete duplicateData.__v;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    
    duplicateData.name = `${duplicateData.name} (Copy)`;
    duplicateData.createdBy = req.user.id;
    duplicateData.usageCount = 0;
    duplicateData.lastUsed = null;
    duplicateData.isDefault = false;
    
    const newTemplate = new EmailTemplate(duplicateData);
    await newTemplate.save();
    
    await newTemplate.populate('createdBy', 'username email');
    
    res.status(201).json({
      success: true,
      message: 'Template duplicated successfully',
      data: newTemplate
    });
    
  } catch (error) {
    console.error('Duplicate template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate template'
    });
  }
};

module.exports = {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  previewTemplate,
  getTemplatesByCategory,
  getPopularTemplates,
  duplicateTemplate
};