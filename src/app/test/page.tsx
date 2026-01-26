export default function TestPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">🎉 Test Page Working!</h1>
      <p className="text-xl text-gray-600 mb-8">If you can see this, the Next.js app is running correctly.</p>
      
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        <strong>✅ Success!</strong> The application is compiled and running.
      </div>
      
      <div className="space-y-4">
        <a href="/" className="block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition text-center">
          Go to Homepage
        </a>
        <a href="/seller" className="block bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition text-center">
          Go to Seller Dashboard
        </a>
        <a href="/buyer" className="block bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition text-center">
          Go to Buyer Dashboard
        </a>
      </div>
    </div>
  );
}