const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const formatPhone = (phone) => {
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('91') && clean.length === 12) return '+' + clean;
  if (clean.length === 10) return '+91' + clean;
  return '+' + clean;
};

exports.sendOrderSMS = async ({ phone, name, orderId, total }) => {
  try {
    await client.messages.create({
      body: `Hi ${name}! 🎉 Your NutsNTreat order #${orderId} is confirmed! Total: ₹${total}. Expected delivery: 3-5 days. Questions? Call +91-98765-43210. Thank you!`,
      from: process.env.TWILIO_PHONE,
      to: formatPhone(phone)
    });
    console.log(`✅ SMS sent to ${phone}`);
    return true;
  } catch (err) {
    console.error('❌ SMS failed:', err.message);
    return false;
  }
};

exports.sendStatusSMS = async ({ phone, name, orderId, status }) => {
  const msgs = {
    Shipped:   `Hi ${name}! Your NutsNTreat order #${orderId} has been shipped 🚚. Expected in 2-3 days. Track via our website.`,
    Delivered: `Hi ${name}! Your NutsNTreat order #${orderId} is delivered 🎁. Enjoy your treats! Rate us: nutsNtreat.in`,
    Cancelled: `Hi ${name}, your NutsNTreat order #${orderId} has been cancelled. Refund (if any) in 5-7 days. Sorry for the inconvenience.`
  };
  const body = msgs[status] || `Hi ${name}! Your NutsNTreat order #${orderId} status: ${status}.`;
  try {
    await client.messages.create({ body, from: process.env.TWILIO_PHONE, to: formatPhone(phone) });
    return true;
  } catch (err) {
    console.error('❌ Status SMS failed:', err.message);
    return false;
  }
};

exports.sendSubscriptionSMS = async ({ phone, name, plan, price }) => {
  try {
    await client.messages.create({
      body: `Hi ${name}! 🥜 Welcome to NutsNTreat ${plan} plan (₹${price}/month). Your first box ships soon! Questions? +91-98765-43210`,
      from: process.env.TWILIO_PHONE,
      to: formatPhone(phone)
    });
    return true;
  } catch (err) {
    console.error('❌ Subscription SMS failed:', err.message);
    return false;
  }
};
