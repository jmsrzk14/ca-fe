'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Calendar,
    Mail,
    Phone,
    MapPin,
    User,
    Building2,
    Save,
    Loader2,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Heart,
    Home,
    GraduationCap,
    Briefcase,
    Store,
    Activity,
    UserPlus,
    Building
} from 'lucide-react';
import { t } from '@/shared/lib/t';
import { toast } from 'sonner';
import { applicantService } from '@/core/api';
import { ApplicantType } from '@/shared/types/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { cn } from '@/shared/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';

interface ApplicantFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

const STEPS = [
    { id: 'identitas', title: t`Identitas`, icon: User },
    { id: 'pasangan', title: t`Pasangan`, icon: Heart },
    { id: 'kontak', title: t`Kontak & Alamat`, icon: MapPin },
    { id: 'rumah_tangga', title: t`Profil Rumah Tangga`, icon: Home },
    { id: 'pendidikan', title: t`Pendidikan & Sosial`, icon: GraduationCap },
    { id: 'pekerjaan', title: t`Pekerjaan`, icon: Briefcase },
    { id: 'usaha', title: t`Usaha`, icon: Store },
    { id: 'karakter', title: t`Karakter & Perilaku`, icon: Activity },
];

const STEP_FIELDS: Record<number, string[]> = {
    0: ['fullName', 'identityNumber', 'birthPlace', 'birthDate', 'gender', 'nationality', 'maritalStatus', 'motherName', 'taxId'],
    1: ['spouseFullName', 'spouseIdentityNumber', 'spouseBirthPlace', 'spouseBirthDate', 'spouseGender', 'spouseNationality', 'spouseMotherName', 'spouseTaxId', 'marriageOrder'],
    2: ['phoneDay', 'phoneAlt', 'email', 'addressKtp', 'subdistrictKtp', 'districtKtp', 'cityKtp', 'provinceKtp', 'postalCodeKtp', 'addressDom', 'subdistrictDom', 'districtDom', 'cityDom', 'provinceDom', 'postalCodeDom', 'stayDuration', 'homeOwnership', 'branchDistance'],
    3: ['dependentsCount', 'householdMemberCount', 'earningMemberCount', 'debtorMemberCount', 'spouseJobStatus', 'spouseIncome', 'totalHouseholdIncome', 'totalHouseholdExpense'],
    4: ['lastEducation', 'major', 'certification', 'socialRole', 'isKnownInArea'],
    5: ['jobStatus', 'companyName', 'companyIndustry', 'workAddress', 'position', 'workDuration', 'workPhone', 'monthlyNetSalary', 'otherRegularIncome', 'salaryPaymentMethod', 'workVerificationStatus'],
    6: ['businessName', 'businessType', 'businessSector', 'businessDuration', 'businessAddress', 'businessOwnership', 'employeeCount', 'monthlyBusinessIncome'],
    7: ['paymentDisciplinePerception', 'internalDefaultHistory', 'jobChangeFrequency', 'addressChangeFrequency', 'lifestyleIndication', 'fraudIndication'],
};

