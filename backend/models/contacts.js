const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  phone:   { type: String, default: '' },
  message: { type: String, required: true },
  status:  { type: String, default: 'new', enum: ['new', 'read', 'replied'] },
}, { timestamps: true });

// routes/contacts.js also defines this inline — this export prevents
// OverwriteModelError if anything imports the model directly.
module.exports = mongoose.models.Contact || mongoose.model("Contact", contactSchema);