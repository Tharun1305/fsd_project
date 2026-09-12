import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { openWhatsApp } from '../utils/whatsapp';

export function FAQPage({ navigate }) {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "What is the minimum order quantity (MOQ)?",
      a: "Our Minimum Order Quantity (MOQ) generally starts from 50 to 100 pieces per style/color depending on the fabric GSM. For specialized printing or custom dye shades, MOQ is 200 pieces."
    },
    {
      q: "Do you provide fabric samples before bulk ordering?",
      a: "Yes! We encourage all wholesale buyers to order our fabric swatch cards and sample pieces to test GSM thickness, bio-wash softness, and fit before placing large bulk commitments. You can submit a Sample Request directly on this website."
    },
    {
      q: "Can I check products online before travelling to Tiruppur?",
      a: "Absolutely. Our digital catalogue allows buyers from Kerala, Bangalore, Tamil Nadu, and pan-India to preview product images, fabric compositions, colors, sizes, and approximate wholesale prices so you can finalize your selection before travelling."
    },
    {
      q: "Do you support private custom neck label branding?",
      a: "Yes, for bulk orders of 300+ pieces, we provide custom neck satin label stitching, woven tags, and custom barcode packaging tags at our Tiruppur stitching unit."
    },
    {
      q: "How fast is transport dispatch to Kerala & Bangalore?",
      a: "We have daily lorry transport tie-ups with leading logistics providers. Orders dispatched from Tiruppur reach Kochi, Ernakulam, Kozhikode, and Bangalore within 24 hours."
    },
    {
      q: "Where is your showroom located and what are the timings?",
      a: "Our showroom is located at 34, 4th Cross St, T N K Nagar, Nesavalar Colony, Tiruppur, Tamil Nadu 641602. We are open 7 days a week from 9:00 AM to 8:30 PM."
    },
    {
      q: "How do I finalize my bulk order payment?",
      a: "After you submit a bulk enquiry online or via WhatsApp, our sales coordinator will send a detailed proforma invoice with bank details. Payments are processed offline via NEFT/RTGS or during your physical showroom visit."
    }
  ];

  return (
    <div className="container py-8 max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">Buyer Help Desk</span>
        <h1 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h1>
        <p className="text-slate-600 text-sm">
          Everything you need to know about bulk fabric sourcing from our Tiruppur unit.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left font-bold text-slate-900 text-base flex justify-between items-center gap-4 hover:bg-slate-50"
              >
                <span className="flex items-center gap-3">
                  <HelpCircle size={18} className="text-blue-600 shrink-0" />
                  {faq.q}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 text-white p-6 rounded-3xl text-center space-y-3">
        <h3 className="font-bold text-lg">Have a Question Not Answered Here?</h3>
        <p className="text-xs text-slate-300">Contact our Tiruppur sales coordinators directly on WhatsApp for instant assistance.</p>
        <button
          onClick={() => openWhatsApp(null, 500)}
          className="btn btn-whatsapp btn-md inline-flex"
        >
          <MessageSquare size={16} />
          <span>Ask Sales Coordinator on WhatsApp</span>
        </button>
      </div>
    </div>
  );
}
