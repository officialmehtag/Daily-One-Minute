export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Privacy Policy — YourBragBook</title>
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

.contact-box{background:var(--sur);border:1px solid var(--bdr);border-radius:12px;padding:24px;margin-top:48px;}
.contact-box p{font-size:14px;color:var(--tx2);margin-bottom:8px;}
.contact-box a{color:var(--acc);}

.divider{height:1px;background:var(--bdr);margin:32px 0;}
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
  <h1 class="page-title">Privacy Policy</h1>
  <p class="page-date">Last updated: 20 May 2026 &nbsp;·&nbsp; Tale Breeze, Delhi, India</p>

  <div class="section">
    <h2 class="section-title">Who we are</h2>
    <p>YourBragBook is operated by Tale Breeze, based in Delhi, India. When we say "we", "us", or "our", we mean Tale Breeze. When we say "you", we mean you, the person using the service.</p>
    <p>If you have any questions about this policy, email us at <a href="mailto:hello@gauravmehta.me">hello@gauravmehta.me</a>.</p>
  </div>

  <div class="divider"></div>

  <div class="section">
    <h2 class="section-title">What we collect</h2>
    <p>We collect only what we need to run the service:</p>
    <ul>
      <li><strong style="color:var(--tx);">Your email address</strong> — to create your account and contact you about your subscription.</li>
      <li><strong style="color:var(--tx);">Your entries</strong> — the daily logs you write. These are stored securely and used only to generate your playbook.</li>
      <li><strong style="color:var(--tx);">Your CV</strong> — if you upload one, it is used only to improve the quality of your playbook. It is not shared with anyone.</li>
      <li><strong style="color:var(--tx);">Your goal</strong> — the career goal you select. Used to tailor your playbook.</li>
      <li><strong style="color:var(--tx);">Payment information</strong> — processed entirely by Stripe or Razorpay. We never see or store your card details.</li>
      <li><strong style="color:var(--tx);">Usage data</strong> — basic information like how many entries you have logged and how many playbooks you have generated. Used to manage your account limits.</li>
    </ul>
  </div>

  <div class="divider"></div>

  <div class="section">
    <h2 class="section-title">How we use your data</h2>
    <p>We use your data to:</p>
    <ul>
      <li>Provide the service — store your entries, generate your playbooks, and show you your record.</li>
      <li>Manage your account — track your subscription status and usage limits.</li>
      <li>Send you important updates — about your account, your subscription, or the service. We do not send marketing emails without your consent.</li>
      <li>Improve the service — in aggregate and anonymised form only.</li>
    </ul>
    <p>We do not sell your data. We do not share your data with advertisers. We do not use your entries or your CV for any purpose other than running the service for you.</p>
  </div>

  <div class="divider"></div>

  <div class="section">
    <h2 class="section-title">How we store your data</h2>
    <p>Your data is stored securely using Supabase, a cloud database provider. Data is encrypted at rest and in transit. We use industry-standard security practices.</p>
    <p>Your entries and playbooks are stored as long as your account is active. If your account is deleted, your data is permanently removed within 7 days.</p>
  </div>

  <div class="divider"></div>

  <div class="section">
    <h2 class="section-title">Third-party services</h2>
    <p>We use the following third-party services to operate YourBragBook:</p>
    <ul>
      <li><strong style="color:var(--tx);">Supabase</strong> — database and authentication.</li>
      <li><strong style="color:var(--tx);">Anthropic</strong> — AI that generates your playbook. Your entries are sent to Anthropic's API to produce the playbook. Anthropic's privacy policy applies to how they handle this data.</li>
      <li><strong style="color:var(--tx);">Stripe</strong> — payment processing for international users.</li>
      <li><strong style="color:var(--tx);">Razorpay</strong> — payment processing for users in India.</li>
      <li><strong style="color:var(--tx);">Vercel</strong> — hosting.</li>
    </ul>
    <p>None of these providers are permitted to use your data for their own purposes beyond what is needed to provide their services.</p>
  </div>

  <div class="divider"></div>

  <div class="section">
    <h2 class="section-title">Your rights</h2>
    <p>You have the right to:</p>
    <ul>
      <li>Access the data we hold about you.</li>
      <li>Correct any inaccurate data.</li>
      <li>Request deletion of your account and all associated data.</li>
      <li>Export your entries at any time using the Download button in the app.</li>
    </ul>
    <p>To exercise any of these rights, email us at <a href="mailto:hello@gauravmehta.me">hello@gauravmehta.me</a>. We will respond within 48 hours.</p>
  </div>

  <div class="divider"></div>

  <div class="section">
    <h2 class="section-title">Browser storage</h2>
    <p>We do not use cookies. We use browser localStorage and sessionStorage to keep you logged in and remember your preferences such as your region. This data stays on your device and is not transmitted to us. You can clear it at any time by clearing your browser storage.</p>
    <p>We do not use any advertising or tracking technologies.</p>
  </div>

  <div class="divider"></div>

  <div class="section">
    <h2 class="section-title">Changes to this policy</h2>
    <p>If we make material changes to this policy, we will notify you by email before they take effect. The date at the top of this page always reflects when it was last updated.</p>
  </div>


  <div class="divider"></div>

  <div class="section">
    <h2 class="section-title">Lawful basis for processing (GDPR)</h2>
    <p>If you are located in the European Economic Area (EEA), we process your personal data on the following lawful bases:</p>
    <ul>
      <li><strong style="color:var(--tx);">Contract</strong> — processing your entries and generating your playbook is necessary to provide the service you have signed up for.</li>
      <li><strong style="color:var(--tx);">Legitimate interests</strong> — we may process basic usage data to improve the service, where this does not override your rights.</li>
      <li><strong style="color:var(--tx);">Legal obligation</strong> — we may process data where required by law.</li>
    </ul>
  </div>

  <div class="divider"></div>

  <div class="section">
    <h2 class="section-title">Your rights under GDPR (EEA users)</h2>
    <p>If you are in the European Economic Area, you have the following rights in addition to those listed above:</p>
    <ul>
      <li><strong style="color:var(--tx);">Right to restrict processing</strong> — you can ask us to pause processing your data in certain circumstances.</li>
      <li><strong style="color:var(--tx);">Right to object</strong> — you can object to processing based on legitimate interests.</li>
      <li><strong style="color:var(--tx);">Right to data portability</strong> — you can request your data in a machine-readable format. Use the Download button in the app to export your entries at any time.</li>
      <li><strong style="color:var(--tx);">Right to lodge a complaint</strong> — you have the right to complain to your local data protection authority if you believe we have not handled your data correctly.</li>
    </ul>
    <p>To exercise any of these rights, email <a href="mailto:hello@gauravmehta.me">hello@gauravmehta.me</a>. We will respond within 30 days.</p>
  </div>

  <div class="divider"></div>

  <div class="section">
    <h2 class="section-title">International data transfers</h2>
    <p>YourBragBook is operated from India. If you are accessing the service from outside India — including from the EEA — your data will be transferred to and processed in India and the United States (where our infrastructure providers Supabase, Vercel, and Anthropic operate).</p>
    <p>We ensure that any transfers are made with appropriate safeguards in place. By using the service, you consent to this transfer.</p>
  </div>

  <div class="divider"></div>

  <div class="section">
    <h2 class="section-title">Data retention</h2>
    <p>We retain your data for as long as your account is active. Specifically:</p>
    <ul>
      <li><strong style="color:var(--tx);">Active accounts</strong> — your entries, playbooks, and account data are retained for as long as you have an account.</li>
      <li><strong style="color:var(--tx);">Deleted accounts</strong> — all data is permanently deleted within 7 days of account deletion.</li>
      <li><strong style="color:var(--tx);">Payment records</strong> — basic transaction records may be retained for up to 7 years as required by Indian financial regulations.</li>
    </ul>
  </div>

  <div class="divider"></div>

  <div class="section">
    <h2 class="section-title">California users (CCPA)</h2>
    <p>If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA):</p>
    <ul>
      <li>The right to know what personal information we collect and how we use it.</li>
      <li>The right to delete your personal information.</li>
      <li>The right to opt out of the sale of your personal information.</li>
    </ul>
    <p><strong style="color:var(--tx);">We do not sell your personal information.</strong> We do not share your personal information with third parties for their own marketing purposes.</p>
    <p>To exercise your CCPA rights, email <a href="mailto:hello@gauravmehta.me">hello@gauravmehta.me</a>.</p>
  </div>

  <div class="divider"></div>

  <div class="section">
    <h2 class="section-title">Grievance Officer (India)</h2>
    <p>In accordance with the Information Technology Act, 2000 and rules made thereunder, the name and contact details of the Grievance Officer are:</p>
    <ul>
      <li><strong style="color:var(--tx);">Name:</strong> Gaurav Mehta</li>
      <li><strong style="color:var(--tx);">Organisation:</strong> Tale Breeze</li>
      <li><strong style="color:var(--tx);">Email:</strong> <a href="mailto:hello@gauravmehta.me">hello@gauravmehta.me</a></li>
      <li><strong style="color:var(--tx);">Address:</strong> Delhi, India</li>
    </ul>
    <p>Any complaints or grievances regarding the processing of your personal data should be directed to the Grievance Officer. We will acknowledge your complaint within 24 hours and resolve it within 30 days.</p>
  </div>
  <div class="contact-box">
    <p><strong style="color:var(--tx);">Questions?</strong></p>
    <p>Email us at <a href="mailto:hello@gauravmehta.me">hello@gauravmehta.me</a>. We read every message and respond within 48 hours.</p>
    <p style="margin-top:8px;font-size:13px;color:var(--tx3);">Tale Breeze · Delhi, India</p>
  </div>
</div>

</body>
</html>
`)
}
