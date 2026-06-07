import { jsPDF } from 'jspdf';

export const generateMarketingPDF = (material: any): Blob => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(231, 28, 94);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('National Removals & Storage', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.text(material.title || 'Marketing Material', pageWidth / 2, 32, { align: 'center' });

  doc.setTextColor(41, 49, 50);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(material.title || 'Document Title', 20, 60);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  if (material.description) {
    const splitDesc = doc.splitTextToSize(material.description, pageWidth - 40);
    doc.text(splitDesc, 20, 75);
  }

  let yPos = material.description ? 75 + (doc.splitTextToSize(material.description, pageWidth - 40).length * 6) + 15 : 90;

  const content = getContentByCategory(material.category, material.title);

  content.sections.forEach((section: any) => {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    section.items.forEach((item: string) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }
      const lines = doc.splitTextToSize(`• ${item}`, pageWidth - 45);
      doc.text(lines, 25, yPos);
      yPos += lines.length * 5 + 3;
    });

    yPos += 5;
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} | National Removals & Storage | www.nationalremovals.co.uk`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
};

const getContentByCategory = (category: string, title: string) => {
  const contentMap: any = {
    'brochures': {
      sections: [
        {
          title: 'Our Services',
          items: [
            'Residential Removals - Professional house moving services across the UK',
            'Commercial Removals - Office relocations with minimal business disruption',
            'European Moves - Seamless international removals across Europe',
            'Secure Storage - Temperature-controlled storage facilities',
            'Packing Services - Professional packing materials and expert packers'
          ]
        },
        {
          title: 'Why Choose Us',
          items: [
            'Over 25 years of experience in the removals industry',
            'Fully insured and licensed for your peace of mind',
            'Professional, trained staff with excellent customer service',
            'Modern fleet of well-maintained vehicles',
            'Competitive pricing with no hidden costs',
            'Free, no-obligation quotes available'
          ]
        },
        {
          title: 'Customer Benefits',
          items: [
            'Blue Light Card discount available',
            'Mid-week move discounts',
            'Free storage options on selected services',
            'Flexible booking and scheduling',
            'Comprehensive insurance coverage',
            'Environmentally friendly practices'
          ]
        },
        {
          title: 'Contact Information',
          items: [
            'Phone: 0121 429 9690',
            'Mobile: 07734 806290',
            'Email: info@nationalremovals.co.uk',
            'Website: www.nationalremovals.co.uk',
            'Available 7 days a week for your convenience'
          ]
        }
      ]
    },
    'flyers': {
      sections: [
        {
          title: title.includes('House') ? 'House Removals Service' : title.includes('European') ? 'European Moves' : 'Our Services',
          items: title.includes('House') ? [
            'Full house removals service from start to finish',
            'Careful handling of all furniture and belongings',
            'Professional packing service available',
            'Dismantling and reassembly of furniture',
            'Secure transit with comprehensive insurance',
            'Same-day or scheduled moves available'
          ] : title.includes('European') ? [
            'Door-to-door service across Europe',
            'Customs documentation handled',
            'Regular routes to major European cities',
            'Competitive international pricing',
            'Secure tracking throughout journey',
            'Professional multilingual team'
          ] : [
            'Professional removal services',
            'Packing and unpacking assistance',
            'Secure storage solutions',
            'Local and long-distance moves'
          ]
        },
        {
          title: 'Special Offers',
          items: [
            '10% discount for Blue Light Card holders',
            '15% off mid-week bookings (Mon-Thu)',
            'Free boxes with full packing service',
            'First month free storage on selected packages'
          ]
        },
        {
          title: 'Get Your Free Quote',
          items: [
            'Call us: 0121 429 9690 / 07734 806290',
            'Email: info@nationalremovals.co.uk',
            'Visit: www.nationalremovals.co.uk',
            'Quick response within 24 hours',
            'No-obligation quotations'
          ]
        }
      ]
    },
    'digital': {
      sections: [
        {
          title: title.includes('Logo') ? 'Logo Usage Guidelines' : 'Digital Resources',
          items: title.includes('Logo') ? [
            'Use provided logos without modification',
            'Maintain minimum clear space around logo',
            'Available formats: PNG (web), SVG (print), EPS (professional)',
            'Primary logo for light backgrounds',
            'White version for dark backgrounds',
            'Do not stretch, rotate, or alter colors'
          ] : [
            'High-quality digital assets included',
            'Suitable for web and social media use',
            'Editable templates where applicable',
            'Follow brand guidelines when using',
            'Attribution to National Removals & Storage required'
          ]
        },
        {
          title: 'Brand Colors',
          items: [
            'Primary Red: #C73532 (RGB: 231, 28, 94)',
            'Dark Grey: #293132 (RGB: 41, 49, 50)',
            'Light Grey: #949494 (RGB: 148, 148, 148)',
            'White: #FFFFFF for backgrounds'
          ]
        }
      ]
    },
    'templates': {
      sections: [
        {
          title: 'Template Instructions',
          items: [
            'Download and open in your preferred editor',
            'Replace placeholder text with your information',
            'Keep the National Removals & Storage branding',
            'Customize colors within brand guidelines',
            'Test across different devices/platforms before publishing'
          ]
        },
        {
          title: title.includes('Social') ? 'Social Media Best Practices' : 'Email Signature Setup',
          items: title.includes('Social') ? [
            'Post regularly (3-5 times per week recommended)',
            'Use high-quality images of successful moves',
            'Include customer testimonials and reviews',
            'Add relevant hashtags: #removals #moving #storage',
            'Tag National Removals & Storage in partnership posts',
            'Engage with comments and messages promptly'
          ] : [
            'Copy HTML code into your email client settings',
            'Update phone and email with your contact details',
            'Test email signature across different email clients',
            'Ensure images display correctly',
            'Keep signature mobile-friendly'
          ]
        }
      ]
    },
    'posters': {
      sections: [
        {
          title: 'Display Guidelines',
          items: [
            'Print on high-quality paper or card (200gsm minimum)',
            'Display in high-traffic areas for maximum visibility',
            'Ensure good lighting on the poster',
            'Keep poster clean and well-maintained',
            'Replace when worn or outdated'
          ]
        },
        {
          title: 'Key Messages',
          items: [
            'Professional Removals & Storage Services',
            'Covering All UK and European Destinations',
            'Competitive Prices - Free Quotes',
            'Fully Insured for Your Peace of Mind',
            'Blue Light Card Discounts Available'
          ]
        },
        {
          title: 'Contact Details',
          items: [
            '0121 429 9690',
            '07734 806290',
            'www.nationalremovals.co.uk',
            'Available 7 days a week'
          ]
        }
      ]
    }
  };

  return contentMap[category] || contentMap['brochures'];
};

export const generateZipDownload = (material: any) => {
  const filename = material.title.toLowerCase().replace(/\s+/g, '-') + '.txt';
  const content = `
