import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <div className="prose prose-primary max-w-none text-gray-600 space-y-6">
          <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using FormFlow, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
            <p>FormFlow provides users with tools to create, distribute, and analyze digital forms. We reserve the right to modify, suspend or discontinue the Service with or without notice at any time and without any liability to you.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. User Conduct</h2>
            <p>You agree to use the Service only for lawful purposes. You agree not to take any action that might compromise the security of the site, render the site inaccessible to others or otherwise cause damage to the site or the Content.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Third-Party Services</h2>
            <p>Our Service integrates with third-party services, including Google Drive for file storage. By using these features, you also agree to be bound by the respective terms of service of these third-party providers. We are not responsible for the availability or content of these external sites or resources.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Intellectual Property Rights</h2>
            <p>The Service and its original content, features, and functionality are owned by FormFlow and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Disclaimer of Warranties</h2>
            <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations or warranties of any kind, express or implied, as to the operation of their services, or the information, content or materials included therein.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Limitation of Liability</h2>
            <p>In no event shall FormFlow, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
