export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Terms of Service — YourBragBook</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#0e0f13;--sur:#16181e;--bdr:rgba(255,255,255,0.07);
  --tx:#f0f0f0;--tx2:#a8aab5;--tx3:#5a5d6b;
  --acc:#7C6FF7;--green:#2EC97A;
}
body{background:var(--bg);color:var(--tx);font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;line-height:1.8;min-height:100vh;}
a{color:var(--acc);}

.nav{position:sticky;top:0;z-index:100;background:rgba(14,15,19,0.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--bdr);padding:0 24px;}
.nav-inner{max-width:720px;margin:0 auto;height:56px;display:flex;align-items:center;justify-content:space-between;}
.nav-brand{font-size:15px;font-weight:700;color:var(--tx);text-decoration:none;}
.nav-brand span{color:var(--acc);}
.nav-back{font-size:13px;color:var(--tx2);text-decoration:none;}
.nav-back:hover{color:var(--tx);}

.wrap{max-width:720px;margin:0 auto;padding:60px 24px 100px;}
.page-label{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--acc);margin-bottom:16px;}
.page-title{font-size:clamp(28px,4vw,42px);font-weight:700;line-height:1.2;letter-spacing:-.5px;margin-bottom:12px;}
.page-date{font-size:13px;color:var(--tx3);margin-bottom:48px;padding-bottom:32px;border-bottom:1px solid var(--bdr);}

.section{margin-bottom:40px;}
.section-title{font-size:17px;font-weight:600;color:var(--tx);margin-bottom:12px;padding-top:8px;}
.section p{font-size:15px;color:var(--tx2);margin-bottom:12px;}
.section ul{padding-left:20px;margin-bottom:12px;}
.section ul li{font-size:15px;color:var(--tx2);margin-bottom:6px;}

.highlight-box{background:var(--sur);border:1px solid var(--bdr);border-radius:12px;padding:20px 24px;margin-bottom:32px;}
.highlight-box p{font-size:14px;color:var(--tx2);margin:0;}

.contact-box{background:var(--sur);border:1px solid var(--bdr);border-radius:12px;padding:24px;margin-top:48px;}
.contact-box p{font-size:14px;color:var(--tx2);margin-bottom:8px;}

.divider{height:1px;background:var(--bdr);margin:32px 0;}

