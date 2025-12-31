const PostTemplate = require('../../models/marketing/postTemplate');

// Get all templates
const getTemplates = async (req, res) => {
  try {
    const { category, platform, search } = req.query;
    
    const query = { isPublic: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (platform) {
      query.platforms = platform;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const templates = await PostTemplate.find(query)
      .populate('createdBy', 'username email')
      .sort({ usageCount: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: templates
    });
    
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates'
    });
  }
};

// Get single template
const getTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await PostTemplate.findById(id)
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

// Create template
const createTemplate = async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const template = new PostTemplate(templateData);
    await template.save();
    
    await template.populate('createdBy', 'username email');
    
    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template
    });
    
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create template'
    });
  }
};

// Update template
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await PostTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    Object.assign(template, req.body);
    await template.save();
    
    await template.populate('createdBy', 'username email');
    
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

// Delete template
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await PostTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    await template.deleteOne();
    
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

// Increment template usage
const incrementUsage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const template = await PostTemplate.findByIdAndUpdate(
      id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );
    
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
    console.error('Increment usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update template usage'
    });
  }
};

module.exports = {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  incrementUsage
};
