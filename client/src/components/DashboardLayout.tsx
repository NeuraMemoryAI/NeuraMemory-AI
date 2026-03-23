import Navbar from './Navbar';
import RightSidebar from './RightSidebar';
import MainArea from './MainArea';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  return (
    <div className="flex flex-col h-screen w-full font-sans overflow-hidden" style={{ background: '#080b14' }}>
      <Navbar />
      <div className="flex flex-row gap-3 px-3 py-3 w-full flex-1 overflow-hidden items-stretch">
        <div className="hidden lg:flex lg:flex-col lg:w-56 lg:shrink-0 h-full">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col h-full rounded-2xl overflow-hidden" style={{ background: 'rgba(13,17,23,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <MainArea />
        </div>
        <div className="hidden lg:flex flex-col shrink-0 h-full w-80">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
