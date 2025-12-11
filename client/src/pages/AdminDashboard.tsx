import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: registrations, isLoading } = trpc.registration.list.useQuery(
    { search: searchTerm, category: categoryFilter !== "all" ? (categoryFilter as "Acting" | "Vocal" | "Model") : undefined },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <Card className="bg-slate-800/50 border-cyan-400/20">
          <CardContent className="pt-6">
            <p className="text-center text-cyan-400">Anda tidak memiliki akses ke halaman ini.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    total: registrations?.length || 0,
    acting: registrations?.filter((r: any) => r.category === "Acting").length || 0,
    vocal: registrations?.filter((r: any) => r.category === "Vocal").length || 0,
    model: registrations?.filter((r: any) => r.category === "Model").length || 0,
    paid: registrations?.filter((r: any) => r.paymentStatus === "paid").length || 0,
    pending: registrations?.filter((r: any) => r.paymentStatus === "pending").length || 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-mono font-bold text-white">
            <span className="bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
              ADMIN DASHBOARD
            </span>
          </h1>
          <p className="text-slate-400 mt-2">Kelola data registrasi peserta audisi</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-cyan-400/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-cyan-400">Total Registrasi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-cyan-400/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-cyan-400">Acting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.acting}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-cyan-400/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-cyan-400">Vocal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.vocal}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-cyan-400/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-cyan-400">Model</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.model}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-cyan-400/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-cyan-400">Pembayaran Lunas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.paid}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-cyan-400/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-cyan-400">Menunggu Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.pending}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Cari nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-700/50 border-cyan-400/20 text-white"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-700/50 border border-cyan-400/20 text-white rounded px-3 py-2"
          >
            <option value="all">Semua Kategori</option>
            <option value="Acting">Acting</option>
            <option value="Vocal">Vocal</option>
            <option value="Model">Model</option>
          </select>
        </div>

        {/* Registrations Table */}
        <Card className="bg-slate-800/50 border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-cyan-400">Daftar Registrasi</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-cyan-400" size={32} />
              </div>
            ) : registrations && registrations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cyan-400/20">
                      <th className="text-left py-3 px-4 text-cyan-400">No. Registrasi</th>
                      <th className="text-left py-3 px-4 text-cyan-400">Nama</th>
                      <th className="text-left py-3 px-4 text-cyan-400">Email</th>
                      <th className="text-left py-3 px-4 text-cyan-400">Kategori</th>
                      <th className="text-left py-3 px-4 text-cyan-400">Provinsi</th>
                      <th className="text-left py-3 px-4 text-cyan-400">Status Pembayaran</th>
                      <th className="text-left py-3 px-4 text-cyan-400">Tanggal Daftar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg: any) => (
                      <tr key={reg.id} className="border-b border-cyan-400/10 hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4 text-white font-mono text-xs">{reg.registrationNumber}</td>
                        <td className="py-3 px-4 text-white">{reg.fullName}</td>
                        <td className="py-3 px-4 text-slate-300 text-xs">{reg.email}</td>
                        <td className="py-3 px-4">
                          <span className="bg-pink-500/20 text-pink-300 px-2 py-1 rounded text-xs">
                            {reg.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-xs">{reg.province}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            reg.paymentStatus === "paid"
                              ? "bg-green-500/20 text-green-300"
                              : reg.paymentStatus === "pending"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-red-500/20 text-red-300"
                          }`}>
                            {reg.paymentStatus === "paid" ? "Lunas" : reg.paymentStatus === "pending" ? "Menunggu" : "Gagal"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-xs">
                          {new Date(reg.createdAt).toLocaleDateString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-8 text-slate-400">Tidak ada data registrasi</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
