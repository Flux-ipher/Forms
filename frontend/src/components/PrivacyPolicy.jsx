import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <div className="prose prose-primary max-w-none text-gray-600 space-y-6">
          <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
            <p>Welcome to FormFlow. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. The Data We Collect About You</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
              <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. How We Use Your Personal Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
              <li>Where we need to comply with a legal obligation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Google Workspace APIs</h2>
            <p>Our application uses Google Workspace APIs (specifically Google Drive API) to allow users to upload files to forms. Our use and transfer of information received from Google APIs to any other app will adhere to <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
            <p className="mt-2">Specifically:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>We only request access to Google Drive to upload files that you explicitly submit through our forms.</li>
              <li>We do not read, modify, or delete any other files in your Google Drive.</li>
              <li>We do not share your Google Drive data with third-party AI models or unauthorized entities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Data Security</h2>
            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Contact Us</h2>
            <p>If you have any questions about this privacy policy or our privacy practices, please contact us.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