${material.title}
${'='.repeat(material.title.length)}

${material.description || ''}

This is a placeholder for: ${material.title}

For the actual files, please contact your account manager or download individual components.

Included in this package:
- High-resolution logos in multiple formats
- Brand guidelines document
- Color palette specifications
- Usage examples and templates

Contact Information:
Phone: 0121 429 9690 / 07734 806290
Email: info@nationalremovals.co.uk
Website: www.nationalremovals.co.uk

National Removals & Storage
Professional Moving Services Since 1998
`;

  const blob = new Blob([content], { type: 'text/plain' });
  return blob;
};

export const generateHTMLDownload = (material: any) => {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${material.title} - National Removals & Storage</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .signature {
            max-width: 600px;
            background: white;
            padding: 20px;
            border-left: 4px solid #C73532;
        }
        .logo {
            color: #C73532;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .name {
            font-size: 16px;
            font-weight: bold;
            color: #293132;
            margin-bottom: 5px;
        }
        .position {
            font-size: 14px;
            color: #949494;
            margin-bottom: 15px;
        }
        .contact {
            font-size: 12px;
            color: #293132;
            line-height: 1.6;
        }
        .contact a {
            color: #C73532;
            text-decoration: none;
        }
        .contact a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="signature">
        <div class="logo">National Removals & Storage</div>
        <div class="name">[Your Name]</div>
        <div class="position">[Your Position] | Partner</div>
        <div class="contact">
            📞 <a href="tel:01214299690">0121 429 9690</a><br>
            📱 <a href="tel:07734806290">07734 806290</a><br>
            ✉️ <a href="mailto:info@nationalremovals.co.uk">info@nationalremovals.co.uk</a><br>
            🌐 <a href="https://www.nationalremovals.co.uk">www.nationalremovals.co.uk</a>
        </div>
    </div>

    <div style="max-width: 600px; margin-top: 20px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107;">
        <strong>How to use:</strong>
        <ol style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px;">
            <li>Copy the HTML from the signature div above</li>
            <li>Replace [Your Name] and [Your Position] with your details</li>
            <li>Paste into your email client's signature settings</li>
            <li>Adjust styling as needed for your email provider</li>
        </ol>
    </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  return blob;
};
