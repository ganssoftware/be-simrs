const dashboardModel = require("../models/dashboardModel");


const getDashboard = async (req, res) => {
    try {
        const summary =
            await dashboardModel.getDashboardSummary();

        return res.json({
            success: true,
            data: summary,
        });
    } catch (error) {
        console.error("getDashboard:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data dashboard",
        });
    }
};


const getTodayQueue = async (req, res) => {
    try {
        const { polyclinic_id } = req.query;

        const data =
            await dashboardModel.getTodayQueue(
                polyclinic_id || null
            );

        return res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("getTodayQueue:", error);

        return res.status(500).json({
            success: false,
            message: "Gagal mengambil antrean hari ini",
        });
    }
};


const getCurrentCalledPatients = async (req, res) => {
    try {
        const { polyclinic_id } = req.query;

        const data =
            await dashboardModel.getCurrentCalledPatients(
                polyclinic_id || null
            );

        return res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "getCurrentCalledPatients:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Gagal mengambil pasien yang sedang dipanggil",
        });
    }
};


const getTodayByPolyclinic = async (req, res) => {
    try {
        const data =
            await dashboardModel
                .getTodayRegistrationsByPolyclinic();

        return res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "getTodayByPolyclinic:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Gagal mengambil statistik poli",
        });
    }
};


const getLowStockMedicines = async (req, res) => {
    try {
        const data =
            await dashboardModel
                .getLowStockMedicines();

        return res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "getLowStockMedicines:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Gagal mengambil data stok obat",
        });
    }
};


const getRegistrationTrend = async (req, res) => {
    try {
        const data =
            await dashboardModel
                .getRegistrationTrend();

        return res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "getRegistrationTrend:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Gagal mengambil grafik registrasi",
        });
    }
};


module.exports = {
    getDashboard,
    getTodayQueue,
    getCurrentCalledPatients,
    getTodayByPolyclinic,
    getLowStockMedicines,
    getRegistrationTrend,
};