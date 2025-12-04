const Employee = require("../../models/hr/employee");
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/hr-documents/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Only PDF, DOC, DOCX, JPG, JPEG, PNG files allowed!');
    }
  }
});

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const { department, status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (department) query.department = department;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    
    const employees = await Employee.find(query)
      .populate('manager', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Employee.countDocuments(query);
    
    res.json({
      employees,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const id = req.params.id;
    const employee = await Employee.findById(id)
      .populate('manager', 'firstName lastName employeeId position')
      .populate('performance.reviewedBy', 'firstName lastName employeeId')
      .lean();

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Ensure we return raw arrays like documents/skills exactly as stored
    const mongoose = require('mongoose');
    const ObjectId = mongoose.Types.ObjectId;
    const raw = await Employee.collection.findOne({ _id: new ObjectId(id) });
    if (raw) {
      if (Array.isArray(raw.documents)) employee.documents = raw.documents;
      if (Array.isArray(raw.skills)) employee.skills = raw.skills;
      if (raw.emergencyContact) employee.emergencyContact = raw.emergencyContact;
      if (raw.benefits) employee.benefits = raw.benefits;
      if (raw.leaveBalance) employee.leaveBalance = raw.leaveBalance;
      if (typeof raw.notes !== 'undefined') employee.notes = raw.notes;
    }

    res.json(employee);
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Create new employee
exports.createEmployee = async (req, res) => {
  try {
    // Generate employee ID if not provided
    if (!req.body.employeeId) {
      const count = await Employee.countDocuments();
      req.body.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
    }

    // Clean the data - handle empty manager field
    const employeeData = { ...req.body };
    if (employeeData.manager === '' || employeeData.manager === null) {
      delete employeeData.manager; // Remove the field entirely if empty
    }

    const employee = new Employee(employeeData);
    await employee.save();
    
    const populatedEmployee = await Employee.findById(employee._id)
      .populate('manager', 'firstName lastName employeeId');
    
    res.status(201).json(populatedEmployee);
  } catch (err) {
    console.error("Error creating employee:", err);
    if (err.code === 11000) {
      // Handle duplicate key errors with more specific messages
      const duplicateField = Object.keys(err.keyValue)[0];
      const duplicateValue = err.keyValue[duplicateField];
      
      let message = "Duplicate value found";
      if (duplicateField === 'email') {
        message = `An employee with email "${duplicateValue}" already exists`;
      } else if (duplicateField === 'employeeId') {
        message = `An employee with ID "${duplicateValue}" already exists`;
      }
      
      return res.status(400).json({ 
        message,
        field: duplicateField,
        value: duplicateValue,
        error: err.message 
      });
    }
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const updateData = { ...req.body };

    console.log("Employee ID to update:", employeeId);
    console.log("Update data:", updateData);

    // Clean the data - handle empty manager field
    if (updateData.manager === '' || updateData.manager === null) {
      updateData.manager = null; // Set to null for updates to clear the field
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('manager', 'firstName lastName employeeId');

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(updatedEmployee);
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Get HR analytics/dashboard data
exports.getHRAnalytics = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ status: 'active' });
    const inactiveEmployees = await Employee.countDocuments({ status: { $ne: 'active' } });
    
    // Department breakdown
    const departmentBreakdown = await Employee.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Employment type breakdown
    const employmentTypeBreakdown = await Employee.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$employmentType', count: { $sum: 1 } } }
    ]);
    
    // Salary statistics
    const salaryStats = await Employee.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          averageSalary: { $avg: '$salary.amount' },
          minSalary: { $min: '$salary.amount' },
          maxSalary: { $max: '$salary.amount' },
          totalPayroll: { $sum: '$salary.amount' }
        }
      }
    ]);
    
    // Recent hires (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentHires = await Employee.find({
      startDate: { $gte: thirtyDaysAgo },
      status: 'active'
    }).sort({ startDate: -1 }).limit(10);
    
    // Upcoming work anniversaries (next 60 days)
    const now = new Date();
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(now.getDate() + 60);
    
    const upcomingAnniversaries = await Employee.find({
      status: 'active'
    }).then(employees => {
      return employees.filter(emp => {
        const anniversary = new Date(emp.startDate);
        anniversary.setFullYear(now.getFullYear());
        if (anniversary < now) {
          anniversary.setFullYear(now.getFullYear() + 1);
        }
        return anniversary <= sixtyDaysFromNow;
      }).sort((a, b) => {
        const aAnniversary = new Date(a.startDate);
        aAnniversary.setFullYear(now.getFullYear());
        if (aAnniversary < now) aAnniversary.setFullYear(now.getFullYear() + 1);
        
        const bAnniversary = new Date(b.startDate);
        bAnniversary.setFullYear(now.getFullYear());
        if (bAnniversary < now) bAnniversary.setFullYear(now.getFullYear() + 1);
        
        return aAnniversary - bAnniversary;
      }).slice(0, 10);
    });
    
    // Performance ratings distribution
    const performanceStats = await Employee.aggregate([
      { $match: { status: 'active', 'performance.0': { $exists: true } } },
      { $unwind: '$performance' },
      { $sort: { 'performance.reviewDate': -1 } },
      { $group: { _id: '$_id', latestRating: { $first: '$performance.rating' } } },
      { $group: { _id: '$latestRating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      overview: {
        totalEmployees,
        activeEmployees: totalEmployees,
        inactiveEmployees,
        totalPayroll: salaryStats[0]?.totalPayroll || 0,
        averageSalary: salaryStats[0]?.averageSalary || 0
      },
      departmentBreakdown,
      employmentTypeBreakdown,
      salaryStats: salaryStats[0] || {},
      recentHires,
      upcomingAnniversaries,
      performanceStats
    });
  } catch (err) {
    console.error("Error fetching HR analytics:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Add performance review
exports.addPerformanceReview = async (req, res) => {
  try {
    const { rating, comments } = req.body;
    const employeeId = req.params.id;
    
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    employee.performance.push({
      rating,
      comments,
      reviewedBy: req.user.id, // Assuming auth middleware provides user info
      reviewDate: new Date()
    });
    
    await employee.save();
    
    const updatedEmployee = await Employee.findById(employeeId)
      .populate('performance.reviewedBy', 'firstName lastName employeeId');
    
    res.json(updatedEmployee);
  } catch (err) {
    console.error("Error adding performance review:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Update leave balance
exports.updateLeaveBalance = async (req, res) => {
  try {
    const { vacation, sick, personal } = req.body;
    const employeeId = req.params.id;
    
    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      { 
        'leaveBalance.vacation': vacation,
        'leaveBalance.sick': sick,
        'leaveBalance.personal': personal
      },
      { new: true }
    );
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    res.json(employee);
  } catch (err) {
    console.error("Error updating leave balance:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Search employees
exports.searchEmployees = async (req, res) => {
  try {
    const { q, department, status } = req.query;
    
    const query = {};
    if (department) query.department = department;
    if (status) query.status = status;
    
    if (q) {
      query.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { employeeId: { $regex: q, $options: 'i' } },
        { position: { $regex: q, $options: 'i' } }
      ];
    }
    
    const employees = await Employee.find(query)
      .populate('manager', 'firstName lastName employeeId')
      .sort({ firstName: 1 })
      .limit(50);
    
    res.json(employees);
  } catch (err) {
    console.error("Error searching employees:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Upload employee document
exports.uploadDocument = [
  upload.single('document'),
  async (req, res) => {
    try {
      const employeeId = req.params.id;
      const { documentType, documentName } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Check if employee exists
      const employeeExists = await Employee.findById(employeeId);
      if (!employeeExists) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      // Get file extension from original filename
      const fileExtension = path.extname(req.file.originalname);
      
      const newDocument = {
        name: documentName || req.file.originalname,
        type: documentType || 'other',
        filePath: req.file.path,
        fileExtension: fileExtension,
        uploadDate: new Date()
      };
      
      console.log('📄 Uploading document:', newDocument);
      
      // Using MongoDB's native operations to bypass Mongoose type checking
      const mongoose = require('mongoose');
      const ObjectId = mongoose.Types.ObjectId;
      
      // Generate an _id for the subdocument
      const documentId = new ObjectId();
      const documentWithId = {
        _id: documentId,
        ...newDocument
      };
      
      // Update using MongoDB native
      await Employee.collection.updateOne(
        { _id: new ObjectId(employeeId) },
        [
          {
            $set: {
              documents: {
                $cond: {
                  if: { $isArray: "$documents" },
                  then: { $concatArrays: ["$documents", [documentWithId]] },
                  else: [documentWithId]
                }
              }
            }
          }
        ]
      );
      
      // Fetch using MongoDB native to avoid Mongoose schema issues
      const updatedEmployee = await Employee.collection.findOne(
        { _id: new ObjectId(employeeId) }
      );
      
      console.log('✅ Document uploaded successfully');
      console.log('📋 Documents in DB:', updatedEmployee.documents);
      
      // Return the document with its ID
      res.json({
        message: "Document uploaded successfully",
        document: {
          _id: documentId.toString(),
          name: documentWithId.name,
          type: documentWithId.type,
          filePath: documentWithId.filePath,
          fileExtension: documentWithId.fileExtension,
          uploadDate: documentWithId.uploadDate
        }
      });
    } catch (err) {
      console.error("Error uploading document:", err);
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }
];

// Download employee document
exports.downloadDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    
    const mongoose = require('mongoose');
    const ObjectId = mongoose.Types.ObjectId;
    const fs = require('fs');
    const path = require('path');
    
    // Use MongoDB native query to get employee with documents
    const employee = await Employee.collection.findOne(
      { _id: new ObjectId(id) }
    );
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Find document in the array
    const document = employee.documents?.find(
      doc => doc._id.toString() === documentId
    );
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }
    
    // Determine MIME type based on file extension
    const ext = (document.fileExtension || path.extname(document.name)).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png'
    };
    
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Ensure filename has the correct extension
    const filename = document.name.endsWith(ext) ? document.name : document.name + ext;
    
    // Set headers for download with proper MIME type
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    
    // Send file
    res.sendFile(path.resolve(document.filePath));
  } catch (err) {
    console.error("Error downloading document:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Delete employee document
exports.deleteDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    
    const mongoose = require('mongoose');
    const ObjectId = mongoose.Types.ObjectId;
    const fs = require('fs');
    
    // Use MongoDB native query to get employee with documents
    const employee = await Employee.collection.findOne(
      { _id: new ObjectId(id) }
    );
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Find document in the array
    const document = employee.documents?.find(
      doc => doc._id.toString() === documentId
    );
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    
    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    
    // Remove document from array using MongoDB native operation
    await Employee.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $pull: {
          documents: { _id: new ObjectId(documentId) }
        }
      }
    );
    
    res.json({
      message: "Document deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting document:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Get department statistics
exports.getDepartmentStats = async (req, res) => {
  try {
    const departmentStats = await Employee.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$department',
          employeeCount: { $sum: 1 },
          averageSalary: { $avg: '$salary.amount' },
          totalSalary: { $sum: '$salary.amount' },
          employmentTypes: { $push: '$employmentType' }
        }
      },
      {
        $project: {
          department: '$_id',
          employeeCount: 1,
          averageSalary: { $round: ['$averageSalary', 2] },
          totalSalary: 1,
          fullTimeCount: {
            $size: {
              $filter: {
                input: '$employmentTypes',
                cond: { $eq: ['$$this', 'full_time'] }
              }
            }
          },
          partTimeCount: {
            $size: {
              $filter: {
                input: '$employmentTypes',
                cond: { $eq: ['$$this', 'part_time'] }
              }
            }
          }
        }
      },
      { $sort: { employeeCount: -1 } }
    ]);
    
    res.json(departmentStats);
  } catch (err) {
    console.error("Error fetching department stats:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Get payroll summary
exports.getPayrollSummary = async (req, res) => {
  try {
    const { department, month, year } = req.query;
    
    const query = { status: 'active' };
    if (department) query.department = department;
    
    const employees = await Employee.find(query);
    
    let totalPayroll = 0;
    const departmentPayroll = {};
    const employmentTypePayroll = {};
    
    employees.forEach(emp => {
      const monthlySalary = emp.salary.payFrequency === 'yearly' 
        ? emp.salary.amount / 12 
        : emp.salary.payFrequency === 'hourly'
        ? emp.salary.amount * 160 // Assuming 160 hours per month
        : emp.salary.amount;
      
      totalPayroll += monthlySalary;
      
      if (!departmentPayroll[emp.department]) {
        departmentPayroll[emp.department] = 0;
      }
      departmentPayroll[emp.department] += monthlySalary;
      
      if (!employmentTypePayroll[emp.employmentType]) {
        employmentTypePayroll[emp.employmentType] = 0;
      }
      employmentTypePayroll[emp.employmentType] += monthlySalary;
    });
    
    res.json({
      totalMonthlyPayroll: Math.round(totalPayroll * 100) / 100,
      departmentPayroll,
      employmentTypePayroll,
      employeeCount: employees.length
    });
  } catch (err) {
    console.error("Error fetching payroll summary:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Bulk update employees
exports.bulkUpdateEmployees = async (req, res) => {
  try {
    const { employeeIds, updateData } = req.body;
    
    if (!employeeIds || !Array.isArray(employeeIds)) {
      return res.status(400).json({ message: "Employee IDs array is required" });
    }
    
    const result = await Employee.updateMany(
      { _id: { $in: employeeIds } },
      updateData
    );
    
    res.json({
      message: `${result.modifiedCount} employees updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Error bulk updating employees:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Get employees by manager
exports.getEmployeesByManager = async (req, res) => {
  try {
    const managerId = req.params.managerId;
    
    const employees = await Employee.find({ 
      manager: managerId,
      status: 'active'
    }).populate('manager', 'firstName lastName employeeId');
    
    res.json(employees);
  } catch (err) {
    console.error("Error fetching employees by manager:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Export for multer middleware
exports.uploadMiddleware = upload;
