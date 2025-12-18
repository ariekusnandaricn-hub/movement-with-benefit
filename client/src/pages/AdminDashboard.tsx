import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState({
    province: "",
    category: "",
    paymentStatus: "",
    search: "",
  });

  const { data: registrations, isLoading, refetch } = trpc.admin.getRegistrations.useQuery(
    {
      province: filters.province || undefined,
      category: filters.category as any || undefined,
      paymentStatus: filters.paymentStatus as any || undefined,
      search: filters.search || undefined,
    },
    {
      enabled: !!user && user.role === "admin",
    }
  );

  const updatePaymentStatus = trpc.admin.updatePaymentStatus.useMutation({
    onSuccess: () => {
      toast.success("Status pembayaran berhasil diupdate");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Silakan login untuk mengakses dashboard</p>
        <Button asChild>
          <a href={getLoginUrl()}>Login</a>
        </Button>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-muted-foreground">Anda tidak memiliki akses ke halaman ini</p>
        <Button onClick={() => setLocation("/")}>Kembali ke Home</Button>
      </div>
    );
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Lunas</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-500">Gagal</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const provinces = [
    "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau",
    "Jambi", "Sumatera Selatan", "Bangka Belitung", "Bengkulu", "Lampung",
    "DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah", "DI Yogyakarta",
    "Jawa Timur", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
    "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur",
    "Kalimantan Utara", "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah",
    "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara", "Maluku",
    "Maluku Utara", "Papua", "Papua Barat", "Papua Tengah", "Papua Pegunungan",
    "Papua Selatan", "Papua Barat Daya"
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container max-w-7xl">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Kelola semua pendaftaran peserta audisi</p>
          </div>
          <Button onClick={() => setLocation("/")} variant="outline">
            Kembali ke Home
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Peserta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registrations?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pembayaran Lunas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {registrations?.filter((r: any) => r.paymentStatus === "paid").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {registrations?.filter((r: any) => r.paymentStatus === "pending").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gagal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {registrations?.filter((r: any) => r.paymentStatus === "failed").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter & Search</CardTitle>
            <CardDescription>Filter pendaftaran berdasarkan kriteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau nomor..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>

              <Select value={filters.province} onValueChange={(value) => setFilters({ ...filters, province: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Provinsi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Provinsi</SelectItem>
                  {provinces.map((province) => (
                    <SelectItem key={province} value={province}>{province}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Kategori</SelectItem>
                  <SelectItem value="Acting">Acting</SelectItem>
                  <SelectItem value="Vocal">Vocal</SelectItem>
                  <SelectItem value="Model">Model</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.paymentStatus} onValueChange={(value) => setFilters({ ...filters, paymentStatus: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Lunas</SelectItem>
                  <SelectItem value="failed">Gagal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setFilters({ province: "", category: "", paymentStatus: "", search: "" })}
              >
                Reset Filter
              </Button>
              <Button 
                variant="outline" 
                className="ml-auto"
                onClick={() => {
                  if (!registrations || registrations.length === 0) {
                    toast.error("Tidak ada data untuk diexport");
                    return;
                  }

                  const excelData = registrations.map((reg: any) => ({
                    "No. Registrasi": reg.registrationNumber,
                    "No. Peserta": reg.participantNumber || reg.invoiceId || "-",
                    "Nama Lengkap": reg.fullName,
                    "Email": reg.email,
                    "WhatsApp": reg.whatsappNumber,
                    "Kategori": reg.category,
                    "Provinsi": reg.province,
                    "Jenis Kelamin": reg.gender,
                    "Tempat Lahir": reg.birthPlace,
                    "Tanggal Lahir": reg.birthDate,
                    "Alamat": reg.address,
                    "Profesi": reg.profession,
                    "Status Pembayaran": reg.paymentStatus,
                    "NIK": reg.nik || "-",
                    "Tanggal Daftar": new Date(reg.createdAt).toLocaleString("id-ID"),
                  }));

                  const ws = XLSX.utils.json_to_sheet(excelData);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "Registrations");

                  const filename = `registrations_${new Date().toISOString().split("T")[0]}.xlsx`;

                  XLSX.writeFile(wb, filename);
                  toast.success("Data berhasil diexport ke Excel");
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Pendaftaran</CardTitle>
            <CardDescription>
              Total: {registrations?.length || 0} pendaftaran
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : registrations && registrations.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Registrasi</TableHead>
                      <TableHead>No. Peserta</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Provinsi</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>WhatsApp</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((reg: any) => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-mono text-sm">{reg.registrationNumber}</TableCell>
                        <TableCell className="font-mono text-sm font-bold text-primary">{reg.participantNumber || reg.invoiceId || "-"}</TableCell>
                        <TableCell className="font-medium">{reg.fullName}</TableCell>
                        <TableCell>{reg.category}</TableCell>
                        <TableCell>{reg.province}</TableCell>
                        <TableCell className="text-sm">{reg.email}</TableCell>
                        <TableCell className="text-sm">{reg.whatsappNumber}</TableCell>
                        <TableCell>{getPaymentStatusBadge(reg.paymentStatus)}</TableCell>
                        <TableCell>
                          <Select
                            value={reg.paymentStatus}
                            onValueChange={(value) => {
                              updatePaymentStatus.mutate({
                                registrationId: reg.id,
                                paymentStatus: value as any,
                              });
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Lunas</SelectItem>
                              <SelectItem value="failed">Gagal</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada pendaftaran ditemukan
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
