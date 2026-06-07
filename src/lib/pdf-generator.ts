import { Quotation } from '../hooks/useQuotations';

export const pdfGenerator = {
  generateQuotationPDF(quotation: Quotation): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the PDF');
      return;
    }

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP'
      }).format(amount);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Quotation ${quotation.quotation_number}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              border-bottom: 3px solid #6b6b6b;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .company-info {
              flex: 1;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #6b6b6b;
              margin-bottom: 10px;
            }
            .company-details {
              font-size: 12px;
              color: #666;
            }
            .quotation-badge {
              background: #6b6b6b;
              color: white;
              padding: 10px 20px;
              border-radius: 5px;
              text-align: right;
            }
            .quotation-number {
              font-size: 18px;
              font-weight: bold;
            }
            .quotation-date {
              font-size: 12px;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #6b6b6b;
              margin-bottom: 15px;
              padding-bottom: 5px;
              border-bottom: 2px solid #e0e0e0;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .info-label {
              font-size: 11px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 3px;
            }
            .info-value {
              font-size: 14px;
              font-weight: 500;
            }
            .pricing-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .pricing-table td {
              padding: 12px;
              border-bottom: 1px solid #e0e0e0;
            }
            .pricing-table td:first-child {
              color: #666;
            }
            .pricing-table td:last-child {
              text-align: right;
              font-weight: 500;
            }
            .total-row {
              background: #f5f5f5;
              font-weight: bold;
              font-size: 18px;
              border-top: 2px solid #6b6b6b;
            }
            .notes-box {
              background: #fff9e6;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin-top: 20px;
            }
            .validity-box {
              background: #e8f5e9;
              border-left: 4px solid #4caf50;
              padding: 15px;
              margin-top: 20px;
            }
            .move-date-box {
              background: #e3f2fd;
              border-left: 4px solid #2196f3;
              padding: 15px;
              margin-top: 20px;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #e0e0e0;
              font-size: 11px;
              color: #666;
              text-align: center;
            }
            @media print {
              body {
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              background: #6b6b6b;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
              font-weight: bold;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            .print-button:hover {
              background: #555;
            }
          </style>
        </head>
        <body>
          <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>

          <div class="header">
            <div class="company-info">
              <div class="company-name">National Removals and Storage</div>
              <div class="company-details">
                Willenhall, Wolverhampton<br>
                WV13 3YA, United Kingdom<br>
                Phone: 0800 047 2607<br>
                Email: info@nationalremovals.co.uk<br>
                Web: nationalremovalsandstorage.co.uk
              </div>
            </div>
            <div class="quotation-badge">
              <div class="quotation-number">${quotation.quotation_number}</div>
              <div class="quotation-date">Date: ${formatDate(quotation.created_at)}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Moving Details</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">From Location</div>
                <div class="info-value">${quotation.move_from}</div>
              </div>
              <div class="info-item">
                <div class="info-label">To Location</div>
                <div class="info-value">${quotation.move_to}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Service Type</div>
                <div class="info-value">${quotation.service_type}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Customer Email</div>
                <div class="info-value">${quotation.customer_email}</div>
              </div>
            </div>

            ${quotation.move_date ? `
              <div class="move-date-box">
                <strong>Move Date:</strong> ${formatDate(quotation.move_date)}
              </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">Pricing Breakdown</div>
            <table class="pricing-table">
              <tbody>
                <tr>
                  <td>Base Service</td>
                  <td>${formatCurrency(quotation.base_amount)}</td>
                </tr>
                ${quotation.additional_services_amount > 0 ? `
                <tr>
                  <td>Additional Services</td>
                  <td>${formatCurrency(quotation.additional_services_amount)}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                  <td>Total Amount</td>
                  <td>${formatCurrency(quotation.total_amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          ${quotation.notes ? `
            <div class="section">
              <div class="section-title">Notes</div>
              <div class="notes-box">
                ${quotation.notes}
              </div>
            </div>
          ` : ''}

          <div class="section">
            <div class="validity-box">
              <strong>Valid Until:</strong> ${formatDate(quotation.valid_until)}<br>
              <small>This quotation is valid until the date shown above. Please contact us to confirm your booking.</small>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Terms & Conditions</div>
            <p style="font-size: 12px; line-height: 1.8;">
              This quotation is subject to our standard terms and conditions. Payment terms: 50% deposit required to confirm booking,
              remaining balance due on completion. Prices include VAT where applicable. We reserve the right to adjust the final price
              if the actual volume or complexity differs significantly from the quotation. Cancellation policy applies as per our terms.
              All items should be packed and ready for collection unless packing services have been arranged. We recommend appropriate
              insurance coverage for your belongings during transit.
            </p>
          </div>

          <div class="footer">
            <p>
              <strong>National Removals and Storage</strong><br>
              Company Registration No: [Registration Number] | VAT No: [VAT Number]<br>
              All moves are subject to our terms and conditions available at nationalremovalsandstorage.co.uk/terms
            </p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
    };
  },

  downloadTermsAndConditions(): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the PDF');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Terms & Conditions - National Removals and Storage</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.8;
              color: #333;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              border-bottom: 3px solid #6b6b6b;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .company-name {
              font-size: 28px;
              font-weight: bold;
              color: #6b6b6b;
              margin-bottom: 5px;
            }
            .document-title {
              font-size: 18px;
              color: #666;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #6b6b6b;
              margin-bottom: 15px;
              margin-top: 30px;
            }
            .subsection-title {
              font-size: 14px;
              font-weight: bold;
              color: #333;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            p {
              margin-bottom: 15px;
              font-size: 13px;
            }
            ul, ol {
              margin-left: 25px;
              margin-bottom: 15px;
              font-size: 13px;
            }
            li {
              margin-bottom: 8px;
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              background: #6b6b6b;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
              font-weight: bold;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            .print-button:hover {
              background: #555;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>

          <div class="header">
            <div class="company-name">National Removals and Storage</div>
            <div class="document-title">Terms & Conditions of Service</div>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">Effective Date: October 2024</p>
          </div>

          <div class="section">
            <h2 class="section-title">1. General Terms</h2>
            <p>
              These Terms and Conditions govern the provision of removal and storage services by National Removals and Storage
              ("we", "us", "our") to our customers ("you", "your"). By accepting our quotation or using our services, you agree
              to be bound by these terms.
            </p>
          </div>

          <div class="section">
            <h2 class="section-title">2. Quotations</h2>
            <p>
              All quotations are valid for 30 days from the date of issue unless otherwise stated. Quotations are based on the
              information provided by you and may be subject to adjustment if the actual circumstances differ.
            </p>
            <ul>
              <li>Quotations are not binding until confirmed by both parties</li>
              <li>Prices include VAT where applicable</li>
              <li>Additional charges may apply for unforeseen circumstances</li>
              <li>Volume-based quotations may be adjusted based on actual volume</li>
            </ul>
          </div>

          <div class="section">
            <h2 class="section-title">3. Payment Terms</h2>
            <p>Unless otherwise agreed in writing:</p>
            <ul>
              <li>A deposit of 50% is required to confirm your booking</li>
              <li>The remaining balance is due on completion of the move</li>
              <li>We accept payment by bank transfer, credit/debit card, or cash</li>
              <li>Late payments may incur additional charges</li>
              <li>Goods may be retained until payment is received in full</li>
            </ul>
          </div>

          <div class="section">
            <h2 class="section-title">4. Cancellation Policy</h2>
            <p>Cancellations must be made in writing. Cancellation charges apply as follows:</p>
            <ul>
              <li>More than 14 days before move date: Full refund of deposit</li>
              <li>7-14 days before move date: 50% of deposit retained</li>
              <li>Less than 7 days before move date: Full deposit retained</li>
              <li>Failure to be ready on moving day: Full charge applies</li>
            </ul>
          </div>

          <div class="section">
            <h2 class="section-title">5. Customer Responsibilities</h2>
            <p>You are responsible for:</p>
            <ul>
              <li>Providing accurate and complete information about the move</li>
              <li>Ensuring all items are packed and ready unless packing services have been arranged</li>
              <li>Obtaining necessary parking permits or permissions</li>
              <li>Ensuring safe access to both properties</li>
              <li>Removing or securing items you do not wish to be moved</li>
              <li>Informing us of any fragile, valuable, or hazardous items</li>
            </ul>
          </div>

          <div class="section">
            <h2 class="section-title">6. Our Responsibilities</h2>
            <p>We will:</p>
            <ul>
              <li>Handle your belongings with reasonable care</li>
              <li>Provide experienced and trained staff</li>
              <li>Maintain appropriate insurance coverage</li>
              <li>Arrive at the agreed time (traffic and weather permitting)</li>
              <li>Complete the move in a professional manner</li>
            </ul>
          </div>

          <div class="section">
            <h2 class="section-title">7. Insurance and Liability</h2>
            <p>
              We maintain goods-in-transit insurance for your protection. However, we recommend you maintain your own insurance
              for high-value items. Our liability is limited to:
            </p>
            <ul>
              <li>£50,000 per consignment for standard moves</li>
              <li>Higher limits available on request for additional premium</li>
              <li>Exclusions apply for items not properly packed</li>
              <li>Claims must be notified within 7 days of delivery</li>
            </ul>
          </div>

          <div class="section">
            <h2 class="section-title">8. Items We Cannot Move</h2>
            <p>We cannot accept:</p>
            <ul>
              <li>Hazardous materials, explosives, or flammable items</li>
              <li>Perishable foods or plants</li>
              <li>Items of exceptional value unless specifically arranged</li>
              <li>Illegal or stolen goods</li>
              <li>Live animals or pets</li>
            </ul>
          </div>

          <div class="section">
            <h2 class="section-title">9. Storage</h2>
            <p>If storage services are included:</p>
            <ul>
              <li>Items are stored in secure, climate-controlled facilities</li>
              <li>Minimum storage period: 1 week</li>
              <li>Notice period for retrieval: 48 hours</li>
              <li>Storage charges are payable monthly in advance</li>
              <li>Access to stored items by appointment only</li>
            </ul>
          </div>

          <div class="section">
            <h2 class="section-title">10. Delays and Force Majeure</h2>
            <p>
              We are not liable for delays caused by circumstances beyond our reasonable control, including but not limited to
              severe weather, traffic conditions, vehicle breakdown, or industrial action.
            </p>
          </div>

          <div class="section">
            <h2 class="section-title">11. Complaints Procedure</h2>
            <p>
              If you have any concerns about our service, please contact us immediately at complaints@nationalremovals.co.uk.
              We aim to resolve all complaints within 14 working days.
            </p>
          </div>

          <div class="section">
            <h2 class="section-title">12. Data Protection</h2>
            <p>
              We process your personal data in accordance with UK GDPR and our Privacy Policy. Your data is used solely for the
              purpose of providing our services and will not be shared with third parties without your consent.
            </p>
          </div>

          <div class="section">
            <h2 class="section-title">13. Governing Law</h2>
            <p>
              These terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction
              of the courts of England and Wales.
            </p>
          </div>

          <div class="section" style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
            <p style="font-size: 11px; text-align: center; color: #666;">
              <strong>National Removals and Storage</strong><br>
              Willenhall, Wolverhampton, WV13 3YA<br>
              Phone: 0800 047 2607 | Email: info@nationalremovals.co.uk<br>
              Web: nationalremovalsandstorage.co.uk
            </p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
    };
  }
};
