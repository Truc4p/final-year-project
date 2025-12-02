const Customer = require("../../models/finance/customer");

// Create new customer
const createCustomer = async (req, res) => {
  try {
    const data = req.body || {};

    if (!data?.contactPerson?.email) {
      return res.status(400).json({ message: "Contact email is required" });
    }

    const customer = new Customer({
      ...data,
      createdBy: req.user?._id,
      status: data.status || 'active'
    });

    await customer.save();
    res.status(201).json({ message: 'Customer created successfully', customer });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// List customers with filters and pagination
const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { companyName: new RegExp(search, 'i') },
        { 'contactPerson.email': new RegExp(search, 'i') },
        { 'contactPerson.firstName': new RegExp(search, 'i') },
        { 'contactPerson.lastName': new RegExp(search, 'i') },
        { customerNumber: new RegExp(search, 'i') }
      ];
    }

    const customers = await Customer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await Customer.countDocuments(filter);

    res.json({
      customers,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        total,
        hasNext: pageNumber < Math.ceil(total / limitNumber),
        hasPrev: pageNumber > 1,
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single customer
const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const update = req.body || {};
    update.lastModifiedBy = req.user?._id;

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer updated successfully', customer });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
};

