import Sidebar from './components/layout/Sidebar';
import HandoverForm from './components/layout/HandoverForm';

function App() {
  return (
    <div className="bg-surface-container-low min-h-screen">
      <Sidebar />
      <main className="ml-64 pt-8 pb-12 px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">Đơn thuê của tôi</h2>
              <p className="text-on-surface-variant font-medium">Quản lý các thiết bị kỹ thuật của bạn.</p>
            </div>
          </div>

     


          <HandoverForm />
        </div>
      </main>
    </div>
  );
}

export default App;