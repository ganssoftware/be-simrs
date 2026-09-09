exports.up = (pgm) => {
    pgm.sql(`
        INSERT INTO polyclinics (name, description)
        VALUES
            (
                'Poli Umum',
                'Pelayanan kesehatan umum dan pemeriksaan dasar'
            ),
            (
                'Poli Gigi',
                'Pelayanan kesehatan dan pemeriksaan gigi'
            ),
            (
                'Poli Anak',
                'Pelayanan kesehatan dan pemeriksaan pasien anak'
            ),
            (
                'Poli Penyakit Dalam',
                'Pelayanan diagnosis dan penanganan penyakit dalam'
            ),
            (
                'Poli Bedah',
                'Pelayanan konsultasi dan penanganan bedah'
            ),
            (
                'Poli Kandungan',
                'Pelayanan kesehatan ibu dan kandungan'
            ),
            (
                'Poli Mata',
                'Pelayanan pemeriksaan dan kesehatan mata'
            ),
            (
                'Poli THT',
                'Pelayanan telinga, hidung, dan tenggorokan'
            ),
            (
                'Poli Saraf',
                'Pelayanan pemeriksaan dan penanganan sistem saraf'
            ),
            (
                'Poli Jantung',
                'Pelayanan pemeriksaan dan penanganan penyakit jantung'
            )
        ON CONFLICT (name) DO NOTHING;
    `);
};

exports.down = (pgm) => {
    pgm.sql(`
        DELETE FROM polyclinics
        WHERE name IN (
            'Poli Umum',
            'Poli Gigi',
            'Poli Anak',
            'Poli Penyakit Dalam',
            'Poli Bedah',
            'Poli Kandungan',
            'Poli Mata',
            'Poli THT',
            'Poli Saraf',
            'Poli Jantung'
        );
    `);
};