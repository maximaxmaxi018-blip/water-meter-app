import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold text-gray-900">Тест приложения</h1>
      <p className="text-gray-600 mt-4">Если вы видите этот текст, React работает корректно.</p>
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">✅ Приложение загружается</p>
        <p className="text-blue-800">✅ Tailwind CSS работает</p>
        <p className="text-blue-800">✅ TypeScript компилируется</p>
      </div>
    </div>
  );
};

export default TestApp;