import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

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
    category: ""
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const createRegistration = trpc.registration.create.useMutation({
    onSuccess: (data: any) => {
      toast.success("Pendaftaran berhasil dibuat!");
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
        category: ""
      });
      setPhotoFile(null);
      setPhotoPreview(null);
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
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi
    if (!formData.fullName || !formData.email || !formData.address || !formData.birthPlace || 
        !formData.birthDate || !formData.whatsappNumber || !formData.gender || 
        !formData.profession || !formData.province || !formData.category) {
      toast.error("Semua field wajib diisi!");
      return;
    }

    // Validasi file upload
    if (!photoFile) {
      toast.error("Foto terbaru wajib diupload!");
      return;
    }

    // Validasi nomor WhatsApp
    if (!formData.whatsappNumber.match(/^(\+62|62|0)[0-9]{9,12}$/)) {
      toast.error("Format nomor WhatsApp tidak valid!");
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const photoBase64 = reader.result as string;
      
      createRegistration.mutate({
        ...formData,
        photoBase64,
        photoMimeType: photoFile.type,
      } as any);
    };
    
    reader.readAsDataURL(photoFile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20">
      <div className="container mx-auto px-6 max-w-2xl">
        <Card className="bg-slate-800/50 border-cyan-400/20">
          <CardHeader>
            <CardTitle className="text-3xl font-mono text-center">
              <span className="bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
                FORM PENDAFTARAN
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-cyan-400">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap"
                  className="bg-slate-700/50 border-cyan-400/20 text-white"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-cyan-400">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Masukkan email"
                  className="bg-slate-700/50 border-cyan-400/20 text-white"
                />
              </div>

              {/* WhatsApp Number */}
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber" className="text-cyan-400">Nomor WhatsApp</Label>
                <Input
                  id="whatsappNumber"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleInputChange}
                  placeholder="Contoh: 0812345678"
                  className="bg-slate-700/50 border-cyan-400/20 text-white"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-cyan-400">Jenis Kelamin</Label>
                <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                  <SelectTrigger className="bg-slate-700/50 border-cyan-400/20 text-white">
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Birth Place */}
              <div className="space-y-2">
                <Label htmlFor="birthPlace" className="text-cyan-400">Tempat Lahir</Label>
                <Input
                  id="birthPlace"
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleInputChange}
                  placeholder="Masukkan tempat lahir"
                  className="bg-slate-700/50 border-cyan-400/20 text-white"
                />
              </div>

              {/* Birth Date */}
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-cyan-400">Tanggal Lahir</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="bg-slate-700/50 border-cyan-400/20 text-white"
                />
              </div>

              {/* Profession */}
              <div className="space-y-2">
                <Label htmlFor="profession" className="text-cyan-400">Profesi</Label>
                <Input
                  id="profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleInputChange}
                  placeholder="Masukkan profesi"
                  className="bg-slate-700/50 border-cyan-400/20 text-white"
                />
              </div>

              {/* Province */}
              <div className="space-y-2">
                <Label htmlFor="province" className="text-cyan-400">Provinsi</Label>
                <Select value={formData.province} onValueChange={(value) => handleSelectChange("province", value)}>
                  <SelectTrigger className="bg-slate-700/50 border-cyan-400/20 text-white">
                    <SelectValue placeholder="Pilih provinsi" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDONESIAN_PROVINCES.map((province) => (
                      <SelectItem key={province} value={province}>{province}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-cyan-400">Kategori</Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                  <SelectTrigger className="bg-slate-700/50 border-cyan-400/20 text-white">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Acting">Acting</SelectItem>
                    <SelectItem value="Vocal">Vocal</SelectItem>
                    <SelectItem value="Model">Model</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-cyan-400">Alamat</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Masukkan alamat lengkap"
                  className="bg-slate-700/50 border-cyan-400/20 text-white"
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label htmlFor="photo" className="text-cyan-400">Foto Terbaru</Label>
                <div className="border-2 border-dashed border-cyan-400/30 rounded-lg p-6 text-center hover:border-cyan-400/50 transition-colors">
                  {photoPreview ? (
                    <div className="space-y-4">
                      <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded mx-auto" />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(null);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 mx-auto"
                      >
                        <X size={16} /> Hapus foto
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={32} className="text-cyan-400" />
                        <span className="text-cyan-400">Klik untuk upload foto</span>
                      </div>
                      <input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={createRegistration.isPending}
                className="w-full bg-gradient-to-r from-pink-500 to-cyan-400 text-slate-950 font-mono font-bold text-lg py-6"
              >
                {createRegistration.isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Sedang memproses...
                  </>
                ) : (
                  "Daftar Sekarang"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
