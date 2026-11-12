
// ===================================
// MENGAMBIL ELEMEN HTML
// ===================================

const form = document.getElementById("agendaForm");
const nama = document.getElementById("nama");
const tanggal = document.getElementById("tanggal");
const lokasi = document.getElementById("lokasi");
const keterangan = document.getElementById("keterangan");

const semuaAgenda = document.getElementById("semuaAgenda");
const agendaTerdekat = document.getElementById("agendaTerdekat");

const totalAgenda = document.getElementById("totalAgenda");
const agendaMendatang = document.getElementById("agendaMendatang");
const agendaSelesai = document.getElementById("agendaSelesai");

const pencarian = document.getElementById("pencarian");
const tombolSimpan = document.getElementById("tombolSimpan");
const batalEdit = document.getElementById("batalEdit");

const notifikasi = document.getElementById("notifikasi");

let agenda = JSON.parse(localStorage.getItem("dataAgenda")) || [];
let idEdit = null;


// ===================================
// TANGGAL HARI INI
// ===================================

function tanggalLokal() {
    const sekarang = new Date();
    const tahun = sekarang.getFullYear();
    const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
    const hari = String(sekarang.getDate()).padStart(2, "0");

    return `${tahun}-${bulan}-${hari}`;
}

document.getElementById("tanggalHariIni").textContent =
    new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(new Date());


// ===================================
// MENYIMPAN DATA
// ===================================

function simpanData() {
    localStorage.setItem("dataAgenda", JSON.stringify(agenda));
}


// ===================================
// NOTIFIKASI
// ===================================

function tampilkanNotifikasi(pesan) {
    notifikasi.textContent = pesan;
    notifikasi.classList.add("show");

    setTimeout(() => {
        notifikasi.classList.remove("show");
    }, 2500);
}


// ===================================
// NAVIGASI HALAMAN
// ===================================

const namaHalaman = document.getElementById("namaHalaman");
const judulHalaman = document.getElementById("judulHalaman");

const halaman = {
    dashboard: document.getElementById("dashboardPage"),
    agenda: document.getElementById("agendaPage"),
    tambah: document.getElementById("tambahPage")
};

const judulHalamanData = {
    dashboard: "Dashboard",
    agenda: "Semua Agenda",
    tambah: "Tambah Kegiatan"
};

function bukaHalaman(nama) {
    Object.values(halaman).forEach(page => {
        page.classList.remove("active");
    });

    halaman[nama].classList.add("active");

    document.querySelectorAll(".nav-link").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === nama
        );
    });

    namaHalaman.textContent = judulHalamanData[nama];
    judulHalaman.textContent = judulHalamanData[nama];

    if (nama === "agenda") {
        tampilkanSemuaAgenda();
    }

    if (nama === "dashboard") {
        tampilkanDashboard();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".nav-link").forEach(button => {
    button.addEventListener("click", () => {
        bukaHalaman(button.dataset.page);
    });
});

document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
        bukaHalaman(button.dataset.go);
    });
});


// ===================================
// FORMAT TANGGAL
// ===================================

function formatTanggal(tanggalAgenda) {
    const tanggalObj = new Date(tanggalAgenda + "T00:00:00");

    return {
        hari: tanggalObj.getDate(),
        bulan: new Intl.DateTimeFormat("id-ID", {
            month: "short"
        }).format(tanggalObj),
        lengkap: new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(tanggalObj)
    };
}


// ===================================
// STATUS KEGIATAN
// ===================================

function statusAgenda(item) {
    if (item.tanggal < tanggalLokal()) {
        return "Selesai";
    }

    return "Mendatang";
}


// ===================================
// MEMBUAT KARTU AGENDA
// ===================================

function buatKartuAgenda(item, denganTombol = false) {
    const kartu = document.createElement("div");
    kartu.className = "agenda-row";

    const format = formatTanggal(item.tanggal);
    const status = statusAgenda(item);

    const kotakTanggal = document.createElement("div");
    kotakTanggal.className = "date-box";

    const angkaTanggal = document.createElement("strong");
    angkaTanggal.textContent = format.hari;

    const namaBulan = document.createElement("small");
    namaBulan.textContent = format.bulan;

    kotakTanggal.append(angkaTanggal, namaBulan);

    const detail = document.createElement("div");
    detail.className = "agenda-details";

    const judul = document.createElement("h4");
    judul.textContent = item.nama;

    const infoTanggal = document.createElement("p");
    infoTanggal.textContent = "◷ " + format.lengkap;

    const infoLokasi = document.createElement("p");
    infoLokasi.textContent = "⌖ " + item.lokasi;

    detail.append(judul, infoTanggal, infoLokasi);

    const statusLabel = document.createElement("span");
    statusLabel.className = status === "Selesai"
        ? "status done"
        : "status";

    statusLabel.textContent = status;

    kartu.append(kotakTanggal, detail, statusLabel);

    if (item.keterangan) {
        const infoTambahan = document.createElement("p");
        infoTambahan.textContent = "Keterangan: " + item.keterangan;
        infoTambahan.className = "agenda-details";
        kartu.appendChild(infoTambahan);
    }

    if (denganTombol) {
        const aksi = document.createElement("div");
        aksi.className = "action-buttons";

        const tombolEdit = document.createElement("button");
        tombolEdit.className = "edit-button";
        tombolEdit.textContent = "Edit";

        tombolEdit.addEventListener("click", () => {
            editAgenda(item.id);
        });

        const tombolHapus = document.createElement("button");
        tombolHapus.className = "delete-button";
        tombolHapus.textContent = "Hapus";

        tombolHapus.addEventListener("click", () => {
            hapusAgenda(item.id);
        });

        aksi.append(tombolEdit, tombolHapus);
        kartu.appendChild(aksi);
    }

    return kartu;
}


