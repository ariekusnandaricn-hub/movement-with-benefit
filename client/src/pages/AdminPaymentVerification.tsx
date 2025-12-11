import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, XCircle, Clock, Search, Filter } from "lucide-react";
import { toast } from "sonner";

type PaymentStatus = "pending_verification" | "verified" | "rejected";

export default function AdminPaymentVerification() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("pending_verification");
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch registrations list
  const { data: registrations, isLoading, refetch } = trpc.registration.list.useQuery({
    status: statusFilter === "all" ? undefined : (statusFilter as PaymentStatus),
  });

  // Filter by search query
  const filteredRegistrations = registrations?.filter((reg) =>
    reg.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.invoiceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Get selected payment details
  const selectedPaymentData = filteredRegistrations.find(
    (reg) => reg.registrationNumber === selectedPayment
  );

  // Verify payment mutation
  const verifyPaymentMutation = trpc.registration.verifyPayment.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setSelectedPayment(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memverifikasi pembayaran");
    },
  });

  const handleApprovePayment = async () => {
    if (!selectedPayment) return;
    setIsVerifying(true);
    try {
      await verifyPaymentMutation.mutateAsync({
        registrationNumber: selectedPayment,
        isApproved: true,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment) return;
    setIsVerifying(true);
    try {
      await verifyPaymentMutation.mutateAsync({
        registrationNumber: selectedPayment,
        isApproved: false,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "pending_verification":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
            <Clock size={14} />
            Pending
          </div>
        );
      case "verified":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
            <CheckCircle2 size={14} />
            Verified
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
            <XCircle size={14} />
            Rejected
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Verifikasi Pembayaran
          </h1>
          <p className="text-slate-400">
            Kelola dan verifikasi bukti pembayaran peserta audisi
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-500" size={18} />
              <Input
                placeholder="Cari nama, invoice ID, atau nomor registrasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PaymentStatus | "all")}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending_verification">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment List */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <h2 className="text-lg font-semibold text-white">
                  Daftar Pembayaran ({filteredRegistrations.length})
                </h2>
              </div>
              <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center text-slate-400">
                    Memuat data...
                  </div>
                ) : filteredRegistrations.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    Tidak ada data pembayaran
                  </div>
                ) : (
                  filteredRegistrations.map((registration) => (
                    <div
                      key={registration.registrationNumber}
                      onClick={() => setSelectedPayment(registration.registrationNumber)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedPayment === registration.registrationNumber
                          ? "bg-slate-700"
                          : "hover:bg-slate-700/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-white">
                            {registration.fullName}
                          </p>
                          <p className="text-sm text-slate-400">
                            {registration.category} • {registration.invoiceId}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Rp {registration.invoiceAmount?.toLocaleString("id-ID")}
                          </p>
                        </div>
                        {getStatusBadge(registration.paymentStatus as PaymentStatus)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Payment Details */}
          <div>
            {selectedPaymentData ? (
              <Card className="bg-slate-800 border-slate-700 sticky top-6">
                <div className="p-4 border-b border-slate-700">
                  <h3 className="text-lg font-semibold text-white">
                    Detail Pembayaran
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  {/* Participant Info */}
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Nama Peserta
                    </p>
                    <p className="text-white font-medium">
                      {selectedPaymentData.fullName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Kategori
                    </p>
                    <p className="text-white font-medium">
                      {selectedPaymentData.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Nomor Peserta
                    </p>
                    <p className="text-white font-mono">
                      {selectedPaymentData.registrationNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Invoice ID
                    </p>
                    <p className="text-white font-mono">
                      {selectedPaymentData.invoiceId}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Jumlah Pembayaran
                    </p>
                    <p className="text-white font-bold text-lg">
                      Rp {selectedPaymentData.invoiceAmount?.toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Email
                    </p>
                    <p className="text-white text-sm break-all">
                      {selectedPaymentData.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      WhatsApp
                    </p>
                    <p className="text-white text-sm">
                      {selectedPaymentData.whatsappNumber}
                    </p>
                  </div>

                  {/* Payment Proof */}
                  {selectedPaymentData.paymentProofUrl && (
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                        Bukti Pembayaran
                      </p>
                      <img
                        src={selectedPaymentData.paymentProofUrl}
                        alt="Bukti Pembayaran"
                        className="w-full rounded-lg border border-slate-600 max-h-48 object-cover"
                      />
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Status
                    </p>
                    {getStatusBadge(selectedPaymentData.paymentStatus as PaymentStatus)}
                  </div>

                  {/* Action Buttons */}
                  {selectedPaymentData.paymentStatus === "pending_verification" && (
                    <div className="flex gap-2 pt-4 border-t border-slate-700">
                      <Button
                        onClick={handleApprovePayment}
                        disabled={isVerifying}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle2 size={16} className="mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={handleRejectPayment}
                        disabled={isVerifying}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle size={16} className="mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700 p-8 text-center">
                <p className="text-slate-400">
                  Pilih pembayaran dari daftar untuk melihat detail
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
