export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-20 border-t border-gray-700">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-lg font-semibold text-white">🚗 AutoDrive</div>
        <div className="text-sm">
          &copy; {new Date().getFullYear()} AutoDrive. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
