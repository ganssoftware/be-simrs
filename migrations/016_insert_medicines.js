exports.up = (pgm) => {
    pgm.sql(`
        INSERT INTO medicines
            (code, name, unit, stock, price, is_active)
        VALUES
            ('OBT001', 'Paracetamol 500 mg', 'Tablet', 150, 500.00, true),
            ('OBT002', 'Paracetamol 650 mg', 'Tablet', 120, 750.00, true),
            ('OBT003', 'Ibuprofen 400 mg', 'Tablet', 100, 1200.00, true),
            ('OBT004', 'Amoxicillin 500 mg', 'Kapsul', 80, 1500.00, true),
            ('OBT005', 'Amoxicillin 250 mg', 'Kapsul', 75, 1000.00, true),
            ('OBT006', 'Cefadroxil 500 mg', 'Kapsul', 60, 2500.00, true),
            ('OBT007', 'Cefixime 100 mg', 'Kapsul', 50, 3500.00, true),
            ('OBT008', 'Cefixime 200 mg', 'Kapsul', 45, 5000.00, true),
            ('OBT009', 'Azithromycin 500 mg', 'Tablet', 40, 4500.00, true),
            ('OBT010', 'Metronidazole 500 mg', 'Tablet', 90, 1000.00, true),
            ('OBT011', 'Omeprazole 20 mg', 'Kapsul', 100, 1200.00, true),
            ('OBT012', 'Lansoprazole 30 mg', 'Kapsul', 70, 2000.00, true),
            ('OBT013', 'Antasida DOEN', 'Tablet', 130, 500.00, true),
            ('OBT014', 'Famotidine 20 mg', 'Tablet', 80, 1500.00, true),
            ('OBT015', 'Domperidone 10 mg', 'Tablet', 65, 1000.00, true),
            ('OBT016', 'Ondansetron 4 mg', 'Tablet', 50, 2500.00, true),
            ('OBT017', 'Loperamide 2 mg', 'Kapsul', 45, 1200.00, true),
            ('OBT018', 'Bisacodyl 5 mg', 'Tablet', 55, 800.00, true),
            ('OBT019', 'Sucralfate 500 mg', 'Tablet', 60, 1800.00, true),
            ('OBT020', 'Oralit', 'Sachet', 200, 1000.00, true),
            ('OBT021', 'Cetirizine 10 mg', 'Tablet', 100, 700.00, true),
            ('OBT022', 'Loratadine 10 mg', 'Tablet', 85, 1000.00, true),
            ('OBT023', 'CTM 4 mg', 'Tablet', 120, 300.00, true),
            ('OBT024', 'Dexamethasone 0.5 mg', 'Tablet', 70, 500.00, true),
            ('OBT025', 'Prednisone 5 mg', 'Tablet', 50, 1000.00, true),
            ('OBT026', 'Salbutamol 2 mg', 'Tablet', 65, 500.00, true),
            ('OBT027', 'Salbutamol Inhaler', 'Inhaler', 30, 45000.00, true),
            ('OBT028', 'Ambroxol 30 mg', 'Tablet', 80, 800.00, true),
            ('OBT029', 'Bromhexine 8 mg', 'Tablet', 75, 700.00, true),
            ('OBT030', 'Guaifenesin 100 mg', 'Tablet', 90, 600.00, true),
            ('OBT031', 'Amlodipine 5 mg', 'Tablet', 100, 800.00, true),
            ('OBT032', 'Amlodipine 10 mg', 'Tablet', 80, 1200.00, true),
            ('OBT033', 'Captopril 25 mg', 'Tablet', 90, 500.00, true),
            ('OBT034', 'Losartan 50 mg', 'Tablet', 75, 1500.00, true),
            ('OBT035', 'Metformin 500 mg', 'Tablet', 100, 700.00, true),
            ('OBT036', 'Metformin 850 mg', 'Tablet', 80, 900.00, true),
            ('OBT037', 'Glimepiride 2 mg', 'Tablet', 60, 1200.00, true),
            ('OBT038', 'Simvastatin 20 mg', 'Tablet', 70, 1000.00, true),
            ('OBT039', 'Furosemide 40 mg', 'Tablet', 55, 700.00, true),
            ('OBT040', 'Aspirin 80 mg', 'Tablet', 100, 500.00, true),
            ('OBT041', 'Vitamin B Complex', 'Tablet', 150, 600.00, true),
            ('OBT042', 'Vitamin C 500 mg', 'Tablet', 200, 800.00, true),
            ('OBT043', 'Vitamin D3 1000 IU', 'Tablet', 100, 1200.00, true),
            ('OBT044', 'Calcium Lactate 500 mg', 'Tablet', 90, 700.00, true),
            ('OBT045', 'Ferrous Sulfate 300 mg', 'Tablet', 80, 900.00, true),
            ('OBT046', 'Mefenamic Acid 500 mg', 'Tablet', 100, 1000.00, true),
            ('OBT047', 'Diclofenac Sodium 50 mg', 'Tablet', 75, 1200.00, true),
            ('OBT048', 'Piroxicam 20 mg', 'Kapsul', 50, 1000.00, true),
            ('OBT049', 'Hydrocortisone Cream 1%', 'Tube', 40, 8500.00, true),
            ('OBT050', 'Povidone Iodine 10%', 'Botol', 50, 12000.00, true);
    `);
};

exports.down = (pgm) => {
    pgm.sql(`
        DELETE FROM medicines
        WHERE code IN (
            'OBT001', 'OBT002', 'OBT003', 'OBT004', 'OBT005',
            'OBT006', 'OBT007', 'OBT008', 'OBT009', 'OBT010',
            'OBT011', 'OBT012', 'OBT013', 'OBT014', 'OBT015',
            'OBT016', 'OBT017', 'OBT018', 'OBT019', 'OBT020',
            'OBT021', 'OBT022', 'OBT023', 'OBT024', 'OBT025',
            'OBT026', 'OBT027', 'OBT028', 'OBT029', 'OBT030',
            'OBT031', 'OBT032', 'OBT033', 'OBT034', 'OBT035',
            'OBT036', 'OBT037', 'OBT038', 'OBT039', 'OBT040',
            'OBT041', 'OBT042', 'OBT043', 'OBT044', 'OBT045',
            'OBT046', 'OBT047', 'OBT048', 'OBT049', 'OBT050'
        );
    `);
};