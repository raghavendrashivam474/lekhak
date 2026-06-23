// src/app/dashboard/page.tsx

export default function DashboardPage() {
  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-semibold text-[#F5ECD7]">
          Welcome back
        </h1>
        <p className="text-sm text-[#8A9BB0] mt-1">
          Here is what is happening with your writing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-[#1A2333] border border-[#2A3A52] rounded-xl p-5">
          <p className="text-xs text-[#8A9BB0] uppercase tracking-wide">
            Projects
          </p>
          <p className="text-3xl font-semibold text-[#F5ECD7] mt-2">0</p>
        </div>

        <div className="bg-[#1A2333] border border-[#2A3A52] rounded-xl p-5">
          <p className="text-xs text-[#8A9BB0] uppercase tracking-wide">
            Notes
          </p>
          <p className="text-3xl font-semibold text-[#F5ECD7] mt-2">0</p>
        </div>

        <div className="bg-[#1A2333] border border-[#2A3A52] rounded-xl p-5">
          <p className="text-xs text-[#8A9BB0] uppercase tracking-wide">
            Characters
          </p>
          <p className="text-3xl font-semibold text-[#F5ECD7] mt-2">0</p>
        </div>

      </div>

      <div className="bg-[#1A2333] border border-[#2A3A52] rounded-xl p-5">
        <p className="text-sm font-medium text-[#C8D6E5] mb-4">
          Recent Activity
        </p>
        <p className="text-sm text-[#4A5A6A]">
          No activity yet. Start by creating a project.
        </p>
      </div>

    </div>
  );
}