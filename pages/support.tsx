import React, { useState } from 'react';
import { RequireAuth } from '../components/RequireAuth';
import {
  QuestionMarkCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const faqs = [
  {
    question: 'How do I add a new client?',
    answer:
      'Go to the Clients page and click the "Add Client" button. Fill in the client details and save.',
  },
  {
    question: 'How do I record a new order?',
    answer:
      'Navigate to the Orders page and click "Add Order". Enter the order details and assign it to a client.',
  },
  {
    question: 'How can I update my business information?',
    answer:
      'Visit the Settings page to update your business name, address, contact details, and logo.',
  },
  {
    question: 'How do I add or update inventory items?',
    answer:
      'Go to the Inventory page and click "Add Item" to add new inventory. To update, click the edit icon next to an item, make your changes, and save.',
  },
  {
    question: 'How can I track low-stock inventory?',
    answer:
      'The Inventory dashboard highlights items that are low in stock. You can also set low-stock alerts for each item.',
  },
  {
    question: 'How do I record a payment?',
    answer:
      'Navigate to the Payments page and click "Add Payment". Enter the payment details, select the client or order, and save.',
  },
  {
    question: 'Can I view payment history for a client or order?',
    answer:
      'Yes, go to the client or order profile page to see a full payment history and outstanding balances.',
  },
  {
    question: 'How do I generate business reports?',
    answer:
      'Go to the Reports page to view and export summaries of clients, orders, payments, and inventory. You can filter and download reports as CSV or PDF.',
  },
  {
    question: 'Who can I contact for technical support?',
    answer: 'See the contact information below for help via phone or email.',
  },
];

const SupportPage: React.FC = () => {
  // State to track which FAQ is open
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Toggle FAQ accordion
  const toggleFAQ = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <RequireAuth>
      <div className="max-w-md mx-auto p-6 mt-10">
        {/* Card container */}
        <div className="bg-white rounded-2xl shadow-lg p-8 relative">
          {/* Icon and header */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <QuestionMarkCircleIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Help & Support</h1>
            <p className="text-gray-500 mt-1">
              Find answers or contact us for help
            </p>
          </div>
          {/* FAQ Accordion */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-blue-700 text-center">
              Frequently Asked Questions
            </h2>
            <ul className="space-y-3 max-w-md mx-auto">
              {faqs.map((faq, idx) => (
                <li key={idx} className="border rounded-lg max-w-md mx-auto">
                  <button
                    className="w-full flex justify-between items-center px-0 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onClick={() => toggleFAQ(idx)}
                    aria-expanded={openIndex === idx}
                  >
                    <span className="font-medium text-gray-900 text-left flex-1">
                      {faq.question}
                    </span>
                    <span
                      className={`ml-1 transform transition-transform ${openIndex === idx ? 'rotate-90' : ''}`}
                      style={{ minWidth: 20, textAlign: 'right' }}
                    >
                      ▶
                    </span>
                  </button>
                  {openIndex === idx && (
                    <div className="pb-2 text-gray-700 animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
          {/* Contact Info */}
          <section>
            <h2 className="text-lg font-semibold mb-2 text-blue-700">
              Contact Technical Support
            </h2>
            <div className="flex items-center text-gray-700 mb-1">
              <PhoneIcon className="h-5 w-5 text-blue-500 mr-2" />
              <span className="font-medium">Telephone:</span>{' '}
              <a
                href="tel:0244299095"
                className="text-blue-600 hover:underline ml-1"
              >
                024.429.9095
              </a>
            </div>
            <div className="flex items-center text-gray-700">
              <EnvelopeIcon className="h-5 w-5 text-blue-500 mr-2" />
              <span className="font-medium">Email:</span>{' '}
              <a
                href="mailto:thegeektoolbox@gmail.com"
                className="text-blue-600 hover:underline ml-1"
              >
                thegeektoolbox@gmail.com
              </a>
            </div>
          </section>
        </div>
      </div>
    </RequireAuth>
  );
};

export default SupportPage;
