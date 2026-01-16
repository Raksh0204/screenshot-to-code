import React, { useState } from 'react';
import { Upload, Code, Loader2, Copy, Check } from 'lucide-react';
import './App.css';

function App() {
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

    const prompt = `Analyze this UI screenshot and generate ${frameworkNames[framework]} code that recreates the UI with MAXIMUM accuracy.

Requirements:
- Match colors EXACTLY by analyzing the screenshot carefully
- Match spacing, padding, and margins precisely
- Use the exact font sizes and weights visible
- Recreate all shadows, borders, and rounded corners accurately
- Include all visible elements and text exactly as shown
- Pay close attention to alignment and positioning
${framework === 'react' ? '- Create a functional React component with proper hooks if needed' : ''}
${framework === 'html' ? '- Include inline CSS or a <style> tag with detailed styles' : ''}
${framework === 'tailwind' ? '- Use only Tailwind utility classes with precise values' : ''}

IMPORTANT: Study the screenshot carefully for exact colors, spacing, and typography before generating code.

Return ONLY the code without any explanation or markdown formatting.`;

    try {
      const requestBody = {
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1000
        }
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      const data = await response.json();

      if (data.error) {
        setError(data.error.message || 'Failed to generate code');
        console.error('API Error:', data.error);
        return;
      }

      const code = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!code) {
        setError('No code was generated');
        return;
      }

      const cleanCode = code.replace(/```[\w]*\n?/g, '').trim();
      setGeneratedCode(cleanCode);
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error('Generation error:', err);
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
    <div className="app-container">
      <div className="max-w-container">
        <div className="header">
          <div className="header-icon">
            <Code className="icon-large" />
            <h1 className="title">Screenshot to Code</h1>
          </div>
          <p className="subtitle">
            Upload a UI screenshot and generate code instantly with AI
          </p>
        </div>

        <div className="grid-container">
          <div className="panel">
            <h2 className="panel-title">Input</h2>
            
            <div className="form-group">
              <label className="label">Framework</label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="select"
              >
                <option value="html">HTML + CSS</option>
                <option value="tailwind">Tailwind CSS</option>
                <option value="react">React</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Upload Screenshot</label>
              <label className="upload-area">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="preview-image" />
                ) : (
                  <div className="upload-placeholder">
                    <Upload className="upload-icon" />
                    <span className="upload-text">Click to upload image</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                />
              </label>
            </div>

            <button
              onClick={generateCode}
              disabled={!image || loading}
              className={`btn-primary ${(!image || loading) ? 'btn-disabled' : ''}`}
            >
              {loading ? (
                <>
                  <Loader2 className="icon-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Code className="icon-small" />
                  Generate Code
                </>
              )}
            </button>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Generated Code</h2>
              {generatedCode && (
                <button onClick={copyToClipboard} className="btn-copy">
                  {copied ? (
                    <>
                      <Check className="icon-small check" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="icon-small" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="code-container">
              {generatedCode ? (
                <pre className="code-output">{generatedCode}</pre>
              ) : (
                <div className="code-placeholder">
                  {loading ? 'Analyzing screenshot...' : 'Generated code will appear here'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="footer">
          <p>Powered by Google Gemini • Built with React</p>
        </div>
      </div>
    </div>
  );
}

export default App;