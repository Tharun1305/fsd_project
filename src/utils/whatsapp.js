export const COMPANY_WHATSAPP_NUMBER = "917339022308"; // G V Clothings sales desk

export function generateWhatsAppLink(product = null, customQty = 500, messageType = 'product') {
  let message = "";

  if (product) {
    const code = product.product_code || product.code || '';
    const name = product.product_name || product.name || 'Fabric Item';
    const moq = product.moq || 100;
    
    if (messageType === 'sample') {
      message = `Hello, I am interested in ordering a fabric sample/swatch for Product: ${name} (${code}). Please share the sample courier process and charges. My requirement is approx ${customQty} pieces.`;
    } else {
      message = `Hello, I am interested in Product ${name} (Code: ${code}). Please share the latest wholesale price tier and availability for Tiruppur dispatch. I require approximately ${customQty || moq} pieces.`;
    }
  } else {
    message = `Hello, I am looking for bulk fabric supply from Tiruppur. Please share your digital catalogue and wholesale pricing details.`;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${COMPANY_WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

export function openWhatsApp(product = null, customQty = 500, messageType = 'product') {
  const url = generateWhatsAppLink(product, customQty, messageType);
  window.open(url, '_blank');
}
