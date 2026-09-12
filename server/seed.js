import { db, writeData } from './db.js';

export function initializeSeedData() {
  console.log('Seeding initial Tiruppur B2B Fabrics data...');

  const categories = [
    { category_id: '1', category_name: 'Fine Printed', icon: 'Shirt', description: 'Premium fine printed cotton fabrics with vibrant designs & lasting colour fastness.' },
    { category_id: '2', category_name: 'Plain / Normal', icon: 'Layers', description: 'Solid colour plain & normal knit fabrics for everyday garment manufacturing.' },
    { category_id: '3', category_name: 'Loop Knit', icon: 'Shirt', description: 'Soft loop knit cotton fabrics ideal for sweatshirts, hoodies & winter wear.' },
    { category_id: '4', category_name: 'Interlock', icon: 'Layers', description: 'Double-knit interlock fabrics with smooth finish on both sides for premium garments.' },
    { category_id: '5', category_name: 'Terry', icon: 'Shirt', description: 'French terry & terry cotton fabrics for towels, bathrobes & loungewear.' },
    { category_id: '6', category_name: 'Thread', icon: 'Layers', description: 'High-quality stitching & embroidery threads in a wide range of colours.' },
    { category_id: '7', category_name: 'Yarn', icon: 'Layers', description: 'Combed & carded cotton yarn in various counts for knitting & weaving.' },
    { category_id: '8', category_name: 'Bio-Wash', icon: 'Sparkles', description: 'Enzyme bio-washed fabrics with ultra-soft feel, zero lint & premium finish.' }
  ];

  writeData('categories.json', categories);

  const products = [
    {
      product_id: '101',
      product_name: 'Premium Fine Printed Combed Cotton Fabric',
      product_code: 'GVF-101',
      category_id: '1',
      description: 'High-quality fine printed combed cotton fabric with vibrant reactive dye prints. Excellent colour fastness, zero shrinkage, and soft hand feel. Ideal for T-shirts, kidswear, and casual garments in bulk.',
      fabric: '100% Combed Cotton - Fine Printed',
      gsm: '180 GSM',
      price: '₹320 - ₹380 / Kg',
      moq: 200,
      availability: 'Available',
      images: [
        'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&auto=format&fit=crop'
      ],
      sizes: ['36 inch', '42 inch', '48 inch', '54 inch', '60 inch'],
      colours: ['Multi-Print Assorted', 'Floral Patterns', 'Geometric Designs', 'Abstract Prints', 'Stripe Patterns'],
      tags: ['Reactive Print', 'Colour Fast', 'Pre-Shrunk'],
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
      product_id: '102',
      product_name: 'Plain / Normal Single Jersey Cotton Fabric',
      product_code: 'GVF-102',
      category_id: '2',
      description: 'Solid colour plain single jersey knit fabric made from 100% combed cotton. Smooth surface, consistent dyeing, and uniform weight. Suitable for round neck tees, innerwear, and basic garments.',
      fabric: '100% Combed Cotton - Single Jersey',
      gsm: '160 GSM',
      price: '₹260 - ₹300 / Kg',
      moq: 300,
      availability: 'Available',
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop'
      ],
      sizes: ['36 inch', '42 inch', '48 inch', '54 inch', '72 inch Open Width'],
      colours: ['White', 'Black', 'Navy Blue', 'Melange Grey', 'Olive Green', 'Maroon', 'Royal Blue'],
      tags: ['Single Jersey', 'Solid Dye', 'Tubular & Open Width'],
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    },
    {
      product_id: '103',
      product_name: 'Loop Knit Fleece Cotton Blend Fabric',
      product_code: 'GVF-103',
      category_id: '3',
      description: 'Premium loop knit fleece fabric with soft looped inner pile. Made from cotton-polyester blend for warmth and durability. Perfect for hoodies, sweatshirts, joggers, and winter casual wear production.',
      fabric: '80% Cotton 20% Polyester - Loop Knit',
      gsm: '280 GSM',
      price: '₹380 - ₹440 / Kg',
      moq: 150,
      availability: 'Available',
      images: [
        'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop'
      ],
      sizes: ['48 inch', '54 inch', '60 inch Open Width'],
      colours: ['Charcoal Grey', 'Navy Blue', 'Maroon', 'Forest Green', 'Black', 'Dusty Rose'],
      tags: ['Loop Back', 'Fleece', 'Winterwear Fabric'],
      created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
    },
    {
      product_id: '104',
      product_name: 'Double Knit Interlock Cotton Fabric',
      product_code: 'GVF-104',
      category_id: '4',
      description: 'Smooth double-knit interlock fabric with identical finish on both sides. Excellent dimensional stability and zero curling edges. Used for polo shirts, baby wear, premium T-shirts, and sportswear.',
      fabric: '100% Combed Cotton - Interlock',
      gsm: '220 GSM',
      price: '₹340 - ₹400 / Kg',
      moq: 200,
      availability: 'Available',
      images: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&auto=format&fit=crop'
      ],
      sizes: ['48 inch', '54 inch', '60 inch', '72 inch Open Width'],
      colours: ['White', 'Baby Pink', 'Sky Blue', 'Mint Green', 'Lemon Yellow', 'Peach'],
      tags: ['Interlock', 'Double Knit', 'Zero Curl'],
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
    },
    {
      product_id: '105',
      product_name: 'French Terry Cotton Fabric',
      product_code: 'GVF-105',
      category_id: '5',
      description: 'Premium French terry fabric with soft looped pile on the inside and smooth outer surface. Ideal for oversized tees, sweatshirts, track pants, and athleisure garments. Excellent moisture absorption.',
      fabric: '100% Super Combed Cotton - French Terry',
      gsm: '240 GSM',
      price: '₹360 - ₹420 / Kg',
      moq: 150,
      availability: 'Available',
      images: [
        'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop'
      ],
      sizes: ['48 inch', '54 inch', '60 inch Open Width'],
      colours: ['Acid Wash Black', 'Off-White', 'Dusty Lavender', 'Sage Green', 'Heather Grey'],
      tags: ['French Terry', 'Looped Pile', 'Athleisure Fabric'],
      created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
    },
    {
      product_id: '106',
      product_name: 'Premium Spun Polyester Sewing Thread',
      product_code: 'GVF-106',
      category_id: '6',
      description: 'High-tenacity spun polyester sewing thread suitable for all garment stitching, overlocking, and flatlock operations. Superior tensile strength, consistent twist, and smooth seam performance.',
      fabric: '100% Spun Polyester Thread',
      gsm: '40/2 Count',
      price: '₹85 - ₹120 / Cone',
      moq: 500,
      availability: 'Available',
      images: [
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&auto=format&fit=crop'
      ],
      sizes: ['40/2 Count', '50/2 Count', '60/3 Count', '20/2 Count'],
      colours: ['White', 'Black', 'Navy', 'Red', 'Grey', 'Full Shade Card Available'],
      tags: ['High Tenacity', 'Spun Polyester', '5000m Cones'],
      created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString()
    },
    {
      product_id: '107',
      product_name: 'Compact Combed Cotton Yarn (30s / 40s Count)',
      product_code: 'GVF-107',
      category_id: '7',
      description: 'Premium compact combed cotton yarn in 30s and 40s single count for knitting mills and weaving units. Excellent evenness, low hairiness, and superior pilling resistance. Sourced from Tiruppur spinning mills.',
      fabric: '100% Compact Combed Cotton Yarn',
      gsm: '30s / 40s Single Count',
      price: '₹290 - ₹340 / Kg',
      moq: 500,
      availability: 'Limited',
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop'
      ],
      sizes: ['20s Count', '26s Count', '30s Count', '34s Count', '40s Count'],
      colours: ['Greige (Raw)', 'Optical White', 'Dyed on Request'],
      tags: ['Compact Combed', 'Low Hairiness', 'Tiruppur Spun'],
      created_at: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString()
    },
    {
      product_id: '108',
      product_name: 'Bio-Washed Enzyme Treated Cotton Fabric',
      product_code: 'GVF-108',
      category_id: '8',
      description: 'Premium enzyme bio-washed cotton fabric with ultra-soft hand feel, zero lint surface, and superior drape. Pre-shrunk and silicone softened for ready-to-cut garment production. Ideal for retail-grade T-shirts.',
      fabric: '100% Bio-Wash Combed Cotton',
      gsm: '180 GSM',
      price: '₹300 - ₹360 / Kg',
      moq: 200,
      availability: 'Available',
      images: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&auto=format&fit=crop'
      ],
      sizes: ['36 inch', '42 inch', '48 inch', '54 inch', '72 inch Open Width'],
      colours: ['Navy Blue', 'Jet Black', 'White', 'Melange Grey', 'Olive Green', 'Maroon'],
      tags: ['Bio-Wash', 'Zero Lint', 'Silicone Softened'],
      created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString()
    }
  ];

  writeData('products.json', products);

  const enquiries = [
    {
      enquiry_id: 'ENQ-90124',
      customer_name: 'K. Rajesh Kumar',
      company_name: 'Rajesh Textiles & Wholesalers',
      mobile: '+91 98421 88320',
      email: 'rajesh.textiles.kl@gmail.com',
      location: 'Ernakulam / Kochi, Kerala',
      buyer_type: 'Wholesaler',
      product_id: '101',
      product_name: 'Premium Fine Printed Combed Cotton Fabric (GVF-101)',
      quantity: 500,
      size: 'Assorted (42 inch, 48 inch, 54 inch)',
      colour: 'Floral Patterns (200 Kg), Geometric Designs (200 Kg), Stripe Patterns (100 Kg)',
      sample_required: true,
      message: 'Planning to visit your Tiruppur unit next Tuesday. Please keep fabric swatch samples ready and confirm best rate for 500 Kg.',
      status: 'New',
      created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
    },
    {
      enquiry_id: 'ENQ-90119',
      customer_name: 'Suresh V. Menon',
      company_name: 'Menon Fabric House',
      mobile: '+91 94470 12345',
      email: 'sureshmenon@gmail.com',
      location: 'Kozhikode, Kerala',
      buyer_type: 'Retailer',
      product_id: '102',
      product_name: 'Plain / Normal Single Jersey Cotton Fabric (GVF-102)',
      quantity: 200,
      size: '48 inch, 54 inch',
      colour: 'Navy Blue & Maroon',
      sample_required: false,
      message: 'Need urgent dispatch to Calicut before Onam festival stock rush. Please share transport details from Tirupur.',
      status: 'Contacted',
      created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString()
    },
    {
      enquiry_id: 'ENQ-90105',
      customer_name: 'Anand Rao',
      company_name: 'Vanguard Apparel Brands',
      mobile: '+91 98860 77412',
      email: 'anand@vanguardapparel.in',
      location: 'Commercial Street, Bangalore, Karnataka',
      buyer_type: 'Fabric Manufacturer',
      product_id: '105',
      product_name: 'French Terry Cotton Fabric (GVF-105)',
      quantity: 1000,
      size: '60 inch Open Width',
      colour: 'Acid Wash Black & Off-White',
      sample_required: true,
      message: 'Looking for consistent monthly supply of French Terry fabric from Tiruppur unit. Require 1000 Kg monthly for our garment production.',
      status: 'Completed',
      created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString()
    }
  ];

  writeData('enquiries.json', enquiries);

  const sampleRequests = [
    {
      sample_id: 'SMP-4401',
      customer_name: 'P. Murugan',
      company_name: 'Murugan Textile Traders',
      mobile: '+91 97890 11223',
      location: 'Madurai, Tamil Nadu',
      product_id: '101',
      product_name: 'Premium Fine Printed Combed Cotton Fabric (GVF-101)',
      requirement: 'Fabric swatch shade card & 1 metre sample cut piece',
      message: 'Kindly courier fabric sample to Madurai store address. Willing to pay courier charges.',
      status: 'New',
      created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
    }
  ];

  writeData('sample_requests.json', sampleRequests);

  const callbackRequests = [
    {
      callback_id: 'CB-1002',
      name: 'Venkatesh R.',
      company: 'Sri Balaji Textiles',
      mobile: '+91 99400 55667',
      requirement: 'Bulk Order of 1200 Kg Loop Knit & French Terry Fabric',
      preferred_time: 'Today between 4 PM - 6 PM',
      status: 'Pending',
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    }
  ];

  writeData('callback_requests.json', callbackRequests);

  const offers = [
    {
      offer_id: 'OFF-101',
      title: 'Festival Wholesale Fabric Bonanza',
      description: 'Flat ₹20 OFF per Kg on all Bio-Wash Cotton & Fine Printed fabric bulk orders exceeding 500 Kg.',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&auto=format&fit=crop',
      discount_text: 'Save Up To ₹10,000 On Bulk Fabric Orders',
      start_date: new Date().toISOString().split('T')[0],
      expiry_date: '2026-12-31',
      status: 'Active'
    },
    {
      offer_id: 'OFF-102',
      title: 'Free Fabric Swatch Kit for Kerala & Bangalore Buyers',
      description: 'Place a preliminary bulk fabric enquiry of 300+ Kg and receive a free fabric swatch shade card shipped directly to your shop.',
      image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop',
      discount_text: 'Free Fabric Swatch Kit Included',
      start_date: new Date().toISOString().split('T')[0],
      expiry_date: '2026-11-30',
      status: 'Active'
    }
  ];

  writeData('offers.json', offers);

  const announcements = [
    {
      announcement_id: 'ANN-201',
      title: 'New 240 GSM French Terry & Loop Knit Fabric Range Introduced',
      description: 'We have upgraded our knitting machines in Tiruppur factory to produce premium 240 GSM French Terry and Loop Knit fabrics. Book your bulk fabric order today.',
      badge: 'Factory Update',
      expiry_date: '2026-12-31',
      status: 'Active'
    },
    {
      announcement_id: 'ANN-202',
      title: 'Showroom Visit Timings for Outstation Fabric Buyers (Tamil Nadu / Kerala / Karnataka)',
      description: 'Our Kaderpet Tiruppur fabric showroom is open 7 days a week from 9:00 AM to 8:30 PM. Direct factory transport assistance available from Tiruppur Railway Station.',
      badge: 'Showroom Notice',
      expiry_date: '2026-12-31',
      status: 'Active'
    }
  ];

  writeData('announcements.json', announcements);

  console.log('Database seeded successfully!');
}
