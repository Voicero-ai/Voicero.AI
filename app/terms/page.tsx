"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function TermsOfService() {
  return (
    <div className="bg-gradient-to-b from-white via-brand-lavender-light/10 to-white py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-brand-dark mb-8">Terms of Service</h1>
          <div className="prose prose-lg max-w-none text-brand-dark/70">
            <p className="mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-brand-dark mb-4">1. Agreement to Terms</h2>
              <p>By accessing or using the Voicero.AI Shopify application ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you do not have permission to access the Service.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-brand-dark mb-4">2. Use License</h2>
              <p>Permission is granted to temporarily access and use the Service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>modify or copy the materials;</li>
                <li>use the materials for any commercial purpose;</li>
                <li>attempt to decompile or reverse engineer any software contained in the Service;</li>
                <li>remove any copyright or other proprietary notations from the materials;</li>
                <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-brand-dark mb-4">3. Disclaimer</h2>
              <p>The materials within the Service are provided on an 'as is' basis. Voicero.AI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-brand-dark mb-4">4. Limitations</h2>
              <p>In no event shall Voicero.AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the Service, even if Voicero.AI or a Voicero.AI authorized representative has been notified orally or in writing of the possibility of such damage.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-brand-dark mb-4">5. Accuracy of Materials</h2>
              <p>The materials appearing in the Service could include technical, typographical, or photographic errors. Voicero.AI does not warrant that any of the materials on the Service are accurate, complete, or current. Voicero.AI may make changes to the materials contained in the Service at any time without notice.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-brand-dark mb-4">6. Links</h2>
              <p>Voicero.AI has not reviewed all of the sites linked to its Service and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Voicero.AI of the site. Use of any such linked website is at the user's own risk.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-brand-dark mb-4">7. Modifications</h2>
              <p>Voicero.AI may revise these Terms of Service for its Service at any time without notice. By using this Service you are agreeing to be bound by the then current version of these Terms of Service.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-brand-dark mb-4">8. Governing Law</h2>
              <p>These terms and conditions are governed by and construed in accordance with the laws of the United States and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-brand-dark mb-4">9. Contact Information</h2>
              <p>If you have any questions about these Terms of Service, please contact us at:</p>
              <ul className="list-none mt-4">
                <li>Email: support@voicero.ai</li>
                <li>Website: https://voicero.ai</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 