.toc{background:var(--sur);border:1px solid var(--bdr);border-radius:12px;padding:24px;margin-bottom:48px;}
.toc p{font-size:13px;font-weight:600;color:var(--tx3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px;}
.toc ul{list-style:none;padding:0;}
.toc ul li{margin-bottom:8px;}
.toc ul li a{font-size:14px;color:var(--tx2);text-decoration:none;}
.toc ul li a:hover{color:var(--acc);}
</style>
</head>
<body>

<nav class="nav">
  <div class="nav-inner">
    <a href="/" class="nav-brand">YourBrag<span>Book</span></a>
    <a href="/" class="nav-back">← Back</a>
  </div>
</nav>

<div class="wrap">
  <div class="page-label">Legal</div>
  <h1 class="page-title">Terms of Service</h1>
  <p class="page-date">Last updated: 20 May 2026 &nbsp;·&nbsp; Tale Breeze, Delhi, India</p>

  <div class="highlight-box">
    <p>These are the terms on which you use YourBragBook. By creating an account, you agree to these terms. If you do not agree, please do not use the service.</p>
  </div>

  <div class="toc">
    <p>Contents</p>
    <ul>
      <li><a href="#service">1. The service</a></li>
      <li><a href="#account">2. Your account</a></li>
      <li><a href="#trial">3. Free trial</a></li>
      <li><a href="#subscription">4. Subscription and payment</a></li>
      <li><a href="#refund">5. Refund policy</a></li>
      <li><a href="#your-content">6. Your content</a></li>
      <li><a href="#acceptable-use">7. Acceptable use</a></li>
      <li><a href="#account-deletion">8. Account deletion</a></li>
      <li><a href="#limitation">9. Limitation of liability</a></li>
      <li><a href="#changes">10. Changes to these terms</a></li>
      <li><a href="#contact">11. Contact</a></li>
    </ul>
  </div>

  <div class="section" id="service">
    <h2 class="section-title">1. The service</h2>
    <p>YourBragBook is a career tool that helps professionals log their daily work and generate structured playbooks for career conversations. It is operated by Tale Breeze, Delhi, India.</p>
    <p>We reserve the right to modify, suspend, or discontinue the service at any time. We will give reasonable notice if we do.</p>
  </div>

  <div class="divider"></div>

  <div class="section" id="account">
    <h2 class="section-title">2. Your account</h2>
    <p>You must provide a valid email address to create an account. You are responsible for keeping your account secure. Do not share your account with others.</p>
    <p>You must be at least 18 years old to use this service. If you are under 18, you may only use the service with the involvement of a parent or legal guardian.</p>
    <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
  </div>

  <div class="divider"></div>

  <div class="section" id="trial">
    <h2 class="section-title">3. Free trial</h2>
    <p>New users may get access to a free trial before purchasing. The terms of the free trial — including the number of entries, playbooks, and duration — are determined by us and may change at any time at our sole discretion. No card is required to start a trial where one is offered.</p>
    <p>When the trial ends, you will need a paid subscription to continue using the service. Your existing entries remain visible but further actions require a subscription.</p>
  </div>

  <div class="divider"></div>

  <div class="section" id="subscription">
    <h2 class="section-title">4. Subscription and payment</h2>
    <p>YourBragBook is offered on an annual subscription basis. Payment is processed by Stripe (for international users) or Razorpay (for users in India). We never store your card details.</p>
    <p>Your subscription renews automatically each year unless cancelled before the renewal date.</p>
    <p>The features included in a paid subscription are as described on the service at the time of purchase and may change at our discretion. To cancel your subscription, use the Manage plan option inside the app. Cancellation stops future renewals. You keep access until the end of your current paid period.</p>
  </div>

  <div class="divider"></div>

  <div class="section" id="refund">
    <h2 class="section-title">5. Refund policy</h2>
    <p>All payments are non-refundable. Once a subscription payment is made, no refunds will be issued under any circumstances.</p>
    <p>You may cancel your subscription at any time. Cancellation stops future renewals but does not entitle you to a refund for the current paid period. You will retain access until the end of the period you have paid for.</p>
    <p>If you experience a technical issue that prevents you from using the service, contact us at <a href="mailto:hello@gauravmehta.me">hello@gauravmehta.me</a> and we will work to resolve it.</p>
    <p>By completing a payment, you acknowledge and agree that you have read and understood this no-refund policy. You also acknowledge that you have had the opportunity to try the service free of charge for up to 14 days before purchasing, and that you are making an informed decision. If you are an EU consumer, by completing payment you explicitly request immediate access to the service and acknowledge that you waive your statutory 14-day withdrawal right.</p>
  </div>

  <div class="divider"></div>

  <div class="section" id="your-content">
    <h2 class="section-title">6. Your content</h2>
    <p>Everything you write — your entries, your goal, your CV — belongs to you. We do not claim ownership of your content.</p>
    <p>By using the service, you give us permission to process your content to provide the service — specifically, to store your entries and send them to our AI provider (Anthropic) to generate your playbook. This permission exists only to provide the service to you.</p>
    <p>We do not use your content to train AI models. We do not share your content with third parties for any purpose other than running the service.</p>
  </div>

  <div class="divider"></div>

  <div class="section" id="acceptable-use">
    <h2 class="section-title">7. Acceptable use</h2>
    <p>You agree not to:</p>
    <ul>
      <li>Use the service for any unlawful purpose.</li>
      <li>Attempt to access another user's account.</li>
      <li>Reverse engineer or copy any part of the service.</li>
      <li>Use automated tools to extract data from the service.</li>
      <li>Submit false or misleading information.</li>
    </ul>
    <p>Violation of these rules may result in immediate account termination without refund. In serious cases — including but not limited to reverse engineering or copying any part of the service — we reserve the right to pursue legal action.</p>
  </div>

  <div class="divider"></div>

  <div class="section" id="account-deletion">
    <h2 class="section-title">8. Account deletion</h2>
    <p>You can request deletion of your account and all associated data at any time by emailing <a href="mailto:hello@gauravmehta.me">hello@gauravmehta.me</a> with the subject line "Delete my account".</p>
    <p>We will permanently delete your account and all data — entries, playbooks, CV, and settings — within 48 hours of your request. This action cannot be undone.</p>
    <p>If you have an active subscription, account deletion does not entitle you to a refund for the remaining period. Please cancel your subscription first if you wish to stop future charges.</p>
  </div>

  <div class="divider"></div>

  <div class="section" id="limitation">
    <h2 class="section-title">9. Limitation of liability</h2>
    <p>YourBragBook is provided as is. We make no guarantee that the service will be available at all times or that playbooks generated will produce specific career outcomes.</p>
    <p>To the maximum extent permitted by law, Tale Breeze shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
    <p>Our total liability to you for any claim arising from use of the service shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
    <p>These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of the courts of Delhi, India.</p>
  </div>

  <div class="divider"></div>

  <div class="section" id="changes">
    <h2 class="section-title">10. Changes to these terms</h2>
    <p>We may update these terms from time to time. If we make material changes, we will notify you by email at least 14 days before they take effect. Continued use of the service after that date constitutes acceptance of the updated terms.</p>
  </div>

  <div class="divider"></div>


  <div class="section" id="contact">
    <h2 class="section-title">11. Contact</h2>
    <p>For any questions about these terms, email us at <a href="mailto:hello@gauravmehta.me">hello@gauravmehta.me</a>. We respond within 48 hours.</p>
  </div>

  <div class="contact-box">
    <p><strong style="color:var(--tx);">Tale Breeze</strong></p>
    <p>Delhi, India</p>
    <p><a href="mailto:hello@gauravmehta.me">hello@gauravmehta.me</a></p>
  </div>
</div>

</body>
</html>
`)
}
