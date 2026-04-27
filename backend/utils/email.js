const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Arial,sans-serif}
  .wrap{max-width:600px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
  .header{background:#3B1F0A;padding:28px 32px;text-align:center}
  .logo{font-size:28px;color:#F5D5A0;font-weight:700;letter-spacing:-0.5px}
  .logo span{color:#8BC34A}
  .tagline{color:rgba(255,255,255,0.6);font-size:12px;margin-top:4px;letter-spacing:1px;text-transform:uppercase}
  .body{padding:32px}
  .greeting{font-size:22px;color:#3B1F0A;font-weight:700;margin-bottom:8px}
  .text{font-size:14px;color:#666;line-height:1.8;margin-bottom:16px}
  .highlight-box{background:#FDF6EC;border-left:4px solid #C8832A;border-radius:8px;padding:16px 20px;margin:20px 0}
  .highlight-box h3{color:#3B1F0A;font-size:15px;margin:0 0 10px}
  .order-table{width:100%;border-collapse:collapse;margin:16px 0}
  .order-table th{background:#3B1F0A;color:#fff;padding:10px 14px;text-align:left;font-size:13px}
  .order-table td{padding:10px 14px;border-bottom:1px solid #f0e8d8;font-size:13px;color:#444}
  .order-table tr:last-child td{border-bottom:none}
  .total-row td{font-weight:700;color:#3B1F0A;background:#FDF6EC}
  .status-badge{display:inline-block;background:#C8832A;color:#fff;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:600}
  .cta-btn{display:inline-block;background:#C8832A;color:#fff;padding:14px 32px;border-radius:30px;text-decoration:none;font-weight:600;font-size:15px;margin:16px 0}
  .divider{border:none;border-top:1px solid #f0e8d8;margin:24px 0}
  .footer{background:#3B1F0A;padding:20px 32px;text-align:center}
  .footer p{color:rgba(255,255,255,0.55);font-size:12px;margin:4px 0}
  .footer a{color:#F5D5A0;text-decoration:none}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}
  .info-item{background:#f9f4ee;border-radius:8px;padding:12px}
  .info-label{font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px}
  .info-value{font-size:13px;color:#3B1F0A;font-weight:600}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo">Nuts<span>N</span>Treat</div>
    <div class="tagline">Premium Dry Fruits & Mixes</div>
  </div>
  <div class="body">${content}</div>
  <div class="footer">
    <p>NutsNTreat · Ankalamma Street Pamuru – 523108</p>
    <p>📞 +91 76809 64815· ✉ <a href="mailto:hello@nutsNtreat.in">hello@nutsNtreat.in</a></p>
    <p style="margin-top:10px;font-size:11px">© 2025 NutsNTreat. All rights reserved.</p>
  </div>
</div>
</body>
</html>`;

// ── Order Confirmation Email ──
exports.sendOrderConfirmation = async ({ to, name, orderId, items, subtotal, shipping, total, address, paymentMethod }) => {
  const itemRows = items.map(i => `
    <tr>
      <td>${i.name}</td>
      <td style="text-align:center">${i.quantity}</td>
      <td style="text-align:right">₹${i.price}</td>
      <td style="text-align:right">₹${i.price * i.quantity}</td>
    </tr>`).join('');

  const content = `
    <div class="greeting">Hey ${name}! 🎉</div>
    <p class="text">Your order has been placed successfully. We're thrilled to have you as a customer! Here are your order details:</p>

    <div class="highlight-box">
      <h3>Order Summary</h3>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:14px;color:#666">Order ID: <strong style="color:#3B1F0A">${orderId}</strong></span>
        <span class="status-badge">Confirmed ✓</span>
      </div>
    </div>

    <table class="order-table">
      <thead>
        <tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr>
      </thead>
      <tbody>
        ${itemRows}
        <tr><td colspan="3" style="text-align:right;color:#666;font-size:12px">Subtotal</td><td style="text-align:right">₹${subtotal}</td></tr>
        <tr><td colspan="3" style="text-align:right;color:#666;font-size:12px">Shipping</td><td style="text-align:right">${shipping === 0 ? 'FREE' : '₹' + shipping}</td></tr>
        <tr class="total-row"><td colspan="3" style="text-align:right">Total Amount</td><td style="text-align:right">₹${total}</td></tr>
      </tbody>
    </table>

    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Delivery Address</div>
        <div class="info-value">${address}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Payment Method</div>
        <div class="info-value">${paymentMethod}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Expected Delivery</div>
        <div class="info-value">3–5 Business Days</div>
      </div>
      <div class="info-item">
        <div class="info-label">Support</div>
        <div class="info-value">hello@nutsNtreat.in</div>
      </div>
    </div>

    <hr class="divider">
    <p class="text" style="font-size:13px;color:#999">You'll receive an SMS update when your order is shipped. If you have any questions, reply to this email or call us at +91 98765 43210.</p>
    <p class="text" style="font-size:13px">Thank you for choosing NutsNTreat! 🥜❤️</p>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `✅ Order Confirmed! #${orderId} – NutsNTreat`,
    html: baseTemplate(content)
  });
};

// ── Order Status Update Email ──
exports.sendOrderStatusUpdate = async ({ to, name, orderId, status }) => {
  const statusMessages = {
    Processing: { emoji: '⚙️', msg: 'Your order is being carefully packed by our team.' },
    Shipped:    { emoji: '🚚', msg: 'Your order is on its way! Expected in 2–3 days.' },
    Delivered:  { emoji: '🎁', msg: 'Your order has been delivered! Enjoy your NutsNTreat!' },
    Cancelled:  { emoji: '❌', msg: 'Your order has been cancelled. Refund (if any) will be processed in 5–7 days.' }
  };
  const { emoji, msg } = statusMessages[status] || { emoji: '📦', msg: 'Your order status has been updated.' };

  const content = `
    <div class="greeting">${emoji} Order Update</div>
    <p class="text">Hi ${name}, your order status has been updated.</p>
    <div class="highlight-box">
      <h3>Order #${orderId}</h3>
      <p style="margin:0;font-size:14px">Status: <span class="status-badge">${status}</span></p>
      <p style="margin:10px 0 0;font-size:13px;color:#666">${msg}</p>
    </div>
    <p class="text">For queries, contact us at hello@nutsNtreat.in or +91 98765 43210.</p>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `${emoji} Order #${orderId} – ${status} | NutsNTreat`,
    html: baseTemplate(content)
  });
};

// ── Subscription Confirmation Email ──
exports.sendSubscriptionConfirmation = async ({ to, name, plan, price, deliveryDay }) => {
  const content = `
    <div class="greeting">Welcome to ${plan}! 🎉</div>
    <p class="text">Hi ${name}, your monthly subscription is now active. Get ready for your first box!</p>
    <div class="highlight-box">
      <h3>Subscription Details</h3>
      <div class="info-grid" style="margin:0">
        <div class="info-item"><div class="info-label">Plan</div><div class="info-value">${plan}</div></div>
        <div class="info-item"><div class="info-label">Monthly Price</div><div class="info-value">₹${price}</div></div>
        <div class="info-item"><div class="info-label">Delivery Day</div><div class="info-value">Every ${deliveryDay}${['st','nd','rd'][deliveryDay-1]||'th'} of the month</div></div>
        <div class="info-item"><div class="info-label">Status</div><div class="info-value" style="color:#2D5016">Active ✓</div></div>
      </div>
    </div>
    <p class="text">Your first delivery is on its way. You can pause or cancel anytime by contacting us.</p>
    <p class="text">Thank you for subscribing to NutsNTreat! 🥜</p>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `🎉 Subscription Confirmed – ${plan} | NutsNTreat`,
    html: baseTemplate(content)
  });
};

// ── Welcome Email ──
exports.sendWelcomeEmail = async ({ to, name }) => {
  const content = `
    <div class="greeting">Welcome, ${name}! 🥜</div>
    <p class="text">Your NutsNTreat account has been created successfully. We're so excited to have you join our family of health-conscious snackers!</p>
    <div class="highlight-box">
      <h3>What you get with your account</h3>
      <ul style="margin:0;padding-left:20px;color:#555;font-size:14px;line-height:2">
        <li>Order history & tracking</li>
        <li>Exclusive member discounts</li>
        <li>Early access to new products</li>
        <li>Easy subscription management</li>
      </ul>
    </div>
    <p style="text-align:center"><a href="http://localhost:3000" class="cta-btn">Start Shopping →</a></p>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Welcome to NutsNTreat, ${name}! 🥜`,
    html: baseTemplate(content)
  });
};
// ── OTP Verification Email ──
exports.sendOTPEmail = async ({ to, name, otp }) => {
  const content = `
    <div class="greeting">Verify your email, ${name}! 🔐</div>
    <p class="text">Use the code below to verify your NutsNTreat account. 
    It expires in <strong>10 minutes</strong>.</p>
    <div style="background:#FDF6EC;border:2px dashed #C8832A;border-radius:12px;
         padding:28px;text-align:center;margin:24px 0">
      <div style="font-size:2.8rem;font-weight:800;letter-spacing:14px;
           color:#3B1F0A;font-family:monospace">${otp}</div>
      <div style="font-size:12px;color:#999;margin-top:8px">6-digit verification code</div>
    </div>
    <p class="text" style="font-size:13px;color:#999">
      If you didn't create an account, please ignore this email.
    </p>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `${otp} — Your NutsNTreat verification code`,
    html: baseTemplate(content)
  });
};

// ── Password Reset Email ──
exports.sendResetEmail = async ({ to, name, resetLink }) => {
  const content = `
    <div class="greeting">Reset your password, ${name}! </div>
    <p class="text">We received a request to reset your NutsNTreat account password. 
    Click the button below to set a new password. This link expires in <strong>30 minutes</strong>.</p>

    <div style="text-align:center;margin:28px 0">
      <a href="${resetLink}" class="cta-btn">Reset My Password →</a>
    </div>

    <div class="highlight-box">
      <h3>⚠️ Didn't request this?</h3>
      <p style="margin:0;font-size:13px;color:#666;line-height:1.7">
        If you didn't request a password reset, you can safely ignore this email. 
        Your password will remain unchanged. If you're concerned, please contact us at 
        <a href="mailto:hello@nutsNtreat.in" style="color:#C8832A">hello@nutsNtreat.in</a>.
      </p>
    </div>

    <p class="text" style="font-size:12px;color:#aaa;margin-top:8px">
      Or copy and paste this link into your browser:<br>
      <span style="color:#C8832A;word-break:break-all">${resetLink}</span>
    </p>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: ` Reset your NutsNTreat password`,
    html: baseTemplate(content)
  });
};