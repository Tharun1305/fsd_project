export function downloadDigitalCatalogue(products = []) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>G V Clothings - Official Digital Product Catalogue</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 20px; color: #1e293b; background: #fff; }
        .header { text-align: center; border-bottom: 3px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; }
        .header h1 { font-size: 26px; color: #0f172a; margin: 0 0 5px 0; }
        .header p { margin: 0; color: #475569; font-size: 14px; }
        .contact-bar { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; text-align: center; font-size: 13px; margin-bottom: 25px; }
        .catalog-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .catalog-item { border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; page-break-inside: avoid; display: flex; gap: 15px; }
        .catalog-img { width: 120px; height: 140px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0; }
        .catalog-info { flex: 1; }
        .item-code { display: inline-block; background: #0f172a; color: #fff; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 4px; margin-bottom: 6px; }
        .item-title { font-size: 16px; font-weight: bold; margin: 0 0 6px 0; color: #0f172a; }
        .item-spec { font-size: 12px; color: #475569; margin-bottom: 4px; }
        .item-price { font-size: 14px; font-weight: bold; color: #2563eb; margin-top: 8px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">
          🖨️ Print / Save as PDF Catalogue
        </button>
      </div>

      <div class="header">
        <h1>TIRUPUR TEXCRAFT B2B FABRIC CATALOGUE</h1>
        <p>Manufacturer & Bulk Wholesale Exporter | Tiruppur, Tamil Nadu</p>
      </div>

      <div class="contact-bar">
        📍 Factory Showroom: 34, 4th Cross St, T N K Nagar, Tiruppur, TN 641602 | 📞 Sales: +91 73390 22308 | ✉️ sales@tirupurtexcraft.com
      </div>

      <div class="catalog-grid">
        ${products.map(p => `
          <div class="catalog-item">
            <img src="${p.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'}" class="catalog-img" alt="${p.product_name}" />
            <div class="catalog-info">
              <span class="item-code">${p.product_code || 'TPG-100'}</span>
              <div class="item-title">${p.product_name}</div>
              <div class="item-spec"><strong>Fabric:</strong> ${p.fabric}</div>
              <div class="item-spec"><strong>GSM:</strong> ${p.gsm || '180 GSM'}</div>
              <div class="item-spec"><strong>Sizes:</strong> ${(p.sizes || []).join(', ')}</div>
              <div class="item-spec"><strong>MOQ:</strong> ${p.moq || 100} Pcs</div>
              <div class="item-price">Approx Price: ${p.price}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="footer">
        <p>© 2026 G V Clothings. All Rights Reserved. Prices subject to raw cotton yarn market updates.</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
