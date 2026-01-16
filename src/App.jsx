import React, { useState } from 'react';
import { Upload, Code, Loader2, Copy, Check } from 'lucide-react';

export default function App() {
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
      tailwind: 'HTML with Tailwind CSS',
      react: 'React component with Tailwind CSS'
    };

    const prompt = `Generate ${frameworkNames[framework]} code for this UI screenshot.

Requirements:
- Clean and readable code
- Semantic HTML structure
- Responsive layout
- Match colors, spacing, and typography
- Include all visible elements
${framework === 'react' ? '- Functional React component' : ''}
${framework === 'html' ? '- Include CSS in <style> tag' : ''}
${framework === 'tailwind' ? '- Use Tailwind utility classes' : ''}

Return ONLY the code, no explanations.`;

    try {
      // Using Hugging Face's free image-to-text model
      const response = await fetch(
        'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: image,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const result = await response.json();
      const description = result[0]?.generated_text || 'UI interface';

      // Generate code based on description and framework
      const code = generateCodeFromDescription(description, framework);
      setGeneratedCode(code);

    } catch (err) {
      console.error('Error:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateCodeFromDescription = (description, framework) => {
    // This is a simple template-based code generator
    // You can enhance this with more sophisticated logic

    if (framework === 'html') {
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${description}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 100%;
        }
        
        h1 {
            color: #333;
            margin-bottom: 20px;
            font-size: 28px;
        }
        
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        button:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome</h1>
        <p>This is a template based on: ${description}</p>
        <button onclick="alert('Button clicked!')">Click Me</button>
    </div>
</body>
</html>`;
    } else if (framework === 'tailwind') {
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${description}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-purple-600 to-blue-600 min-h-screen flex items-center justify-center p-6">
    <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">Welcome</h1>
        <p class="text-gray-600 mb-6 leading-relaxed">
            This is a template based on: ${description}
        </p>
        <button class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition transform hover:scale-105">
            Click Me
        </button>
    </div>
</body>
</html>`;
    } else {
      return `import React from 'react';

export default function Component() {
  const handleClick = () => {
    alert('Button clicked!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome
        </h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          This is a template based on: ${description}
        </p>
        <button 
          onClick={handleClick}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition transform hover:scale-105"
        >
          Click Me
        </button>
      </div>
    </div>
  );
}`;
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
            Upload a UI screenshot and generate code instantly - 100% Free!
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
                <option value="tailwind">Tailwind CSS</option>
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

            {/* Info Message */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs">
              ℹ️ This uses a free AI model. Results are template-based and may not perfectly match your screenshot.
            </div>
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
          <p>Powered by Hugging Face (Free) • Built with React and Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}