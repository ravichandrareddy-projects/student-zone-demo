import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Admin
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@studentzone.com' },
    update: {
      passwordHash: adminPasswordHash,
    },
    create: {
      name: 'Shop Owner',
      email: 'admin@studentzone.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // 2. Seed Settings
  const defaultSettings = [
    { key: 'business_name', value: 'Student Zone Xerox & Binding Shop', group: 'business' },
    { key: 'tagline', value: 'Your Documents. Printed Before You Arrive.', group: 'business' },
    { key: 'location', value: 'Tenali, Andhra Pradesh', group: 'business' },
    { key: 'address', value: 'Main Road, Opposite VSR College, Tenali, Andhra Pradesh 522201', group: 'business' },
    { key: 'phone', value: '+91 98480 12345', group: 'business' },
    { key: 'whatsapp', value: '+91 98480 12345', group: 'business' },
    { key: 'email', value: 'contact@studentzonetenali.com', group: 'business' },
    { key: 'opening_hours', value: 'Mon - Sat: 8:00 AM - 9:30 PM | Sun: 9:00 AM - 2:00 PM', group: 'business' },
    { key: 'maps_url', value: 'https://maps.google.com/?q=Tenali+Andhra+Pradesh', group: 'business' },
    { key: 'order_prefix', value: 'SZ-2026', group: 'order' },
    { key: 'default_prep_time_minutes', value: '25', group: 'order' },
    { key: 'max_file_size_mb', value: '50', group: 'order' },
    { key: 'upi_id', value: 'studentzone@upi', group: 'payment' },
    { key: 'upi_name', value: 'Student Zone Tenali', group: 'payment' },
    { key: 'payment_instructions', value: 'Pay cash at shop pickup or scan UPI QR code.', group: 'payment' },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value, group: s.group },
      create: s,
    });
  }
  console.log('✅ Shop Settings seeded');

  // 3. Seed Pricing Rates
  const defaultPricing = [
    { key: 'bw_a4_single', label: 'B&W A4 (Single-sided)', category: 'Printing', rate: 2.0, unit: 'per page', description: 'Standard B&W printing on A4' },
    { key: 'bw_a4_double', label: 'B&W A4 (Double-sided)', category: 'Printing', rate: 1.5, unit: 'per side', description: 'B&W back-to-back print' },
    { key: 'color_a4_single', label: 'Color A4 (Single-sided)', category: 'Printing', rate: 10.0, unit: 'per page', description: 'Vibrant color print on A4' },
    { key: 'color_a4_double', label: 'Color A4 (Double-sided)', category: 'Printing', rate: 8.0, unit: 'per side', description: 'Color back-to-back print' },
    { key: 'bw_a3_single', label: 'B&W A3 (Single-sided)', category: 'Printing', rate: 5.0, unit: 'per page', description: 'Large format B&W' },
    { key: 'color_a3_single', label: 'Color A3 (Single-sided)', category: 'Printing', rate: 25.0, unit: 'per page', description: 'Large format Color' },
    { key: 'spiral_binding', label: 'Spiral Binding (Up to 100 pages)', category: 'Binding', rate: 35.0, unit: 'per item', description: 'Plastic coil spiral binding with clear cover' },
    { key: 'spiral_binding_heavy', label: 'Spiral Binding (100+ pages)', category: 'Binding', rate: 50.0, unit: 'per item', description: 'Heavy duty coil spiral binding' },
    { key: 'project_hard_binding', label: 'Project Hard Golden Embossed Binding', category: 'Binding', rate: 180.0, unit: 'per book', description: 'Official college/university project report binding' },
    { key: 'soft_cover_binding', label: 'Soft Cover Strip Binding', category: 'Binding', rate: 25.0, unit: 'per item', description: 'Clean report strip binding' },
    { key: 'paper_80gsm_extra', label: '80 GSM Premium Paper Surcharge', category: 'Paper', rate: 0.5, unit: 'per page', description: 'Thicker non-bleed paper' },
    { key: 'photo_print_4x6', label: 'Passport / 4x6 Photo Print', category: 'Cards', rate: 30.0, unit: 'per set', description: '8 Passport photos high glossy' },
  ];

  for (const p of defaultPricing) {
    await prisma.pricingRate.upsert({
      where: { key: p.key },
      update: p,
      create: p,
    });
  }
  console.log('✅ Pricing Engine seeded');

  // 4. Seed Services Catalog
  const defaultServices = [
    {
      name: 'B&W Xerox & Photocopy',
      category: 'Xerox & Photocopy',
      description: 'High-speed clear document photocopying for notes, textbooks & exam records.',
      startingPrice: '₹1.50 / page',
      icon: 'Copy',
      sortOrder: 1,
    },
    {
      name: 'Color Xerox & Printing',
      category: 'Xerox & Photocopy',
      description: 'Vibrant color document photocopying, certificates, diagrams and project pages.',
      startingPrice: '₹8.00 / page',
      icon: 'Printer',
      sortOrder: 2,
    },
    {
      name: 'Project Report Printing & Binding',
      category: 'Binding',
      description: 'Complete engineering, B.Tech, M.Tech, degree project report printing with hard golden embossing.',
      startingPrice: '₹180 / book',
      icon: 'BookOpen',
      sortOrder: 3,
    },
    {
      name: 'Spiral & Soft Binding',
      category: 'Binding',
      description: 'Durable plastic spiral coils with transparent front sheet & thick back board.',
      startingPrice: '₹35.00 / book',
      icon: 'FileText',
      sortOrder: 4,
    },
    {
      name: 'Visiting Cards & Business Cards',
      category: 'Cards',
      description: 'Single & double sided matte, glossy, textured cards for shops & professionals.',
      startingPrice: '₹250 / 100 cards',
      icon: 'CreditCard',
      sortOrder: 5,
    },
    {
      name: 'ID Card Printing & Lamination',
      category: 'Cards',
      description: 'PVC plastic ID cards, student identity badges, staff cards with lanyards.',
      startingPrice: '₹60.00 / card',
      icon: 'UserCheck',
      sortOrder: 6,
    },
    {
      name: 'Passport Photo Printing',
      category: 'Photo & Document Services',
      description: 'Instant 8 / 16 passport size photographs printed on glossy photo paper.',
      startingPrice: '₹30 / 8 photos',
      icon: 'Camera',
      sortOrder: 7,
    },
    {
      name: 'Resume & Assignment Printing',
      category: 'Student Services',
      description: 'High quality 80 GSM resume prints, cover letters, seminar slides & record sheets.',
      startingPrice: '₹2.00 / page',
      icon: 'FileSpreadsheet',
      sortOrder: 8,
    },
  ];

  await prisma.service.deleteMany({});
  for (const s of defaultServices) {
    await prisma.service.create({ data: s });
  }
  console.log('✅ Services Catalog seeded');

  // 5. Seed 12 Detailed Google Local Reviews
  const defaultReviews = [
    {
      customerName: 'Kiran Kumar',
      rating: 5,
      comment: 'Uploaded my 120-page B.Tech final year project report at 11 AM while sitting in college library. Got notification at 11:35 AM that it was ready with Golden Embossed binding. Collected in 2 minutes! Best service in Tenali!',
      isApproved: true,
      isFeatured: true,
      date: 'Google Review • 2 days ago',
    },
    {
      customerName: 'Sravani Pasupuleti',
      rating: 5,
      comment: 'Super fast color printing for my seminar presentation slides. The online ordering feature saved me from standing in a 20-minute line before class. Highly recommended for VSR college students!',
      isApproved: true,
      isFeatured: true,
      date: 'Google Review • 5 days ago',
    },
    {
      customerName: 'Ramesh Babu (Tenali Tiffins)',
      rating: 5,
      comment: 'Ordered 500 business cards and shop front flex banner. Quality design, thick cardstock, and super fast delivery. Student Zone team is very professional.',
      isApproved: true,
      isFeatured: true,
      date: 'Google Review • 1 week ago',
    },
    {
      customerName: 'Anusha Reddy',
      rating: 5,
      comment: 'Got my resume printed on 80 GSM paper for campus placements. The print quality was extremely crisp and dark. Tracking feature showed exact ready time.',
      isApproved: true,
      isFeatured: true,
      date: 'Google Review • 2 weeks ago',
    },
    {
      customerName: 'Venkat Rao M.',
      rating: 5,
      comment: 'Best Xerox shop near VSR College Tenali! Soft strip binding and spiral binding done within 15 minutes. Very polite staff and reasonable student rates.',
      isApproved: true,
      isFeatured: true,
      date: 'Google Review • 3 weeks ago',
    },
    {
      customerName: 'Divya Sri',
      rating: 5,
      comment: 'Got passport size photos printed in just 5 minutes! Glossy finish and clear quality. The WhatsApp status updates are very helpful.',
      isApproved: true,
      isFeatured: true,
      date: 'Google Review • 1 month ago',
    },
    {
      customerName: 'Mahesh Chander',
      rating: 5,
      comment: 'Bulk B&W photocopying for our entire batch notes (approx 400 pages). They gave us a fantastic student discount and neat spiral coil binding.',
      isApproved: true,
      isFeatured: true,
      date: 'Google Review • 1 month ago',
    },
    {
      customerName: 'Priya Sharma',
      rating: 5,
      comment: 'Loved the online order feature! No need to carry pendrive or email files. Uploaded PDF directly from my phone and paid via UPI at counter.',
      isApproved: true,
      isFeatured: true,
      date: 'Google Review • 2 months ago',
    },
    {
      customerName: 'Nagaraju K.',
      rating: 5,
      comment: 'Printed high resolution CAD drawings and A3 floor plans. Paper quality was top notch. Staff double checked alignment before printing.',
      isApproved: true,
      isFeatured: true,
      date: 'Google Review • 2 months ago',
    },
    {
      customerName: 'Dr. Bhavani Prasad',
      rating: 5,
      comment: 'Excellent document scanning and PDF formatting service for research papers. Quick and reliable service every time.',
      isApproved: true,
      isFeatured: true,
      date: 'Google Review • 3 months ago',
    },
    {
      customerName: 'Teja Varma',
      rating: 5,
      comment: 'Super fast ID card printing with customized lanyards for our college event. Delivered 80 ID badges in less than 4 hours!',
      isApproved: true,
      isFeatured: true,
      date: 'Google Review • 3 months ago',
    },
    {
      customerName: 'Lakshmi Prasanna',
      rating: 5,
      comment: 'Printed complete lab record books and project sheets with transparent plastic front covers. Very neat finishing.',
      isApproved: true,
      isFeatured: true,
      date: 'Google Review • 4 months ago',
    },
  ];

  await prisma.review.deleteMany({});
  for (const r of defaultReviews) {
    await prisma.review.create({ data: r });
  }
  console.log('✅ 12 Google Reviews seeded');

  // 6. Seed Sample Orders
  const sampleOrders = [
    {
      orderNumber: 'SZ-2026-1048',
      customerName: 'Rahul Kumar',
      customerMobile: '9876543210',
      customerEmail: 'rahul.k@gmail.com',
      status: 'PRINTING',
      estimatedReadyTime: '12:45 PM',
      totalAmount: 180.0,
      paymentStatus: 'UNPAID',
      paymentMethod: 'Pay at Store',
      customerNotes: 'Please staple certificates separately.',
      adminNotes: 'Golden embossed cover processing.',
      items: {
        create: [
          {
            documentName: 'Engineering_Project_Report.pdf',
            originalFileName: 'Engineering_Project_Report.pdf',
            fileUrl: '/uploads/sample_report.pdf',
            fileSize: 4200000,
            fileType: 'application/pdf',
            copies: 2,
            colorMode: 'B&W',
            paperSize: 'A4',
            pageRange: '1-45',
            sides: 'Double-sided',
            binding: 'Spiral Binding',
            paperType: '70 GSM Standard',
            itemInstructions: '2 copies double sided',
            price: 180.0,
          },
        ],
      },
    },
    {
      orderNumber: 'SZ-2026-1049',
      customerName: 'Priya Sharma',
      customerMobile: '9849012345',
      customerEmail: 'priya.s@yahoo.com',
      status: 'READY',
      estimatedReadyTime: '12:30 PM',
      totalAmount: 320.0,
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      customerNotes: 'Color cover page needed.',
      adminNotes: 'Finished & bagged at counter.',
      items: {
        create: [
          {
            documentName: 'Seminar_Presentation_Slides.pdf',
            originalFileName: 'Seminar_Presentation_Slides.pdf',
            fileUrl: '/uploads/sample_presentation.pdf',
            fileSize: 2100000,
            fileType: 'application/pdf',
            copies: 3,
            colorMode: 'Color',
            paperSize: 'A4',
            pageRange: 'All',
            sides: 'Single-sided',
            binding: 'Soft Binding',
            paperType: '80 GSM Premium',
            itemInstructions: 'Color print for slides',
            price: 320.0,
          },
        ],
      },
    },
    {
      orderNumber: 'SZ-2026-1050',
      customerName: 'Kiran Varma',
      customerMobile: '9123456789',
      status: 'NEW',
      estimatedReadyTime: '1:10 PM',
      totalAmount: 65.0,
      paymentStatus: 'UNPAID',
      paymentMethod: 'Pay at Store',
      customerNotes: 'Need urgent before 1:30 PM class.',
      items: {
        create: [
          {
            documentName: 'Assignment_Unit3.pdf',
            originalFileName: 'Assignment_Unit3.pdf',
            fileUrl: '/uploads/sample_assignment.pdf',
            fileSize: 850000,
            fileType: 'application/pdf',
            copies: 1,
            colorMode: 'B&W',
            paperSize: 'A4',
            pageRange: 'All',
            sides: 'Double-sided',
            binding: 'Spiral Binding',
            paperType: '70 GSM Standard',
            price: 65.0,
          },
        ],
      },
    },
    {
      orderNumber: 'SZ-2026-1047',
      customerName: 'Venkat Rao',
      customerMobile: '9988776655',
      status: 'FINISHING',
      estimatedReadyTime: '12:40 PM',
      totalAmount: 220.0,
      paymentStatus: 'UNPAID',
      paymentMethod: 'Pay at Store',
      items: {
        create: [
          {
            documentName: 'College_Record_Book.pdf',
            originalFileName: 'College_Record_Book.pdf',
            fileUrl: '/uploads/sample_record.pdf',
            fileSize: 3100000,
            fileType: 'application/pdf',
            copies: 1,
            colorMode: 'B&W',
            paperSize: 'A4',
            pageRange: 'All',
            sides: 'Double-sided',
            binding: 'Project Hard Binding',
            paperType: '80 GSM Premium',
            price: 220.0,
          },
        ],
      },
    },
    {
      orderNumber: 'SZ-2026-1046',
      customerName: 'Anusha Reddy',
      customerMobile: '9700112233',
      status: 'COLLECTED',
      estimatedReadyTime: '11:30 AM',
      totalAmount: 40.0,
      paymentStatus: 'PAID',
      paymentMethod: 'UPI',
      items: {
        create: [
          {
            documentName: 'Resume_Anusha.pdf',
            originalFileName: 'Resume_Anusha.pdf',
            fileUrl: '/uploads/sample_resume.pdf',
            fileSize: 450000,
            fileType: 'application/pdf',
            copies: 5,
            colorMode: 'B&W',
            paperSize: 'A4',
            pageRange: 'All',
            sides: 'Single-sided',
            binding: 'None',
            paperType: '80 GSM Premium',
            price: 40.0,
          },
        ],
      },
    },
  ];

  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});

  for (const o of sampleOrders) {
    await prisma.order.create({ data: o });
  }
  console.log('✅ Sample Orders seeded');

  // 7. Seed Sample Advertising Leads
  const defaultLeads = [
    {
      leadNumber: 'ADV-1001',
      customerName: 'Suresh Naidu',
      businessName: 'Tenali Tiffins & Restaurant',
      phone: '9848099887',
      email: 'tenalitiffins@gmail.com',
      service: 'Flex & Banner Printing',
      quantity: 2,
      preferredSize: '10ft x 4ft',
      designAvailable: 'Yes',
      requirements: 'Outdoor weather-proof banner with HD gloss finish.',
      quotedPrice: 1200.0,
      status: 'Quotation Sent',
      adminNotes: 'Sent sample proof on WhatsApp.',
    },
    {
      leadNumber: 'ADV-1002',
      customerName: 'Dr. Madhavi',
      businessName: 'Arogya Dental Clinic',
      phone: '9440112233',
      service: 'Visiting Cards',
      quantity: 500,
      preferredSize: 'Standard Matte 350 GSM',
      designAvailable: 'No',
      requirements: 'Need clean medical clinic design with appointment table on back.',
      quotedPrice: 650.0,
      status: 'New',
    },
  ];

  await prisma.advertisingLead.deleteMany({});
  for (const l of defaultLeads) {
    await prisma.advertisingLead.create({ data: l });
  }
  console.log('✅ Advertising Leads seeded');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