export function ApplicantForm({ onSuccess, onCancel }: ApplicantFormProps) {
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = React.useState(0);
    const [type, setType] = React.useState<ApplicantType>('PERSONAL');
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

    // Form state to persist data across steps
    const [formData, setFormData] = React.useState<Record<string, any>>({
        applicantType: 'PERSONAL',
        fullName: '',
        identityNumber: '',
        taxId: '',
        birthDate: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Mutation for creating applicant
    const mutation = useMutation({
        mutationFn: (data: any) => applicantService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applicants'] });
            toast.success(t`Applicant created successfully`);
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(error.message || t`Failed to create applicant`);
        },
    });

    const validateStep = (stepIndex: number) => {
        const fields = STEP_FIELDS[stepIndex];
        if (!fields) return true;

        const missingFields = fields.filter(f => !formData[f] || (typeof formData[f] === 'string' && formData[f].trim() === ''));

        if (missingFields.length > 0) {
            toast.error(t`Harap isi semua kolom sebelum melanjutkan`);
            return false;
        }
        return true;
    };

    const nextStep = () => {
        if (!validateStep(currentStep)) return;

        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // If it's the final submission and dialog not shown yet
        if (!isConfirmOpen) {
            if (!validateStep(currentStep)) return;
            setIsConfirmOpen(true);
            return;
        }

        performSubmit();
    };

    const performSubmit = () => {
        setIsConfirmOpen(false);
        // Map everything else to attributes (EAV)
        const coreFields = ['fullName', 'identityNumber', 'taxId', 'birthDate', 'applicantType'];
        const attributes = Object.entries(formData)
            .filter(([key, value]) => !coreFields.includes(key) && value)
            .map(([key, value]) => ({
                key,
                value: String(value),
                dataType: 'STRING'
            }));

        const payload = {
            applicantType: type,
            fullName: formData.fullName,
            identityNumber: formData.identityNumber,
            taxId: formData.taxId,
            birthDate: formData.birthDate,
            attributes
        };

        mutation.mutate(payload);
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Identitas
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor="fullName" className="text-sm font-medium">{t`Nama lengkap sesuai dengan KTP`} <span className="text-orange-600">*</span></Label>
                                <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="identityNumber" className="text-sm font-medium">{t`NIK`} <span className="text-orange-600">*</span></Label>
                                <Input id="identityNumber" name="identityNumber" value={formData.identityNumber} onChange={handleInputChange} required className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="birthPlace" className="text-sm font-medium">{t`Tempat lahir`}</Label>
                                <Input id="birthPlace" name="birthPlace" value={formData.birthPlace} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="birthDate" className="text-sm font-medium">{t`Tanggal lahir`} <span className="text-orange-600">*</span></Label>
                                <Input id="birthDate" name="birthDate" type="date" value={formData.birthDate || ''} onChange={handleInputChange} required className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">{t`Jenis kelamin`}</Label>
                                <Select onValueChange={(v) => handleSelectChange('gender', v)} value={formData.gender}>
                                    <SelectTrigger className="rounded-xl h-11">
                                        <SelectValue placeholder={t`Pilih jenis kelamin`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">{t`Laki-laki`}</SelectItem>
                                        <SelectItem value="FEMALE">{t`Perempuan`}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nationality" className="text-sm font-medium">{t`Kewarganegaraan`}</Label>
                                <Input id="nationality" name="nationality" value={formData.nationality} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">{t`Status perkawinan`}</Label>
                                <Select onValueChange={(v) => handleSelectChange('maritalStatus', v)} value={formData.maritalStatus}>
                                    <SelectTrigger className="rounded-xl h-11">
                                        <SelectValue placeholder={t`Pilih status`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SINGLE">{t`Belum Menikah`}</SelectItem>
                                        <SelectItem value="MARRIED">{t`Menikah`}</SelectItem>
                                        <SelectItem value="DIVORCED">{t`Cerai`}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="motherName" className="text-sm font-medium">{t`Nama ibu kandung`}</Label>
                                <Input id="motherName" name="motherName" value={formData.motherName} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="taxId" className="text-sm font-medium">{t`NPWP`}</Label>
                                <Input id="taxId" name="taxId" value={formData.taxId} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                        </div>
                    </div>
                );
            case 1: // Pasangan
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor="spouseFullName" className="text-sm font-medium">{t`Nama lengkap pasangan sesuai dengan KTP`}</Label>
                                <Input id="spouseFullName" name="spouseFullName" value={formData.spouseFullName} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="spouseIdentityNumber" className="text-sm font-medium">{t`NIK Pasangan`}</Label>
                                <Input id="spouseIdentityNumber" name="spouseIdentityNumber" value={formData.spouseIdentityNumber} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="spouseBirthPlace" className="text-sm font-medium">{t`Tempat lahir pasangan`}</Label>
                                <Input id="spouseBirthPlace" name="spouseBirthPlace" value={formData.spouseBirthPlace} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="spouseBirthDate" className="text-sm font-medium">{t`Tanggal lahir pasangan`}</Label>
                                <Input id="spouseBirthDate" name="spouseBirthDate" type="date" value={formData.spouseBirthDate} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">{t`Jenis kelamin pasangan`}</Label>
                                <Select onValueChange={(v) => handleSelectChange('spouseGender', v)} value={formData.spouseGender}>
                                    <SelectTrigger className="rounded-xl h-11">
                                        <SelectValue placeholder={t`Pilih jenis kelamin`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">{t`Laki-laki`}</SelectItem>
                                        <SelectItem value="FEMALE">{t`Perempuan`}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="spouseNationality" className="text-sm font-medium">{t`Kewarganegaraan pasangan`}</Label>
                                <Input id="spouseNationality" name="spouseNationality" value={formData.spouseNationality} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="spouseMotherName" className="text-sm font-medium">{t`Nama ibu kandung pasangan`}</Label>
                                <Input id="spouseMotherName" name="spouseMotherName" value={formData.spouseMotherName} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="spouseTaxId" className="text-sm font-medium">{t`NPWP Pasangan`}</Label>
                                <Input id="spouseTaxId" name="spouseTaxId" value={formData.spouseTaxId} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="marriageOrder" className="text-sm font-medium">{t`Perkawinan ke`}</Label>
                                <Input id="marriageOrder" name="marriageOrder" type="number" value={formData.marriageOrder} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                        </div>
                    </div>
                );
            case 2: // Kontak & Alamat
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
                        <section className="space-y-6 p-6 rounded-2xl bg-muted/20 border border-border/50">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-orange-600 flex items-center gap-2">
                                <Phone className="h-4 w-4" /> {t`Kontak`}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="phoneDay" className="text-sm font-medium">{t`No HP Utama`} <span className="text-orange-600">*</span></Label>
                                    <Input id="phoneDay" name="phoneDay" value={formData.phoneDay} onChange={handleInputChange} required className="rounded-xl h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phoneAlt" className="text-sm font-medium">{t`No HP Alternatif`}</Label>
                                    <Input id="phoneAlt" name="phoneAlt" value={formData.phoneAlt} onChange={handleInputChange} className="rounded-xl h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">{t`Email`}</Label>
                                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="rounded-xl h-11" />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6 p-6 rounded-2xl bg-muted/20 border border-border/50">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-orange-600 flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> {t`Alamat Sesuai KTP`}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                    <Label htmlFor="addressKtp" className="text-sm font-medium">{t`Alamat Sesuai KTP`}</Label>
                                    <Input id="addressKtp" name="addressKtp" value={formData.addressKtp} onChange={handleInputChange} className="rounded-xl h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subdistrictKtp" className="text-sm font-medium">{t`Kelurahan sesuai KTP`}</Label>
                                    <Input id="subdistrictKtp" name="subdistrictKtp" value={formData.subdistrictKtp} onChange={handleInputChange} className="rounded-xl h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="districtKtp" className="text-sm font-medium">{t`Kecamatan sesuai KTP`}</Label>
                                    <Input id="districtKtp" name="districtKtp" value={formData.districtKtp} onChange={handleInputChange} className="rounded-xl h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cityKtp" className="text-sm font-medium">{t`Kota sesuai KTP`}</Label>
                                    <Input id="cityKtp" name="cityKtp" value={formData.cityKtp} onChange={handleInputChange} className="rounded-xl h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="provinceKtp" className="text-sm font-medium">{t`Provinsi sesuai KTP`}</Label>
                                    <Input id="provinceKtp" name="provinceKtp" value={formData.provinceKtp} onChange={handleInputChange} className="rounded-xl h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="postalCodeKtp" className="text-sm font-medium">{t`Kode Pos sesuai KTP`}</Label>
                                    <Input id="postalCodeKtp" name="postalCodeKtp" value={formData.postalCodeKtp} onChange={handleInputChange} className="rounded-xl h-11" />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6 p-6 rounded-2xl bg-muted/20 border border-border/50">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-orange-600 flex items-center gap-2">
                                <Home className="h-4 w-4" /> {t`Alamat Sesuai Domisili`}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                    <Label htmlFor="addressDom" className="text-sm font-medium">{t`Alamat sesuai Domisili`}</Label>
                                    <Input id="addressDom" name="addressDom" value={formData.addressDom} onChange={handleInputChange} className="rounded-xl h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subdistrictDom" className="text-sm font-medium">{t`Kelurahan sesuai Domisili`}</Label>
                                    <Input id="subdistrictDom" name="subdistrictDom" value={formData.subdistrictDom} onChange={handleInputChange} className="rounded-xl h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="districtDom" className="text-sm font-medium">{t`Kecamatan sesuai Domisili`}</Label>
                                    <Input id="districtDom" name="districtDom" value={formData.districtDom} onChange={handleInputChange} className="rounded-xl h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cityDom" className="text-sm font-medium">{t`Kota sesuai Domisili`}</Label>
                                    <Input id="cityDom" name="cityDom" value={formData.cityDom} onChange={handleInputChange} className="rounded-xl h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="provinceDom" className="text-sm font-medium">{t`Provinsi sesuai Domisili`}</Label>
                                    <Input id="provinceDom" name="provinceDom" value={formData.provinceDom} onChange={handleInputChange} className="rounded-xl h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="postalCodeDom" className="text-sm font-medium">{t`Kode Pos sesuai Domisili`}</Label>
                                    <Input id="postalCodeDom" name="postalCodeDom" value={formData.postalCodeDom} onChange={handleInputChange} className="rounded-xl h-11" />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6 p-6 rounded-2xl bg-muted/20 border border-border/50">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-orange-600 flex items-center gap-2">
                                <Activity className="h-4 w-4" /> {t`Lainnya`}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="stayDuration" className="text-sm font-medium">{t`Lama tinggal di alamat ini`}</Label>
                                    <Input id="stayDuration" name="stayDuration" value={formData.stayDuration} onChange={handleInputChange} className="rounded-xl h-11" placeholder={t`Misal: 5 Tahun`} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">{t`Status kepemilikan rumah`}</Label>
                                    <Select onValueChange={(v) => handleSelectChange('homeOwnership', v)} value={formData.homeOwnership}>
                                        <SelectTrigger className="rounded-xl h-11">
                                            <SelectValue placeholder={t`Pilih status`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OWNED">{t`Milik Sendiri`}</SelectItem>
                                            <SelectItem value="RENTED">{t`Sewa/Kontrak`}</SelectItem>
                                            <SelectItem value="FAMILY">{t`Milik Keluarga`}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="branchDistance" className="text-sm font-medium">{t`Perkiraan jarak kantor cabang (km)`}</Label>
                                    <Input id="branchDistance" name="branchDistance" type="number" value={formData.branchDistance} onChange={handleInputChange} className="rounded-xl h-11" />
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 3: // Profil Rumah Tangga
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="dependentsCount" className="text-sm font-medium">{t`Jumlah tanggungan`}</Label>
                                <Input id="dependentsCount" name="dependentsCount" type="number" value={formData.dependentsCount} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="householdMemberCount" className="text-sm font-medium">{t`Jumlah anggota rumah tangga`}</Label>
                                <Input id="householdMemberCount" name="householdMemberCount" type="number" value={formData.householdMemberCount} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="earningMemberCount" className="text-sm font-medium">{t`Jumlah anggota rumah tangga berpenghasilan`}</Label>
                                <Input id="earningMemberCount" name="earningMemberCount" type="number" value={formData.earningMemberCount} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="debtorMemberCount" className="text-sm font-medium">{t`Jumlah anggota rumah tangga berhutang`}</Label>
                                <Input id="debtorMemberCount" name="debtorMemberCount" type="number" value={formData.debtorMemberCount} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="spouseJobStatus" className="text-sm font-medium">{t`Status pekerjaan pasangan`}</Label>
                                <Input id="spouseJobStatus" name="spouseJobStatus" value={formData.spouseJobStatus} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="spouseIncome" className="text-sm font-medium">{t`Penghasilan pasangan`}</Label>
                                <Input id="spouseIncome" name="spouseIncome" type="number" value={formData.spouseIncome} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="totalHouseholdIncome" className="text-sm font-medium">{t`Total penghasilan rumah tangga`}</Label>
                                <Input id="totalHouseholdIncome" name="totalHouseholdIncome" type="number" value={formData.totalHouseholdIncome} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="totalHouseholdExpense" className="text-sm font-medium">{t`Total pengeluaran rumah tangga`}</Label>
                                <Input id="totalHouseholdExpense" name="totalHouseholdExpense" type="number" value={formData.totalHouseholdExpense} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                        </div>
                    </div>
                );
            case 4: // Pendidikan & Sosial
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">{t`Pendidikan terakhir`}</Label>
                                <Select onValueChange={(v) => handleSelectChange('lastEducation', v)} value={formData.lastEducation}>
                                    <SelectTrigger className="rounded-xl h-11">
                                        <SelectValue placeholder={t`Pilih Pendidikan`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SMA">{t`SMA/Sederajat`}</SelectItem>
                                        <SelectItem value="D3">{t`D3`}</SelectItem>
                                        <SelectItem value="S1">{t`S1`}</SelectItem>
                                        <SelectItem value="S2">{t`S2`}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor="major" className="text-sm font-medium">{t`Jurusan pendidikan`}</Label>
                                <Input id="major" name="major" value={formData.major} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="certification" className="text-sm font-medium">{t`Sertifikasi profesi`}</Label>
                                <Input id="certification" name="certification" value={formData.certification} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="socialRole" className="text-sm font-medium">{t`Peran sosial di masyarakat`}</Label>
                                <Input id="socialRole" name="socialRole" value={formData.socialRole} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="isKnownInArea" className="text-sm font-medium">{t`Apakah dikenal lingkungan setempat`}</Label>
                                <Select onValueChange={(v) => handleSelectChange('isKnownInArea', v)} value={formData.isKnownInArea}>
                                    <SelectTrigger className="rounded-xl h-11">
                                        <SelectValue placeholder={t`Pilih Jawaban`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="YES">{t`Ya`}</SelectItem>
                                        <SelectItem value="NO">{t`Tidak`}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                );
            case 5: // Pekerjaan
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">{t`Status pekerjaan`}</Label>
                                <Select onValueChange={(v) => handleSelectChange('jobStatus', v)} value={formData.jobStatus}>
                                    <SelectTrigger className="rounded-xl h-11">
                                        <SelectValue placeholder={t`Pilih Status`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERMANENT">{t`Karyawan Tetap`}</SelectItem>
                                        <SelectItem value="CONTRACT">{t`Karyawan Kontrak`}</SelectItem>
                                        <SelectItem value="SELF_EMPLOYED">{t`Wiraswasta`}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="companyName" className="text-sm font-medium">{t`Nama perusahaan`}</Label>
                                <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="companyIndustry" className="text-sm font-medium">{t`Industri perusahaan`}</Label>
                                <Input id="companyIndustry" name="companyIndustry" value={formData.companyIndustry} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                <Label htmlFor="workAddress" className="text-sm font-medium">{t`Alamat tempat kerja`}</Label>
                                <Input id="workAddress" name="workAddress" value={formData.workAddress} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="position" className="text-sm font-medium">{t`Jabatan`}</Label>
                                <Input id="position" name="position" value={formData.position} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="workDuration" className="text-sm font-medium">{t`Lama bekerja (Tahun)`}</Label>
                                <Input id="workDuration" name="workDuration" type="number" value={formData.workDuration} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="workPhone" className="text-sm font-medium">{t`No telp perusahaan`}</Label>
                                <Input id="workPhone" name="workPhone" value={formData.workPhone} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="monthlyNetSalary" className="text-sm font-medium">{t`Gaji bersih bulanan`}</Label>
                                <Input id="monthlyNetSalary" name="monthlyNetSalary" type="number" value={formData.monthlyNetSalary} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="otherRegularIncome" className="text-sm font-medium">{t`Penghasilan lain rutin`}</Label>
                                <Input id="otherRegularIncome" name="otherRegularIncome" type="number" value={formData.otherRegularIncome} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="salaryPaymentMethod" className="text-sm font-medium">{t`Metode pembayaran gaji`}</Label>
                                <Input id="salaryPaymentMethod" name="salaryPaymentMethod" value={formData.salaryPaymentMethod} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="workVerificationStatus" className="text-sm font-medium">{t`Status verifikasi pekerjaan`}</Label>
                                <Input id="workVerificationStatus" name="workVerificationStatus" value={formData.workVerificationStatus} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                        </div>
                    </div>
                );
            case 6: // Usaha
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor="businessName" className="text-sm font-medium">{t`Nama usaha`}</Label>
                                <Input id="businessName" name="businessName" value={formData.businessName} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="businessType" className="text-sm font-medium">{t`Jenis usaha`}</Label>
                                <Input id="businessType" name="businessType" value={formData.businessType} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="businessSector" className="text-sm font-medium">{t`Sektor usaha`}</Label>
                                <Input id="businessSector" name="businessSector" value={formData.businessSector} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="businessDuration" className="text-sm font-medium">{t`lama berusaha (Tahun)`}</Label>
                                <Input id="businessDuration" name="businessDuration" type="number" value={formData.businessDuration} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                <Label htmlFor="businessAddress" className="text-sm font-medium">{t`Alamat usaha`}</Label>
                                <Input id="businessAddress" name="businessAddress" value={formData.businessAddress} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="businessOwnership" className="text-sm font-medium">{t`Status kepemilikan tempat usaha`}</Label>
                                <Input id="businessOwnership" name="businessOwnership" value={formData.businessOwnership} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="employeeCount" className="text-sm font-medium">{t`Jumlah karyawan`}</Label>
                                <Input id="employeeCount" name="employeeCount" type="number" value={formData.employeeCount} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="monthlyBusinessIncome" className="text-sm font-medium">{t`Penghasilan bulanan`}</Label>
                                <Input id="monthlyBusinessIncome" name="monthlyBusinessIncome" type="number" value={formData.monthlyBusinessIncome} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                        </div>
                    </div>
                );
            case 7: // Karakter & Perilaku
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">{t`Persepsi kedisiplinan bayar`}</Label>
                                <Select onValueChange={(v) => handleSelectChange('paymentDisciplinePerception', v)} value={formData.paymentDisciplinePerception}>
                                    <SelectTrigger className="rounded-xl h-11">
                                        <SelectValue placeholder={t`Pilih Persepsi`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VERY_GOOD">{t`Sangat Disiplin`}</SelectItem>
                                        <SelectItem value="GOOD">{t`Cukup Disiplin`}</SelectItem>
                                        <SelectItem value="POOR">{t`Kurang Disiplin`}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="internalDefaultHistory" className="text-sm font-medium">{t`Riwayat gagal bayar (internal)`}</Label>
                                <Input id="internalDefaultHistory" name="internalDefaultHistory" value={formData.internalDefaultHistory} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jobChangeFrequency" className="text-sm font-medium">{t`Frekuensi pindah kerja`}</Label>
                                <Input id="jobChangeFrequency" name="jobChangeFrequency" value={formData.jobChangeFrequency} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="addressChangeFrequency" className="text-sm font-medium">{t`Frekuensi pindah alamat`}</Label>
                                <Input id="addressChangeFrequency" name="addressChangeFrequency" value={formData.addressChangeFrequency} onChange={handleInputChange} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lifestyleIndication" className="text-sm font-medium">{t`Indikasi gaya hidup lebih besar dari penghasilan`}</Label>
                                <Select onValueChange={(v) => handleSelectChange('lifestyleIndication', v)} value={formData.lifestyleIndication}>
                                    <SelectTrigger className="rounded-xl h-11">
                                        <SelectValue placeholder={t`Pilih Jawaban`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="YES">{t`Ya`}</SelectItem>
                                        <SelectItem value="NO">{t`Tidak`}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">{t`Indikasi fraud`}</Label>
                                <Select onValueChange={(v) => handleSelectChange('fraudIndication', v)} value={formData.fraudIndication}>
                                    <SelectTrigger className="rounded-xl h-11">
                                        <SelectValue placeholder={t`Pilih Indikasi`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NONE">{t`Tidak Ada`}</SelectItem>
                                        <SelectItem value="LOW">{t`Rendah`}</SelectItem>
                                        <SelectItem value="HIGH">{t`Tinggi`}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-background/50 rounded-3xl border border-border/50 overflow-hidden shadow-2xl backdrop-blur-sm">
            {/* Multi-step Header */}
            <div className="hidden lg:flex border-b border-border/50 bg-muted/20">
                {STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "flex-1 flex items-center justify-center py-5 px-3 gap-2 transition-all cursor-pointer border-b-2 relative",
                                isActive ? "bg-orange-500/5 border-orange-500 text-orange-600" :
                                    isCompleted ? "bg-green-500/5 border-green-500 text-green-600" :
                                        "border-transparent text-muted-foreground hover:bg-muted/30"
                            )}
                            onClick={() => index <= currentStep && setCurrentStep(index)}
                        >
                            <div className={cn(
                                "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                isActive ? "bg-orange-600 text-white" :
                                    isCompleted ? "bg-green-600 text-white" :
                                        "bg-muted-foreground/20"
                            )}>
                                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Mobile Step Header */}
            <div className="lg:hidden p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white font-bold">
                        {currentStep + 1}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-foreground">{STEPS[currentStep].title}</h3>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{t`Langkah`} {currentStep + 1} {t`dari`} {STEPS.length}</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    {STEPS.map((_, i) => (
                        <div key={i} className={cn("h-1 w-4 rounded-full", i === currentStep ? "bg-orange-600" : i < currentStep ? "bg-green-600" : "bg-muted")} />
                    ))}
                </div>
            </div>

            {/* Type Switch (Only on Step 1) */}
            {currentStep === 0 && (
                <div className="px-8 pt-8">
                    <Tabs
                        value={type}
                        onValueChange={(v) => {
                            const newType = v as ApplicantType;
                            setType(newType);
                            setFormData(prev => ({ ...prev, applicantType: newType }));
                        }}
                        className="w-full"
                    >
                        <TabsList className="grid w-80 grid-cols-2 bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="PERSONAL" className="rounded-lg gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white h-9">
                                <User className="h-4 w-4" />
                                {t`Person`}
                            </TabsTrigger>
                            <TabsTrigger value="CORPORATE" className="rounded-lg gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white h-9">
                                <Building2 className="h-4 w-4" />
                                {t`Company`}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            )}

            <div className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-250px)]">
                <form id="applicant-form" onSubmit={handleSubmit}>
                    {renderStepContent()}
                </form>
            </div>

            {/* Navigation Footer */}
            <div className="p-8 border-t border-border/50 bg-muted/30 flex items-center justify-between">
                <div className="flex gap-3">
                    {currentStep === 0 ? (
                        onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl px-8 h-12 font-bold"
                                onClick={onCancel}
                            >
                                {t`Batal`}
                            </Button>
                        )
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl px-8 h-12 font-bold gap-2"
                            onClick={prevStep}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            {t`Sebelumnya`}
                        </Button>
                    )}
                </div>

                <div className="flex gap-3">
                    {currentStep < STEPS.length - 1 ? (
                        <Button
                            type="button"
                            className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-8 h-12 font-bold gap-2 shadow-lg shadow-orange-600/20"
                            onClick={nextStep}
                        >
                            {t`Langkah Berikutnya`}
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            form="applicant-form"
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-12 h-12 font-bold gap-2 shadow-lg shadow-green-600/20"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5" />
                            )}
                            {t`Ajukan Pinjaman`}
                        </Button>
                    )}
                </div>
            </div>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t`Konfirmasi Pengajuan`}</DialogTitle>
                        <DialogDescription>
                            {t`Apakah Anda yakin data yang diisi sudah benar? Data akan segera diproses.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={mutation.isPending}>
                            {t`Batal`}
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => performSubmit()} disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {t`Ya, Ajukan Sekarang`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
