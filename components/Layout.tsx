import Nav from './Nav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Nav />
      {/* Main Content Area Wrapper */}
      <div className="flex-1 flex flex-col md:ml-64 w-full h-full relative z-10">
        <main className="flex-1 overflow-y-auto px-4 md:px-12 py-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
