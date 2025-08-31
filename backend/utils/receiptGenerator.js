const PDFDocument = require('pdfkit');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');

// Generate PDF receipt
const generatePDFReceipt = (transaction, user, beneficiary) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      
      // Header
      doc.fontSize(24).text('PayStreet', { align: 'center' });
      doc.fontSize(16).text('Transaction Receipt', { align: 'center' });
      doc.moveDown();
      
      // Transaction ID
      doc.fontSize(12).text(`Transaction ID: ${transaction.id}`, { align: 'left' });
      doc.fontSize(10).text(`Date: ${new Date(transaction.createdAt).toLocaleString()}`, { align: 'left' });
      doc.moveDown();
      
      // User Information
      doc.fontSize(14).text('Sender Information:', { underline: true });
      doc.fontSize(10).text(`Name: ${user.fullName}`);
      doc.fontSize(10).text(`Account: ${user.accountNumber}`);
      doc.fontSize(10).text(`Email: ${user.email}`);
      doc.moveDown();
      
      // Beneficiary Information
      doc.fontSize(14).text('Recipient Information:', { underline: true });
      doc.fontSize(10).text(`Name: ${beneficiary.name}`);
      doc.fontSize(10).text(`Country: ${beneficiary.country}`);
      doc.fontSize(10).text(`Currency: ${beneficiary.currency}`);
      doc.moveDown();
      
      // Transaction Details
      doc.fontSize(14).text('Transaction Details:', { underline: true });
      doc.fontSize(10).text(`Source Amount: ${transaction.sourceAmount} ${transaction.sourceCurrency}`);
      doc.fontSize(10).text(`Target Amount: ${transaction.targetAmount} ${transaction.targetCurrency}`);
      doc.fontSize(10).text(`Exchange Rate: ${transaction.fxRate}`);
      doc.fontSize(10).text(`Fees: $${transaction.fees}`);
      doc.fontSize(10).text(`Status: ${transaction.status}`);
      doc.moveDown();
      
      // Footer
      doc.fontSize(8).text('This is a computer-generated receipt. No signature required.', { align: 'center' });
      doc.fontSize(8).text('PayStreet - Secure Cross-Border Remittance', { align: 'center' });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Generate CSV receipt
const generateCSVReceipt = (transaction, user, beneficiary) => {
  const csvWriter = createCsvWriter({
    path: path.join(__dirname, `../receipts/receipt_${transaction.id}.csv`),
    header: [
      { id: 'transactionId', title: 'Transaction ID' },
      { id: 'date', title: 'Date' },
      { id: 'senderName', title: 'Sender Name' },
      { id: 'senderAccount', title: 'Sender Account' },
      { id: 'recipientName', title: 'Recipient Name' },
      { id: 'recipientCountry', title: 'Recipient Country' },
      { id: 'sourceAmount', title: 'Source Amount' },
      { id: 'targetAmount', title: 'Target Amount' },
      { id: 'exchangeRate', title: 'Exchange Rate' },
      { id: 'fees', title: 'Fees' },
      { id: 'status', title: 'Status' }
    ]
  });
  
  const records = [{
    transactionId: transaction.id,
    date: new Date(transaction.createdAt).toLocaleString(),
    senderName: user.fullName,
    senderAccount: user.accountNumber,
    recipientName: beneficiary.name,
    recipientCountry: beneficiary.country,
    sourceAmount: `${transaction.sourceAmount} ${transaction.sourceCurrency}`,
    targetAmount: `${transaction.targetAmount} ${transaction.targetCurrency}`,
    exchangeRate: transaction.fxRate,
    fees: `$${transaction.fees}`,
    status: transaction.status
  }];
  
  return csvWriter.writeRecords(records);
};

// Generate receipt in specified format
const generateReceipt = async (transaction, user, beneficiary, format = 'pdf') => {
  try {
    // Ensure receipts directory exists
    const receiptsDir = path.join(__dirname, '../receipts');
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }
    
    if (format.toLowerCase() === 'pdf') {
      return await generatePDFReceipt(transaction, user, beneficiary);
    } else if (format.toLowerCase() === 'csv') {
      await generateCSVReceipt(transaction, user, beneficiary);
      return { message: 'CSV receipt generated successfully', format: 'csv' };
    } else {
      throw new Error('Unsupported format. Use "pdf" or "csv"');
    }
  } catch (error) {
    throw new Error(`Failed to generate receipt: ${error.message}`);
  }
};

module.exports = {
  generateReceipt,
  generatePDFReceipt,
  generateCSVReceipt
};
