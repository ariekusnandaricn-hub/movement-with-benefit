import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Upload, X, Copy, Check } from "lucide-react";
import { useLocation, useSearch } from "wouter";

export default function PaymentInfo() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const registrationNumber = params.get("registrationNumber");
  const invoiceId = params.get("invoiceId");
  const paymentAmount = params.get("paymentAmount");
  
  // Format payment amount to Rp format
  const formatPaymentAmount = (amount: string | null) => {
    if (!amount) return "Rp 0";
    const num = parseInt(amount, 10);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const uploadPaymentProof = trpc.registration.uploadPaymentProof.useMutation({
    onSuccess: () => {
      toast.success("Bukti pembayaran berhasil diupload!");
      setTimeout(() => setLocation("/"), 2000);
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal mengupload bukti pembayaran");
    }
  });

  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }
      setPaymentProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText("1370800102");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentProofFile) {
      toast.error("Bukti pembayaran wajib diupload!");
      return;
    }

    if (!registrationNumber) {
      toast.error("Data registrasi tidak ditemukan");
      return;
    }

    const paymentProofBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(paymentProofFile);
    });

    uploadPaymentProof.mutate({
      registrationNumber,
      paymentProofBase64,
      paymentProofMimeType: paymentProofFile.type,
    });
  };

  if (!registrationNumber || !invoiceId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-cyan-400/20 max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-400 text-center">Data registrasi tidak ditemukan. Silakan daftar kembali.</p>
            <Button onClick={() => setLocation("/")} className="w-full mt-4 bg-gradient-to-r from-pink-500 to-cyan-400 text-slate-950">
              Kembali ke Beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800/50 border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                Informasi Pembayaran
              </span>
            </CardTitle>
            <p className="text-slate-300 text-center mt-2 text-sm">
              Silakan lakukan pembayaran sesuai dengan instruksi di bawah ini
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Nomor Registrasi */}
            <div className="p-4 bg-slate-700/50 rounded-lg border border-cyan-400/20">
              <p className="text-slate-400 text-sm">Nomor Registrasi</p>
              <p className="text-xl font-mono font-bold text-cyan-400 mt-1">{registrationNumber}</p>
            </div>

            {/* Invoice ID */}
            <div className="p-4 bg-slate-700/50 rounded-lg border border-cyan-400/20">
              <p className="text-slate-400 text-sm">Nomor Invoice (Nomor Peserta)</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xl font-mono font-bold text-pink-500">{invoiceId}</p>
                <button
                  onClick={handleCopyAccountNumber}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  title="Copy"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Nomor ini adalah nomor peserta Anda hingga final. Simpan dengan baik!
              </p>
            </div>

            {/* Informasi Pembayaran */}
            <div className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg">
              <h3 className="text-lg font-semibold text-pink-400 mb-4">Transfer {formatPaymentAmount(paymentAmount)} ke rekening:</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400 text-sm">Bank</p>
                  <p className="text-white font-mono font-bold">Bank DKI Jakarta</p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm">Nomor Rekening</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-white font-mono font-bold text-lg">1370800102</p>
                    <button
                      onClick={handleCopyAccountNumber}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                      title="Copy"
                    >
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 text-sm">Atas Nama</p>
                  <p className="text-white font-mono font-bold">PT PANDAWA KREASINDO ORGANIZER</p>
                </div>

                <div className="pt-2 border-t border-pink-500/20">
                  <p className="text-slate-400 text-sm">Jumlah Transfer</p>
                  <p className="text-2xl font-bold text-pink-400 mt-1">{formatPaymentAmount(paymentAmount)}</p>
                  <p className="text-xs text-slate-400 mt-1">Invoice ID: {invoiceId}</p>
                </div>
              </div>
            </div>

            {/* Upload Bukti Transfer */}
            <form onSubmit={handleSubmitPaymentProof} className="space-y-4">
              <div>
                <Label htmlFor="paymentProof" className="text-slate-300">
                  Bukti Pembayaran *
                </Label>
                <div className="mt-2">
                  <label className="flex items-center justify-center w-full px-4 py-6 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700/70 transition-colors">
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="w-8 h-8 text-cyan-400 mb-2" />
                      <span className="text-sm text-slate-300">
                        {paymentProofPreview ? "Ganti bukti transfer" : "Klik untuk upload"}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">JPG, PNG atau PDF (Max 5MB)</span>
                    </div>
                    <input
                      id="paymentProof"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handlePaymentProofChange}
                      className="hidden"
                    />
                  </label>
                  {paymentProofPreview && (
                    <div className="mt-3 p-3 bg-slate-700/50 rounded-lg flex items-center justify-between">
                      <span className="text-sm text-slate-300 truncate">{paymentProofFile?.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentProofFile(null);
                          setPaymentProofPreview(null);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Screenshot atau foto dari mobile banking / ATM Anda
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={uploadPaymentProof.isPending}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-cyan-400 text-slate-950 font-bold hover:shadow-lg hover:shadow-pink-500/50"
                >
                  {uploadPaymentProof.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Konfirmasi Pembayaran"
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => setLocation("/")}
                  variant="outline"
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                >
                  Kembali
                </Button>
              </div>
            </form>

            {/* Info Box */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                <span className="font-semibold">ℹ️ Informasi:</span> Bukti pembayaran Anda akan diverifikasi oleh admin. Anda akan menerima konfirmasi melalui email setelah pembayaran terverifikasi.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
