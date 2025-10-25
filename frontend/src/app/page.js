'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://microlink.zeabur.app';

export default function LinkCreator() {
  const [shortCode, setShortCode] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!shortCode || !targetUrl) {
      setMessage('錯誤：短碼和目標網址都不能為空。');
      return;
    }

    const prefixedTargetUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          short_code: shortCode,
          target_url: prefixedTargetUrl,
        }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        const shortLink = `${API_URL}/${shortCode}`;
        setMessage(
          <div style={{ color: 'green' }}>
            ✅ 成功！短連結已建立：
            <a href={shortLink} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '10px', textDecoration: 'underline' }}>
              {shortLink}
            </a>
          </div>
        );
        setShortCode('');
        setTargetUrl('');
      } else {
        setMessage(`錯誤：無法建立連結。 ${data.message || response.statusText}`);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('API Call Failed:', error);
      setMessage('連線錯誤：無法連接到後端 API。');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>建立短連結</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="targetUrl" style={{ display: 'block', marginBottom: '5px' }}>
            目標網址 (Target URL)
          </label>
          <input
            type="url"
            id="targetUrl"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="例如: google.com"
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="shortCode" style={{ display: 'block', marginBottom: '5px' }}>
            短碼 (Short Code)
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>{API_URL}/</span>
            <input
              type="text"
              id="shortCode"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value.toLowerCase().trim())}
              placeholder="例如: vibe"
              required
              style={{ flex: 1, padding: '10px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          {isLoading ? '處理中...' : '🚀 建立短連結'}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          {message}
        </div>
      )}
    </div>
  );
}

