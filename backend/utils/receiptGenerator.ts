import PDFDocument from 'pdfkit';
import { createObjectCsvWriter } from 'csv-writer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interface definitions
interface TransactionData {
  id: string;
  sourceAmount: number;
  sourceCurrency: string;
  targetAmount: number;
  targetCurrency: string;
  fxRate: number;
  fees: number;
  status: string;
  createdAt: Date;
  user: {
    fullName: string;
    email: string;
    accountNumber: string;
  };
  beneficiary: {
    name: string;
    bankAccountNumber: string;
    country: string;
    currency: string;
  };
}

interface ReceiptOptions {
  format: 'pdf' | 'csv';
  includeLogo?: boolean;
  customStyling?: boolean;
}

// Generate PDF receipt
export const generatePDFReceipt = async (
  transactionId: string,
  options: ReceiptOptions = { format: 'pdf' }
): Promise<Buffer> => {
  try {
    // Fetch transaction data
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            accountNumber: true
          }
        },
        beneficiary: {
          select: {
            name: true,
            bankAccountNumber: true,
            country: true,
            currency: true
          }
        }
      }
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Add company header
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('PayStreet', { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fontSize(14)
       .font('Helvetica')
       .text('Cross-Border Remittance Receipt', { align: 'center' });
    
    doc.moveDown(2);

    // Add receipt details
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('Transaction Receipt');
    
    doc.moveDown(1);
    
    // Transaction ID
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text(`Receipt #: ${transaction.id}`);
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Date: ${transaction.createdAt.toLocaleDateString()}`);
    
    doc.moveDown(1);

    // User Information
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Sender Information');
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Name: ${transaction.user.fullName}`)
       .text(`Email: ${transaction.user.email}`)
       .text(`Account: ${transaction.user.accountNumber}`);
    
    doc.moveDown(1);

    // Beneficiary Information
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Recipient Information');
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Name: ${transaction.beneficiary.name}`)
       .text(`Bank Account: ${transaction.beneficiary.bankAccountNumber}`)
       .text(`Country: ${transaction.beneficiary.country}`)
       .text(`Currency: ${transaction.beneficiary.currency}`);
    
    doc.moveDown(1);

    // Transaction Details
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Transfer Details');
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Amount Sent: ${transaction.sourceAmount} ${transaction.sourceCurrency}`)
       .text(`Amount Received: ${transaction.targetAmount} ${transaction.targetCurrency}`)
       .text(`Exchange Rate: 1 ${transaction.sourceCurrency} = ${transaction.fxRate} ${transaction.targetCurrency}`)
       .text(`Fees: ${transaction.fees} ${transaction.sourceCurrency}`)
       .text(`Status: ${transaction.status}`);
    
    doc.moveDown(2);

    // Footer
    doc.fontSize(8)
       .font('Helvetica')
       .text('This is a computer-generated receipt. No signature required.', { align: 'center' });
    
    doc.fontSize(8)
       .text('PayStreet - Secure Cross-Border Remittance', { align: 'center' });

    // Finalize PDF
    doc.end();

    // Wait for PDF to be generated
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const result = Buffer.concat(chunks);
        resolve(result);
      });
      
      doc.on('error', reject);
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF receipt');
  }
};

// Generate CSV receipt
export const generateCSVReceipt = async (
  transactionId: string,
  options: ReceiptOptions = { format: 'csv' }
): Promise<string> => {
  try {
    // Fetch transaction data
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            accountNumber: true
          }
        },
        beneficiary: {
          select: {
            name: true,
            bankAccountNumber: true,
            country: true,
            currency: true
          }
        }
      }
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Create CSV writer
    const csvWriter = createObjectCsvWriter({
      path: `/tmp/receipt_${transactionId}.csv`,
      header: [
        { id: 'field', title: 'Field' },
        { id: 'value', title: 'Value' }
      ]
    });

    // Prepare CSV data
    const csvData = [
      { field: 'Receipt Number', value: transaction.id },
      { field: 'Date', value: transaction.createdAt.toLocaleDateString() },
      { field: 'Sender Name', value: transaction.user.fullName },
      { field: 'Sender Email', value: transaction.user.email },
      { field: 'Sender Account', value: transaction.user.accountNumber },
      { field: 'Recipient Name', value: transaction.beneficiary.name },
      { field: 'Recipient Bank Account', value: transaction.beneficiary.bankAccountNumber },
      { field: 'Recipient Country', value: transaction.beneficiary.country },
      { field: 'Recipient Currency', value: transaction.beneficiary.currency },
      { field: 'Amount Sent', value: `${transaction.sourceAmount} ${transaction.sourceCurrency}` },
      { field: 'Amount Received', value: `${transaction.targetAmount} ${transaction.targetCurrency}` },
      { field: 'Exchange Rate', value: `1 ${transaction.sourceCurrency} = ${transaction.fxRate} ${transaction.targetCurrency}` },
      { field: 'Fees', value: `${transaction.fees} ${transaction.sourceCurrency}` },
      { field: 'Status', value: transaction.status }
    ];

    // Write CSV
    await csvWriter.writeRecords(csvData);

    // Read the generated file
    const fs = require('fs');
    const csvContent = fs.readFileSync(`/tmp/receipt_${transactionId}.csv`, 'utf8');
    
    // Clean up temporary file
    fs.unlinkSync(`/tmp/receipt_${transactionId}.csv`);

    return csvContent;
  } catch (error) {
    console.error('CSV generation error:', error);
    throw new Error('Failed to generate CSV receipt');
  }
};

// Main receipt generation function
export const generateReceipt = async (
  transactionId: string,
  options: ReceiptOptions
): Promise<Buffer | string> => {
  try {
    switch (options.format) {
      case 'pdf':
        return await generatePDFReceipt(transactionId, options);
      case 'csv':
        return await generateCSVReceipt(transactionId, options);
      default:
        throw new Error('Unsupported receipt format');
    }
  } catch (error) {
    console.error('Receipt generation error:', error);
    throw error;
  }
};
