import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const quizName = formData.get('quizName');

    if (!file) {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Extract filename
    const fileName = file.name || 'Uploaded Questions';

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

    // Check required columns - case insensitive and flexible matching
    const requiredColumns = ['Question ID', 'Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer'];
    const firstRow = jsonData[0];
    const providedColumns = Object.keys(firstRow);
    
    // Create a normalized mapping of columns (case-insensitive, trim spaces)
    const columnMap = {};
    const normalizedProvidedColumns = providedColumns.map(col => col.trim().toLowerCase());
    
    requiredColumns.forEach(requiredCol => {
      const normalizedRequired = requiredCol.trim().toLowerCase();
      const foundIndex = normalizedProvidedColumns.findIndex(col => col === normalizedRequired);
      
      if (foundIndex !== -1) {
        columnMap[requiredCol] = providedColumns[foundIndex];
      }
    });
    
    const missingColumns = requiredColumns.filter(col => !columnMap[col]);
    
    if (missingColumns.length > 0) {
      return Response.json(
        { 
          error: `Missing required columns: ${missingColumns.join(', ')}. Your file has: ${providedColumns.join(', ')}`,
          providedColumns: providedColumns,
          requiredColumns: requiredColumns,
          missingColumns: missingColumns
        },
        { status: 400 }
      );
    }

    // Create or get quiz set if name is provided
    let quizSet = null;
    if (quizName && quizName.trim()) {
      quizSet = await prisma.quizSet.create({
        data: {
          name: quizName.trim(),
          description: `Excel import - ${new Date().toLocaleDateString()}`,
        },
      });
    }

    // Clear existing orphaned questions (without quizSet) and insert new ones
    await prisma.question.deleteMany({
      where: { quizSetId: null }
    });

    const createdQuestions = await Promise.all(
      jsonData.map((row) =>
        prisma.question.create({
          data: {
            questionId: parseInt(row[columnMap['Question ID']]),
            question: String(row[columnMap['Question']]),
            optionA: String(row[columnMap['Option A']]),
            optionB: String(row[columnMap['Option B']]),
            optionC: String(row[columnMap['Option C']]),
            optionD: String(row[columnMap['Option D']]),
            correctAnswer: String(row[columnMap['Correct Answer']]),
            fileName: fileName,
            quizSetId: quizSet ? quizSet.id : null,
          },
        })
      )
    );

    // Log the upload to upload history
    await prisma.uploadHistory.create({
      data: {
        fileName: fileName,
        quizName: quizName || null,
        questionCount: createdQuestions.length,
        quizSetId: quizSet ? quizSet.id : null,
        status: 'success',
        message: `${createdQuestions.length} questions imported successfully`,
      },
    });

    return Response.json({
      success: true,
      message: `${createdQuestions.length} questions imported successfully`,
      count: createdQuestions.length,
      quizSet,
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return Response.json(
      { error: 'Failed to process file: ' + error.message },
      { status: 500 }
    );
  }
}
