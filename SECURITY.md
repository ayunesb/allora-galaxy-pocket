
# 🔒 Allora OS Security Policy

## Reporting a Vulnerability

We take security seriously at Allora OS.

If you discover a vulnerability in the application, our APIs, Supabase configurations, or any dependency, please responsibly disclose it by contacting:

- Email: security@all-or-a.online
- GitHub Issues: Open a "Security" labeled private issue (if available)

We will investigate any credible reports and fix validated issues as soon as possible.

---

## Current Best Practices Implemented

- ✅ Strict Role Level Security (RLS) enforced on all database tables
- ✅ Supabase JWT tenant validation for multi-tenant isolation
- ✅ Security-definer functions to prevent RLS recursion
- ✅ Hardened Vite Development Server (`fs.strict = true`)
- ✅ Up-to-date dependency management (vite, esbuild, nanoid patched)
- ✅ Secure ID generation (`crypto.randomUUID()` used where applicable)
- ✅ Error fallback and loading states across all major app flows
- ✅ Regular Lighthouse audits for accessibility and security
- ✅ Periodic npm audit and dependency vulnerability scanning
- ✅ Production builds verified free of known CVEs (Common Vulnerabilities and Exposures)

---

## Supported Versions

- Active support for latest production version (`main` branch)

---

## Disclosure Timeline

- Vulnerabilities reported will be triaged within **72 hours**.
- Critical vulnerabilities will be patched within **7 business days** of confirmation.
- Public disclosures, if necessary, will be coordinated with responsible parties.

---

Thank you for helping us build a safer Allora OS ecosystem 🚀.