// ===================================
// MENAMPILKAN DASHBOARD
// ===================================

function tampilkanDashboard() {
    const hariIni = tanggalLokal();

    const mendatang = agenda
        .filter(item => item.tanggal >= hariIni)
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

    const selesai = agenda.filter(item => item.tanggal < hariIni);

    totalAgenda.textContent = agenda.length;
    agendaMendatang.textContent = mendatang.length;
    agendaSelesai.textContent = selesai.length;

    agendaTerdekat.innerHTML = "";

    if (mendatang.length === 0) {
        agendaTerdekat.innerHTML = `
            <div class="empty-state">
                <div style="font-size:30px;">✦</div>
                Belum ada agenda mendatang.<br>
                Silakan tambahkan kegiatan baru.
            </div>
        `;
        return;
    }

    mendatang.slice(0, 4).forEach(item => {
        agendaTerdekat.appendChild(
            buatKartuAgenda(item)
        );
    });
}


// ===================================
// MENAMPILKAN SEMUA AGENDA
// ===================================

function tampilkanSemuaAgenda() {
    semuaAgenda.innerHTML = "";

    const kataKunci = pencarian.value.toLowerCase();

    const hasil = agenda
        .filter(item =>
            item.nama.toLowerCase().includes(kataKunci) ||
            item.lokasi.toLowerCase().includes(kataKunci)
        )
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

    if (hasil.length === 0) {
        semuaAgenda.innerHTML = `
            <div class="empty-state">
                <div style="font-size:30px;">▤</div>
                Agenda tidak ditemukan.<br>
                Coba kata kunci lain atau tambahkan agenda baru.
            </div>
        `;
        return;
    }

    hasil.forEach(item => {
        semuaAgenda.appendChild(
            buatKartuAgenda(item, true)
        );
    });
}


// ===================================
// MENAMBAHKAN DAN MENGEDIT AGENDA
// ===================================

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const data = {
        id: idEdit || (
            Date.now().toString() +
            Math.random().toString(16).slice(2)
        ),
        nama: nama.value.trim(),
        tanggal: tanggal.value,
        lokasi: lokasi.value.trim(),
        keterangan: keterangan.value.trim()
    };

    if (!data.nama || !data.tanggal || !data.lokasi) {
        tampilkanNotifikasi("Mohon lengkapi data kegiatan!");
        return;
    }

    // POP-UP KONFIRMASI SIMPAN AGENDA
    const yakin = confirm(
        idEdit
            ? "Apakah kamu yakin ingin menyimpan perubahan agenda ini?"
            : "Apakah kamu yakin ingin menyimpan agenda ini?"
    );

    if (!yakin) return;

    if (idEdit) {
        const index = agenda.findIndex(
            item => item.id === idEdit
        );

        if (index !== -1) {
            agenda[index] = data;
        }

        tampilkanNotifikasi("Agenda berhasil diperbarui!");
    } else {
        agenda.push(data);
        tampilkanNotifikasi("Agenda berhasil disimpan!");
    }

    simpanData();
    resetForm();
    tampilkanDashboard();
    bukaHalaman("agenda");
});


// ===================================
// MENGEDIT AGENDA
// ===================================

function editAgenda(id) {
    const item = agenda.find(item => item.id === id);

    if (!item) return;

    idEdit = id;

    nama.value = item.nama;
    tanggal.value = item.tanggal;
    lokasi.value = item.lokasi;
    keterangan.value = item.keterangan || "";

    document.getElementById("judulForm").textContent =
        "Edit Agenda Kegiatan";

    tombolSimpan.textContent = "✓ Simpan Perubahan";

    bukaHalaman("tambah");
}


// ===================================
// RESET FORM
// ===================================

function resetForm() {
    form.reset();
    idEdit = null;

    document.getElementById("judulForm").textContent =
        "Buat Agenda Baru";

    tombolSimpan.textContent = "✓ Simpan Agenda";
}


// ===================================
// TOMBOL BATAL
// ===================================

batalEdit.addEventListener("click", function() {
    resetForm();
    bukaHalaman("agenda");
});


// ===================================
// MENGHAPUS AGENDA
// ===================================

function hapusAgenda(id) {
    const yakin = confirm(
        "Apakah kamu yakin ingin menghapus agenda ini?"
    );

    if (!yakin) return;

    agenda = agenda.filter(item => item.id !== id);

    simpanData();
    tampilkanDashboard();
    tampilkanSemuaAgenda();

    tampilkanNotifikasi("Agenda berhasil dihapus!");
}


// ===================================
// FITUR PENCARIAN
// ===================================

pencarian.addEventListener("input", function() {
    tampilkanSemuaAgenda();
});


// ===================================
// MENAMPILKAN DATA SAAT DIBUKA
// ===================================

tampilkanDashboard();
