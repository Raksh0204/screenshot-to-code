import React, { useState } from 'react';
import { Upload, Code, Loader2, Copy, Check } from 'lucide-react';

export default function ScreenshotToCode() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [framework, setFramework] = useState('html');
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const base64String = event.target.result.split(',')[1];
      setImage(base64String);
      setImagePreview(event.target.result);
    };
    
    reader.readAsDataURL(file);
  };

  const generateCode = async () => {
    if (!image) {
      setError('Please upload an image first!');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedCode('');

    const frameworkNames = {
      html: 'HTML + CSS',
      react: 'React component'
    };

    const prompt = `Analyze this UI screenshot and generate ${frameworkNames[framework]} code that recreates the UI.

Requirements:
- Clean and readable code
- Semantic HTML structure
- Responsive layout
- Match colors, spacing, and typography as closely as possible
- Include all visible elements and text
${framework === 'react' ? '- Create a functional React component with proper hooks if needed\n- Use inline styles or CSS modules for styling' : ''}
${framework === 'html' ? '- Include inline CSS or a <style> tag' : ''}

Return ONLY the code without any explanation or markdown formatting.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/png',
                    data: image
                  }
                },
                {
                  type: 'text',
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error.message || 'Failed to generate code');
        return;
      }

      const code = data.content
        .map(item => item.type === 'text' ? item.text : '')
        .filter(Boolean)
        .join('\n');

      if (!code) {
        setError('No code was generated');
        return;
      }

      setGeneratedCode(code);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Screenshot to Code</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Upload a UI screenshot and generate code instantly with AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Panel - Input */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Input</h2>
            
            {/* Framework Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Framework
              </label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="html">HTML + CSS</option>
                <option value="react">React</option>
              </select>
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Screenshot
              </label>
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="max-h-44 object-contain" />
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload image</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateCode}
              disabled={!image || loading}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Code className="w-5 h-5" />
                  Generate Code
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Right Panel - Output */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Generated Code</h2>
              {generatedCode && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="bg-gray-900 rounded-lg p-4 h-[500px] overflow-auto">
              {generatedCode ? (
                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                  {generatedCode}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  {loading ? 'Analyzing screenshot...' : 'Generated code will appear here'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p> • Built with React and Tailwind CSS • </p>
        </div>
      </div>
    </div>
  );
}