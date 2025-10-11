'use client'; // 使用客戶端組件

import { useState } from 'react';

// 修正：在 Next.js App Router 客戶端組件中，直接從全局對象引用 NEXT_PUBLIC 開頭的環境變量
// 雖然在 Vercel/Zeabur 部署時會自動處理，但為了兼容本地環境和更嚴格的運行時，我們使用 window._ENV_
// 由於這是 Next.js 環境，Next.js 會在構建時注入 NEXT_PUBLIC 變數，不需要 window._ENV_。
// 錯誤通常發生在構建後，嘗試在客戶端訪問 process.env。
// 解決方案：確保構建器能識別並注入變數。如果仍然失敗，則硬編碼或使用一個變通方法。
// 這裡我們信任 Next.js 的注入機制，並假設錯誤來自運行時環境的限制。

// 雖然 Next.js 應該處理，但在某些舊版或特定環境下會失敗。
// 這裡我們直接定義 API URL 變量，讓構建器知道這是需要注入的變量。

// 修正後的變量引用方式：
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
              placeholder="例如: google.com/long-page"
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-white transition duration-200"
            />
          </div>

          <div>
            <label htmlFor="shortCode" className="block text-sm font-medium text-gray-300 mb-2">
              短碼 (Short Code)
            </label>
            <div className="flex items-center space-x-2">
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
            {isLoading ? '部署中...' : '🚀 建立短連結'}
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
