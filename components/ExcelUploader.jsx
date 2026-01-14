'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function ExcelUploader({ onUploadSuccess }) {
  const [excelData, setExcelData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [quizName, setQuizName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [showFormatGuide, setShowFormatGuide] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setMessage({ type: 'error', text: 'Please upload an Excel or CSV file' });
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');
      setFileName(file.name);

      // Read Excel file
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workbook = XLSX.read(event.target?.result, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          setExcelData({
            sheetName,
            data: jsonData,
            columns: jsonData.length > 0 ? Object.keys(jsonData[0]) : [],
            file,
          });
          setMessage('');
        } catch (error) {
          console.error('Error reading Excel file:', error);
          setMessage({ type: 'error', text: 'Error reading file: ' + error.message });
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error processing file' });
      setIsLoading(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!excelData?.file) {
      setMessage({ type: 'error', text: 'Please select a file first' });
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('file', excelData.file);
      if (quizName) {
        formData.append('quizName', quizName);
      }

      const response = await fetch('/api/import-questions', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        let errorMessage = result.error || 'Failed to save questions';
        
        // If there are missing columns, show them more clearly
        if (result.missingColumns && result.providedColumns) {
          errorMessage = `❌ Missing columns: ${result.missingColumns.join(', ')}\n\nYour file has: ${result.providedColumns.join(', ')}\n\nRequired: ${result.requiredColumns?.join(', ') || 'Question ID, Question, Option A, Option B, Option C, Option D, Correct Answer'}`;
        }
        
        throw new Error(errorMessage);
      }

      setMessage({
        type: 'success',
        text: `✓ ${result.count} questions saved to database successfully!`,
      });

      // Clear form
      setExcelData(null);
      setFileName('');
      setQuizName('');
      
      // Call callback if provided
      if (onUploadSuccess) {
        onUploadSuccess();
      }

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error saving to database:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Message Display */}
      {message && (
        <div
          className={`p-4 rounded-lg whitespace-pre-wrap ${
            message.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-green-50 border border-green-200 text-green-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Quiz Name Input Section */}
      {showNameInput && !excelData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold mb-4 text-gray-900">📝 Enter Quiz/Questions Name</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              placeholder="e.g., General Knowledge, Math Basics, Science Quiz..."
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-lg"
            />
            <p className="text-sm text-gray-600">This name helps organize your question sets (optional)</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNameInput(false);
                  setQuizName('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNameInput(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Upload Excel File</h2>
            {quizName && (
              <p className="text-blue-600 font-semibold mt-1">📁 Quiz: {quizName}</p>
            )}
          </div>
          {!showNameInput && (
            <button
              onClick={() => setShowNameInput(true)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-semibold text-sm"
            >
              + Add Name
            </button>
          )}
        </div>
        <p className="text-gray-600 mb-4 text-sm">
          Required columns: Question ID, Question, Option A, Option B, Option C, Option D, Correct Answer
        </p>

        <button
          onClick={() => setShowFormatGuide(true)}
          className="mb-6 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-semibold text-sm inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          View Question Format Guide
        </button>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="hidden"
            id="excel-upload"
          />
          <label htmlFor="excel-upload" className="cursor-pointer block">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v24a4 4 0 004 4h24a4 4 0 004-4V20m-14-12v12m0 0l4-4m-4 4l-4-4"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-gray-600 font-semibold">
              {isLoading ? 'Processing...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-gray-500 text-sm">Excel, CSV files</p>
          </label>
        </div>

        {fileName && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-semibold">📁 File selected: {fileName}</p>
          </div>
        )}
      </div>

      {/* Data Preview Section */}
      {excelData && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Data Preview</h2>
              <p className="text-gray-600">Sheet: {excelData.sheetName}</p>
            </div>
            <button
              onClick={handleSaveToDatabase}
              disabled={isLoading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : '💾 Save to Database'}
            </button>
          </div>

          {/* Table Preview */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  {excelData.columns.map((col) => (
                    <th
                      key={col}
                      className="border border-gray-300 px-4 py-2 text-left font-semibold text-sm"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.data.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {excelData.columns.map((col) => (
                      <td
                        key={`${idx}-${col}`}
                        className="border border-gray-300 px-4 py-2 text-sm"
                      >
                        {String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {excelData.data.length > 10 && (
            <p className="text-gray-600 text-sm mt-4">
              Showing 10 of {excelData.data.length} rows
            </p>
          )}
        </div>
      )}

      {/* Question Format Guide Modal */}
      {showFormatGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">📋 Question Format Guide</h2>
                <p className="text-blue-100 text-sm mt-1">Follow this format when creating your Excel file</p>
              </div>
              <button
                onClick={() => setShowFormatGuide(false)}
                className="text-white hover:bg-blue-800 rounded-lg p-2 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Required Columns */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4">✓ Required Columns</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="font-semibold text-sm text-blue-700">Question ID</p>
                    <p className="text-xs text-gray-600">Unique number</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="font-semibold text-sm text-blue-700">Question</p>
                    <p className="text-xs text-gray-600">The question text</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="font-semibold text-sm text-blue-700">Option A</p>
                    <p className="text-xs text-gray-600">First option</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="font-semibold text-sm text-blue-700">Option B</p>
                    <p className="text-xs text-gray-600">Second option</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="font-semibold text-sm text-blue-700">Option C</p>
                    <p className="text-xs text-gray-600">Third option</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="font-semibold text-sm text-blue-700">Option D</p>
                    <p className="text-xs text-gray-600">Fourth option</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-200 col-span-2 md:col-span-3">
                    <p className="font-semibold text-sm text-blue-700">Correct Answer</p>
                    <p className="text-xs text-gray-600">Must be: A, B, C, or D</p>
                  </div>
                </div>
              </div>

              {/* Example Table */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Example Format</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-300 border border-gray-400">
                        <th className="px-3 py-2 border border-gray-400 font-bold text-left">Question ID</th>
                        <th className="px-3 py-2 border border-gray-400 font-bold text-left">Question</th>
                        <th className="px-3 py-2 border border-gray-400 font-bold text-left">Option A</th>
                        <th className="px-3 py-2 border border-gray-400 font-bold text-left">Option B</th>
                        <th className="px-3 py-2 border border-gray-400 font-bold text-left">Option C</th>
                        <th className="px-3 py-2 border border-gray-400 font-bold text-left">Option D</th>
                        <th className="px-3 py-2 border border-gray-400 font-bold text-left">Correct Answer</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border border-gray-300 hover:bg-blue-50">
                        <td className="px-3 py-2 border border-gray-300">1</td>
                        <td className="px-3 py-2 border border-gray-300">What is 2 + 2?</td>
                        <td className="px-3 py-2 border border-gray-300">3</td>
                        <td className="px-3 py-2 border border-gray-300">4</td>
                        <td className="px-3 py-2 border border-gray-300">5</td>
                        <td className="px-3 py-2 border border-gray-300">6</td>
                        <td className="px-3 py-2 border border-gray-300">B</td>
                      </tr>
                      <tr className="bg-gray-50 border border-gray-300 hover:bg-blue-50">
                        <td className="px-3 py-2 border border-gray-300">2</td>
                        <td className="px-3 py-2 border border-gray-300">What is the capital of France?</td>
                        <td className="px-3 py-2 border border-gray-300">London</td>
                        <td className="px-3 py-2 border border-gray-300">Paris</td>
                        <td className="px-3 py-2 border border-gray-300">Berlin</td>
                        <td className="px-3 py-2 border border-gray-300">Rome</td>
                        <td className="px-3 py-2 border border-gray-300">B</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-yellow-900 mb-4">⚠️ Important Rules</h3>
                <ul className="space-y-2 text-sm text-yellow-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Column headers must match exactly (case-insensitive)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Correct Answer must be one of: A, B, C, or D (capital letters)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Question ID should be unique for each question</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>All fields must contain data (no empty cells)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Supported file formats: .xlsx, .xls, .csv</span>
                  </li>
                </ul>
              </div>

              {/* Tips */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-green-900 mb-4">💡 Pro Tips</h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">→</span>
                    <span>You can give your question set a name for better organization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">→</span>
                    <span>Preview your data before saving to catch any errors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">→</span>
                    <span>Duplicate entries will be saved; ensure your data is clean</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-100 border-t p-4 flex justify-end gap-3">
              <button
                onClick={() => setShowFormatGuide(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Got it! Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
