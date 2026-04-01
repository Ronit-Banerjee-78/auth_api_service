export default function MailSetup() {
  const steps = [
    {
      title: "Enable 2-Step Verification on Gmail",
      body: "Go to myaccount.google.com → Security → 2-Step Verification and turn it on. This is required before you can create an App Password.",
    },
    {
      title: "Generate a Gmail App Password",
      body: 'Go to myaccount.google.com → Security → App Passwords. Select "Mail" as the app and "Other" as the device. Click Generate and copy the 16-character password shown.',
    },
    {
      title: "Add credentials to your .env file",
      body: "Open your backend .env file and add your Gmail address and the App Password you just generated.",
    },
    {
      title: "Restart your backend server",
      body: "After saving the .env file, restart your server. Email sending will now work for verification and password reset flows.",
    },
  ];

  return (
    <>
      <div className="mb-4">
        <h5 className="fw-semibold mb-1">Mail Setup</h5>
        <p className="text-secondary small mb-0">
          Configure Gmail to send verification and password reset emails.
        </p>
      </div>

      {/* Warning */}
      <div
        className="border rounded-3 p-3 mb-4 small"
        style={{ background: "#fffbeb", borderColor: "#fde68a !important" }}
      >
        <strong>Important:</strong> Never use your regular Gmail password. Always use an App Password generated specifically for this service.
      </div>

      {/* Steps */}
      <div className="bg-white border rounded-3 p-3 mb-4">
        <p className="fw-medium mb-3">Setup Steps</p>
        <div className="d-flex flex-column gap-3">
          {steps.map((s, i) => (
            <div key={i} className="d-flex gap-3">
              <div className="step-number mt-1">{i + 1}</div>
              <div>
                <p className="fw-medium small mb-1">{s.title}</p>
                <p className="text-secondary small mb-0">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ENV config */}
      <div className="bg-white border rounded-3 p-3 mb-4">
        <p className="fw-medium mb-3">Environment Variables</p>
        <p className="text-secondary small mb-2">
          Add these to your <code>.env</code> file:
        </p>
        <div className="code-block">
          <span className="comment"># Gmail credentials</span>
          {"\n"}
          <span className="key">EMAIL_USER</span>
          {"="}
          <span className="string">your_email@gmail.com</span>
          {"\n"}
          <span className="key">EMAIL_PASS</span>
          {"="}
          <span className="string">your_16_char_app_password</span>
          {"\n\n"}
          <span className="comment"># Used in email links</span>
          {"\n"}
          <span className="key">API_URL</span>
          {"="}
          <span className="string">https://your-api-domain.com</span>
          {"\n"}
          <span className="key">FRONTEND_URL</span>
          {"="}
          <span className="string">https://your-frontend-domain.com</span>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-white border rounded-3 p-3">
        <p className="fw-medium mb-3">Troubleshooting</p>
        <div className="d-flex flex-column gap-3">
          {[
            {
              problem: "Invalid login error",
              fix: "Make sure you are using the App Password, not your regular Gmail password.",
            },
            {
              problem: "Emails going to spam",
              fix: 'Ask your users to mark emails from your address as "Not Spam". Consider using a custom domain email for production.',
            },
            {
              problem: "App Password option not visible",
              fix: "2-Step Verification must be enabled first. Without it, the App Passwords section does not appear.",
            },
            {
              problem: "Emails not sending in production",
              fix: "Check that EMAIL_USER and EMAIL_PASS environment variables are set on your hosting platform, not just in .env locally.",
            },
          ].map((item, i) => (
            <div key={i} className="border-start ps-3" style={{ borderColor: "#dee2e6" }}>
              <p className="fw-medium small mb-1">{item.problem}</p>
              <p className="text-secondary small mb-0">{item.fix}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
