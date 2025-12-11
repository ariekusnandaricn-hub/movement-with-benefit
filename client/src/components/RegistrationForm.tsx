import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Upload, X, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

const INDONESIAN_PROVINCES = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Jambi", "Sumatera Selatan",
  "Bengkulu", "Lampung", "Kepulauan Bangka Belitung", "Kepulauan Riau", "DKI Jakarta",
  "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Banten",
  "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat",
  "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
  "Sulawesi Utara", "Sulawesi Tengah", "Sulawesi Selatan", "Sulawesi Tenggara",
  "Gorontalo", "Sulawesi Barat", "Maluku", "Maluku Utara", "Papua", "Papua Barat",
  "Papua Barat Daya", "Papua Selatan", "Papua Tengah", "Papua Pegunungan"
];

export default function RegistrationForm() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    birthPlace: "",
    birthDate: "",
    whatsappNumber: "",
    gender: "",
    profession: "",
    province: "",
    category: "",
    nik: "",
    kiaNumber: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [parentalConsentFile, setParentalConsentFile] = useState<File | null>(null);
  const [parentalConsentPreview, setParentalConsentPreview] = useState<string | null>(null);

  // Calculate age and determine if minor
  const isMinor = useMemo(() => {
    if (!formData.birthDate) return false;
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 17;
  }, [formData.birthDate]);

  // Check if KIA and parental consent are required
  const requiresKiaAndConsent = useMemo(() => {
    return isMinor || !formData.nik;
  }, [isMinor, formData.nik]);

  const createRegistration = trpc.registration.create.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Pendaftaran berhasil! Nomor registrasi: ${data.registrationNumber}`);
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        address: "",
        birthPlace: "",
        birthDate: "",
        whatsappNumber: "",
        gender: "",
        profession: "",
        province: "",
        category: "",
        nik: "",
        kiaNumber: "",
      });
      setPhotoFile(null);
      setPhotoPreview(null);
      setParentalConsentFile(null);
      setParentalConsentPreview(null);
      
      // Redirect to payment info page with registration and invoice data
      setTimeout(() => {
        const paymentUrl = `/payment-info?registrationNumber=${data.registrationNumber}&invoiceId=${data.invoiceId}&paymentAmount=${data.paymentAmount}`;
        setLocation(paymentUrl);
      }, 1500);
    },
    onError: (error: any) => {
      toast.error(error.message || "Gagal membuat pendaftaran");
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran foto maksimal 5MB");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleParentalConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }
      setParentalConsentFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setParentalConsentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi field wajib
    if (!formData.fullName || !formData.email || !formData.address || !formData.birthPlace || 
        !formData.birthDate || !formData.whatsappNumber || !formData.gender || 
        !formData.profession || !formData.province || !formData.category) {
      toast.error("Semua field wajib diisi!");
      return;
    }

    // Validasi foto
    if (!photoFile) {
      toast.error("Foto terbaru wajib diupload!");
      return;
    }

    // Validasi untuk minor atau tanpa NIK
    if (requiresKiaAndConsent) {
      if (!formData.kiaNumber) {
        toast.error("Nomor KIA wajib diisi untuk peserta di bawah 17 tahun atau tanpa NIK");
        return;
      }
      if (!parentalConsentFile) {
        toast.error("Surat izin orang tua wajib diupload untuk peserta di bawah 17 tahun atau tanpa NIK");
        return;
      }
    }

    // Convert files to base64
    const photoBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(photoFile);
    });

    let parentalConsentBase64 = "";
    if (parentalConsentFile) {
      parentalConsentBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(parentalConsentFile);
      });
    }

    createRegistration.mutate({
      fullName: formData.fullName,
      email: formData.email,
      address: formData.address,
      birthPlace: formData.birthPlace,
      birthDate: formData.birthDate,
      whatsappNumber: formData.whatsappNumber,
      gender: formData.gender as "Laki-laki" | "Perempuan",
      profession: formData.profession,
      province: formData.province,
      category: formData.category as "Acting" | "Vocal" | "Model",
      nik: formData.nik || null,
      kiaNumber: formData.kiaNumber || null,
      photoBase64,
      photoMimeType: photoFile.type,
      parentalConsentBase64: parentalConsentBase64 || null,
      parentalConsentMimeType: parentalConsentFile?.type || null,
      isMinor: isMinor ? 1 : 0,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800/50 border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                Formulir Pendaftaran Audisi MWB 2026
              </span>
            </CardTitle>
            <p className="text-slate-300 text-center mt-2 text-sm">
              Isi formulir berikut untuk mendaftar sebagai peserta audisi
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informasi Pribadi */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cyan-400">Informasi Pribadi</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName" className="text-slate-300">Nama Lengkap *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-slate-300">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      placeholder="Masukkan email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birthPlace" className="text-slate-300">Tempat Lahir *</Label>
                    <Input
                      id="birthPlace"
                      name="birthPlace"
                      value={formData.birthPlace}
                      onChange={handleInputChange}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      placeholder="Masukkan tempat lahir"
                    />
                  </div>

                  <div>
                    <Label htmlFor="birthDate" className="text-slate-300">Tanggal Lahir *</Label>
                    <Input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender" className="text-slate-300">Jenis Kelamin *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                        <SelectItem value="Perempuan">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="whatsappNumber" className="text-slate-300">Nomor WhatsApp *</Label>
                    <Input
                      id="whatsappNumber"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleInputChange}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      placeholder="Masukkan nomor WhatsApp"
                    />
                  </div>
                </div>
              </div>

              {/* Alamat dan Lokasi */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cyan-400">Alamat dan Lokasi</h3>
                
                <div>
                  <Label htmlFor="address" className="text-slate-300">Alamat Lengkap *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    placeholder="Masukkan alamat lengkap"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="province" className="text-slate-300">Provinsi *</Label>
                  <Select value={formData.province} onValueChange={(value) => handleSelectChange("province", value)}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Pilih provinsi" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 max-h-64">
                      {INDONESIAN_PROVINCES.map((prov) => (
                        <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Informasi Pekerjaan */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cyan-400">Informasi Pekerjaan</h3>
                
                <div>
                  <Label htmlFor="profession" className="text-slate-300">Profesi/Pekerjaan *</Label>
                  <Input
                    id="profession"
                    name="profession"
                    value={formData.profession}
                    onChange={handleInputChange}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    placeholder="Masukkan profesi atau pekerjaan"
                  />
                </div>
              </div>

              {/* Informasi Audisi */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cyan-400">Informasi Audisi</h3>
                
                <div>
                  <Label htmlFor="category" className="text-slate-300">Kategori Audisi *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="Acting">Acting</SelectItem>
                      <SelectItem value="Vocal">Vocal</SelectItem>
                      <SelectItem value="Model">Model</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Identitas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cyan-400">Identitas</h3>
                
                <div>
                  <Label htmlFor="nik" className="text-slate-300">NIK (Nomor Induk Kependudukan)</Label>
                  <Input
                    id="nik"
                    name="nik"
                    value={formData.nik}
                    onChange={handleInputChange}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    placeholder="Masukkan NIK (16 digit)"
                    maxLength={16}
                  />
                  <p className="text-xs text-slate-400 mt-1">Opsional - Jika tidak memiliki NIK, silakan isi KIA</p>
                </div>
              </div>

              {/* Conditional Fields untuk Minor atau Tanpa NIK */}
              {requiresKiaAndConsent && (
                <div className="space-y-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex gap-2 items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-400">Dokumen Tambahan Diperlukan</h3>
                      <p className="text-sm text-yellow-300 mt-1">
                        {isMinor ? "Anda berusia di bawah 17 tahun" : "Anda tidak memiliki NIK"}. Silakan lengkapi dokumen berikut:
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="kiaNumber" className="text-slate-300">Nomor KIA (Kartu Identitas Anak) *</Label>
                    <Input
                      id="kiaNumber"
                      name="kiaNumber"
                      value={formData.kiaNumber}
                      onChange={handleInputChange}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      placeholder="Masukkan nomor KIA"
                      maxLength={16}
                    />
                  </div>

                  <div>
                    <Label htmlFor="parentalConsent" className="text-slate-300">Surat Izin Orang Tua *</Label>
                    <div className="mt-2">
                      <label className="flex items-center justify-center w-full px-4 py-6 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700/70 transition-colors">
                        <div className="flex flex-col items-center justify-center">
                          <Upload className="w-8 h-8 text-cyan-400 mb-2" />
                          <span className="text-sm text-slate-300">
                            {parentalConsentPreview ? "Ganti file" : "Klik untuk upload"}
                          </span>
                          <span className="text-xs text-slate-400 mt-1">JPG, PNG atau PDF (Max 5MB)</span>
                        </div>
                        <input
                          id="parentalConsent"
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleParentalConsentChange}
                          className="hidden"
                        />
                      </label>
                      {parentalConsentPreview && (
                        <div className="mt-3 p-3 bg-slate-700/50 rounded-lg flex items-center justify-between">
                          <span className="text-sm text-slate-300 truncate">{parentalConsentFile?.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setParentalConsentFile(null);
                              setParentalConsentPreview(null);
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Foto */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cyan-400">Foto Terbaru</h3>
                
                <div>
                  <Label htmlFor="photo" className="text-slate-300">Upload Foto *</Label>
                  <div className="mt-2">
                    <label className="flex items-center justify-center w-full px-4 py-6 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700/70 transition-colors">
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="w-8 h-8 text-cyan-400 mb-2" />
                        <span className="text-sm text-slate-300">
                          {photoPreview ? "Ganti foto" : "Klik untuk upload"}
                        </span>
                        <span className="text-xs text-slate-400 mt-1">JPG atau PNG (Max 5MB)</span>
                      </div>
                      <input
                        id="photo"
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                    {photoPreview && (
                      <div className="mt-3 relative">
                        <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoFile(null);
                            setPhotoPreview(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={createRegistration.isPending}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-cyan-400 text-slate-950 font-bold hover:shadow-lg hover:shadow-pink-500/50"
                >
                  {createRegistration.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Daftar Sekarang"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
