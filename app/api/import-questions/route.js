import { prisma } from '@/lib/prisma';
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

    // Validate data format
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      return Response.json(
        { error: 'No data found in Excel file' },
        { status: 400 }
      );
    }

    // Check required columns
    const requiredColumns = ['Question ID', 'Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer'];
    const firstRow = jsonData[0];
    const hasRequiredColumns = requiredColumns.every(col => col in firstRow);

    if (!hasRequiredColumns) {
      return Response.json(
        { 
          error: 'Invalid Excel format. Required columns: Question ID, Question, Option A, Option B, Option C, Option D, Correct Answer',
          providedColumns: Object.keys(firstRow)
        },
        { status: 400 }
      );
    }

    // Clear existing questions and insert new ones
    await prisma.question.deleteMany({});

    const createdQuestions = await Promise.all(
      jsonData.map((row) =>
        prisma.question.create({
          data: {
            questionId: parseInt(row['Question ID']),
            question: String(row['Question']),
            optionA: String(row['Option A']),
            optionB: String(row['Option B']),
            optionC: String(row['Option C']),
            optionD: String(row['Option D']),
            correctAnswer: String(row['Correct Answer']),
          },
        })
      )
    );

    return Response.json({
      success: true,
      message: `${createdQuestions.length} questions imported successfully`,
      count: createdQuestions.length,
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return Response.json(
      { error: 'Failed to process file: ' + error.message },
      { status: 500 }
    );
  }
}
