export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
        <h3 className="text-gray-500 text-sm font-medium">Today's Sales</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">$0.00</p>
      </div>
      <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
        <h3 className="text-gray-500 text-sm font-medium">Total Transactions</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
      </div>
      <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
        <h3 className="text-gray-500 text-sm font-medium">Total Customers</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
      </div>
    </div>
  );
}
