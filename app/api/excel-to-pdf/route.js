import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Create PDF
    const pdf = new jsPDF();
    let yPosition = 10;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const lineHeight = 10;

    // Add title
    pdf.setFontSize(16);
    pdf.text('Excel Data Export', margin, yPosition);
    yPosition += 15;

    // Add file name
    pdf.setFontSize(10);
    pdf.text(`Source: ${file.name}`, margin, yPosition);
    yPosition += 10;

    // Add data
    pdf.setFontSize(9);
    jsonData.forEach((row, index) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      const rowText = JSON.stringify(row, null, 2);
      const lines = pdf.splitTextToSize(rowText, 180);
      
      pdf.text(lines, margin, yPosition);
      yPosition += lines.length * lineHeight + 5;
    });

    // Generate PDF as buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${file.name.split('.')[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return Response.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}
