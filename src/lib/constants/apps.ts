const isProd = process.env.NODE_ENV === 'production';

const getLaunchUrl = (prodUrl: string, devUrl: string) => {
    return isProd ? prodUrl : devUrl;
};

export const ALL_APPLICATIONS = [
    {
        id: "a00e74e3-4eef-4b23-9470-a58b58ae963b",
        app_code: "IAM",
        app_name: "Identity & Access Management",
        launch_url: getLaunchUrl("https://iam.holding-perkebunan.com", "http://localhost:3004"),
        icon_name: "ShieldCheck",
        description: "Manajemen identitas dan hak akses terpusat bagi administrator IT PTPN.",
        category: "Security",
        is_pwa: true
    },
    {
        id: "bc26bd74-b0c5-4656-99c9-3b250c1bc806",
        app_code: "HC_CMD", // Updated to match IAM
        app_name: "HC Executive Command Center",
        launch_url: getLaunchUrl("https://ecc.holding-perkebunan.com", "http://localhost:3007"),
        icon_name: "Activity",
        description: "Dashboard eksekutif untuk pemantauan risiko, talenta, dan metrik strategis.",
        category: "Executive",
        is_pwa: true
    },
    {
        id: "74fe6cf1-6ef4-440d-bcce-0c298958c022",
        app_code: "STRATEGIC", // Updated to match IAM
        app_name: "Strategic Dashboard",
        launch_url: getLaunchUrl("https://dashboard.holding-perkebunan.com", "http://localhost:3002"),
        icon_name: "BarChart3",
        description: "Visualisasi KPI strategis dan monitoring target korporat PTPN Group.",
        category: "Executive",
        is_pwa: false
    },
    {
        id: "9aad054f-af61-41ca-bc61-44c29382a3fa",
        app_code: "HC_INIT",
        app_name: "HC Initiatives Tracker",
        launch_url: getLaunchUrl("https://hctracker.holding-perkebunan.com", "http://localhost:3003"),
        icon_name: "Layers",
        description: "Pelacakan kemajuan inisiatif strategis dan manajemen program kerja multi-unit.",
        category: "Management",
        is_pwa: true
    },
    {
        id: "c751d858-bb8a-4bb2-bebf-317ff89034a0",
        app_code: "IHCMIS", // Updated to match IAM
        app_name: "IHCMIS Portal",
        launch_url: getLaunchUrl("https://ihcmis.holding-perkebunan.com", "http://localhost:3001"),
        icon_name: "Users",
        description: "Akses mandiri administrasi human capital dan absensi karyawan digital.",
        category: "Human Capital",
        is_pwa: true
    },
    {
        id: "5e88fdc5-c617-43c9-9d72-4b2f340c72ef",
        app_code: "ESS",
        app_name: "Employee Self Service",
        launch_url: getLaunchUrl("https://ess.holding-perkebunan.com", "http://localhost:3006"),
        icon_name: "Briefcase",
        description: "Layanan mandiri karyawan untuk pengajuan cuti, lembur, dan data pribadi.",
        category: "Operational",
        is_pwa: true
    },
    {
        id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        app_code: "PLATFORM",
        app_name: "Platform Services Console",
        launch_url: getLaunchUrl("https://pps.holding-perkebunan.com", "http://localhost:3008"),
        icon_name: "Globe",
        description: "Pusat kendali layanan integrasi, notifikasi, dan workflow lintas aplikasi.",
        category: "Infrastructure",
        is_pwa: false
    },
    {
        id: "d4e5f6g7-h8i9-0123-4567-890abcdef123", // Generated Placeholder ID
        app_code: "HCDATAHUB",
        app_name: "HC Data Control Tower",
        launch_url: getLaunchUrl("https://dct.holding-perkebunan.com", "http://localhost:3005"),
        icon_name: "Database",
        description: "Centralized human capital data management and synchronization hub.",
        category: "Infrastructure",
        is_pwa: false
    }
];
