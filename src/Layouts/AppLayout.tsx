import { Outlet } from "react-router-dom";
import SideBar from "./Components/SideBar";
import Header from "./Components/Header";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      {/* ✅ Left Sidebar */}
      <SideBar />

      {/* ✅ Right content area */}
      <div className="flex flex-col flex-1 h-screen">
        <Header />

        {/* ✅ Main page content */}
        <main className="flex-1 bg-blue-50/50 py-4 px-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
