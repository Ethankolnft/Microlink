'use client';

import { useState } from 'react';

// 使用環境變量，如果沒有設置則使用默認值
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://microlink.zeabur.app';

export default function LinkCreator() {
  // ... 其他代碼保持不變
}

// 主應用程式組件
export default function LinkCreator() {
  const [shortCode, setShortCode] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 處理表單提交事件
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!shortCode || !targetUrl) {
      setMessage('錯誤：短碼和目標網址都不能為空。');
      return;
    }
    
    // 檢查目標網址是否包含協定
    const prefixedTargetUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;

    setIsLoading(true);

    try {
      // 發送 POST 請求到您的後端 API
      const response = await fetch(`${API_URL}/api/links`, { // 使用硬編碼的 API_URL
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
        // 成功建立連結
        const shortLink = `${API_URL}/${shortCode}`; // 完整短連結
        setMessage(
          <div className="text-green-400">
            ✅ 成功！短連結已建立並部署：
            <a href={shortLink} target="_blank" rel="noopener noreferrer" className="underline font-bold ml-2">
              {shortLink}
            </a>
          </div>
        );
        // 清空表單以便演示
        setShortCode('');
        setTargetUrl('');
      } else {
        // 處理 API 錯誤
        setMessage(`錯誤：無法建立連結。 ${data.message || response.statusText}`);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('API Call Failed:', error);
      setMessage('連線錯誤：無法連接到後端 API。請檢查 NEXT_PUBLIC_API_URL。');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-white">
      <div className="w-full max-w-lg bg-gray-800 p-8 rounded-xl shadow-2xl border border-purple-600">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-400 mb-2">
          Micro-Link: 您的創業 MVP
        </h1>
        <p className="text-gray-400 mb-8">
          在 Zeabur 部署的 Full-Stack 連結管理工具。
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-300 mb-2">
              目標網址 (Target URL)
            </label>
            <input
              type="text"
              id="targetUrl"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="例如: [google.com/long-page](https://google.com/long-page)"
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-white transition duration-200"
            />
          </div>

          <div>
            <label htmlFor="shortCode" className="block text-sm font-medium text-gray-300 mb-2">
              短碼 (Short Code)
            </label>
            <div className="flex items-center space-x-2">
              {/* 顯示硬編碼的 Zeabur 網址，用於最終演示 */}
              <span className="text-gray-400">{API_URL}/</span> 
              <input
                type="text"
                id="shortCode"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value.toLowerCase().trim())}
                placeholder="例如: vibe"
                required
                className="flex-grow px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-white transition duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-[1.01] ${
              isLoading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/50'
            }`}
          >
            {isLoading ? '處理中...' : '🚀 建立短連結'}
          </button>
        </form>

        {/* 訊息顯示區 */}
        {message && (
          <div className="mt-6 p-4 rounded-lg bg-gray-700 border border-gray-600">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
