// =========================================================================
// KONFIGURASI UTAMA
// =========================================================================
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwtcauPtumOrSK39QYv_ZPfjeidUHtCLtXVccuJb9xTSmJKvjiDlYlRK9op3w1Dz3cLGA/exec";
const NOMOR_WA_CS = "62895413994246"; 
const NAMA_BISNIS = "IFRONTROOM SERVICE"; 

// =========================================================================
// KONFIGURASI KEAMANAN / LOGIN
// =========================================================================
const PIN_AKSES_SISTEM = "005567"; // 🔑 UBAH PIN ANDA DI SINI

// Cek status login saat halaman dimuat
window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('ifrontroom_logged_in');
    const overlay = document.getElementById('loginOverlay');
    
    if (isLoggedIn === 'true') {
        if (overlay) overlay.style.display = 'none';
    } else {
        if (overlay) overlay.style.display = 'flex';
    }
});

// Fungsi Eksekusi Login
window.prosesLogin = function(event) {
    event.preventDefault();
    const pinInput = document.getElementById('input_pin_login').value;
    const msgError = document.getElementById('pesan_error_login');

    if (pinInput === PIN_AKSES_SISTEM) {
        localStorage.setItem('ifrontroom_logged_in', 'true');
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('input_pin_login').value = '';
        if (msgError) msgError.style.display = 'none';
    } else {
        if (msgError) msgError.style.display = 'block';
        document.getElementById('input_pin_login').value = '';
        document.getElementById('input_pin_login').focus();
    }
};

// Fungsi Eksekusi Logout
window.prosesLogout = function() {
    if (confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
        localStorage.removeItem('ifrontroom_logged_in');
        document.getElementById('loginOverlay').style.display = 'flex';
    }
};

// =========================================================================
// DATA PRESET SIFAT SISTEM
// =========================================================================
const daftarTipeIphone = [
    "6", "6 Plus", "6s", "6s Plus",
    "7", "7 Plus",
    "8", "8 Plus",
    "SE 2020", "SE 2022",
    "X", "XR", "XS", "XSM",
    "11", "11P", "11PM",
    "12 Mini", "12", "12P", "12PM",
    "13 Mini", "13", "13P", "13PM",
    "14", "14 Plus", "14P", "14PM",
    "15", "15 Plus", "15P", "15PM"
];

const daftarProduk = [
    "LCD", "BATRE", "KONEKTOR", "BACKGLASS", 
    "TOMBOL ON/OFF", "TOMBOL VOLUME", "SPEAKER ATAS FULSET", 
    "SENSOR ONLY", "SPEAKER ONLY", "SPEAKER BAWAH", 
    "KAMERA BELAKANG", "KAMERA DEPAN"
];

const daftarWarnaBackglass = [
    "Black / Space Gray", "White / Silver", "Gold", "Rose Gold", 
    "Red", "Yellow", "Blue", "Green", "Purple", "Pink", 
    "Midnight", "Starlight", "Pacific Blue", "Sierra Blue", 
    "Alpine Green", "Deep Purple", "Space Black", 
    "Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"
];

let dataNotaAktif = null; 
let masterDataStok = [];
let jumlahBarisSparepart = 0;
let instanceChartPenjualan = null; // Chart.js instance

window.onload = function() {
    document.querySelectorAll('.business-name-ui').forEach(el => el.textContent = NAMA_BISNIS);
    const fTipe = document.getElementById("f_tipe");
    if (fTipe) {
        daftarTipeIphone.forEach(t => { fTipe.appendChild(new Option("iPhone " + t, "iPhone " + t)); });
    }
};

// =========================================================================
// NAVIGASI TAB & FORM
// =========================================================================
window.switchTab = function(element, tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');
    if (element) element.classList.add('active');
    
    document.getElementById('nota-box').style.display = 'none';
    if (tabId === 'stok-tab') muatDataStokDariSheets();
    if (tabId === 'penjualan-tab') muatLaporanPenjualan();
};

window.toggleBoxStokNota = function() {
    const isChecked = document.getElementById('switch_pakai_stok').checked;
    const box = document.getElementById('box-stok-nota');
    box.style.display = isChecked ? 'block' : 'none';
    
    if (isChecked && document.getElementById('container-sparepart-list').children.length === 0) {
        tambahBarisSparepart();
    }
};

window.tambahBarisSparepart = function() {
    jumlahBarisSparepart++;
    const idRow = `sp_row_${jumlahBarisSparepart}`;
    const container = document.getElementById('container-sparepart-list');
    
    const div = document.createElement('div');
    div.id = idRow;
    div.className = 'sparepart-item-row';
    div.style.cssText = "border: 1px dashed var(--border-color); padding: 10px; margin-bottom: 10px; border-radius: 6px; background: rgba(0,0,0,0.02);";

    let htmlProduk = `<option value="">-- Pilih Produk --</option>`;
    daftarProduk.forEach(p => htmlProduk += `<option value="${p}">${p}</option>`);

    let htmlTipe = `<option value="">-- Pilih Tipe --</option>`;
    daftarTipeIphone.forEach(t => htmlTipe += `<option value="iPhone ${t}">iPhone ${t}</option>`);

    let htmlWarna = `<option value="">-- Pilih Warna Backglass --</option>`;
    daftarWarnaBackglass.forEach(w => htmlWarna += `<option value="${w}">${w}</option>`);

    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <strong style="font-size: 12px; color: var(--primary);">Item Sparepart #${container.children.length + 1}</strong>
            <button type="button" onclick="hapusBarisSparepart('${idRow}')" style="background: none; border: none; color: red; cursor: pointer; font-weight: bold; font-size: 14px;">🗑️ Hapus</button>
        </div>
        <div class="form-group" style="margin-bottom: 5px;">
            <select class="sp_produk" onchange="updateRowSparepart('${idRow}')">
                ${htmlProduk}
            </select>
        </div>
        <div class="form-group" style="margin-bottom: 5px;">
            <select class="sp_tipe" disabled>
                ${htmlTipe}
            </select>
        </div>
        <div class="form-group sp_area_warna" style="display: none; margin-bottom: 5px;">
            <select class="sp_warna">
                ${htmlWarna}
            </select>
        </div>
    `;
    container.appendChild(div);
};

window.hapusBarisSparepart = function(idRow) {
    const row = document.getElementById(idRow);
    if (row) row.remove();
};

window.updateRowSparepart = function(idRow) {
    const row = document.getElementById(idRow);
    const prod = row.querySelector('.sp_produk').value;
    const selTipe = row.querySelector('.sp_tipe');
    const areaWarna = row.querySelector('.sp_area_warna');

    if (prod !== "") {
        selTipe.disabled = false;
    } else {
        selTipe.disabled = true;
        selTipe.value = "";
    }

    if (prod === "BACKGLASS") {
        areaWarna.style.display = "block";
    } else {
        areaWarna.style.display = "none";
        row.querySelector('.sp_warna').value = "";
    }
};

window.updateOpsiTipeGudang = function() {
    const prodElem = document.getElementById("stok_produk");
    const sel = document.getElementById("stok_tipe");
    const areaWarna = document.getElementById("stok_area_warna");
    
    if (!sel) return;
    const prod = prodElem ? prodElem.value : "";
    
    sel.innerHTML = '<option value="">-- Pilih Tipe --</option>';
    
    if (areaWarna) {
        let htmlWarna = `<option value="">-- Pilih Warna --</option>`;
        daftarWarnaBackglass.forEach(w => htmlWarna += `<option value="${w}">${w}</option>`);
        document.getElementById("stok_warna").innerHTML = htmlWarna;
        areaWarna.style.display = (prod === "BACKGLASS") ? "block" : "none";
    }
    
    if (prod !== "") { 
        sel.disabled = false; 
        daftarTipeIphone.forEach(t => { 
            sel.appendChild(new Option("iPhone " + t, "iPhone " + t)); 
        }); 
    } else { 
        sel.disabled = true; 
    }
};

// =========================================================================
// PEMBUATAN & PENCARIAN NOTA
// =========================================================================
function pasangDataKeNotaCetak(data) {
    document.querySelectorAll('.p-business-name-target').forEach(el => el.textContent = NAMA_BISNIS);
    document.getElementById('p_lbl_nota').textContent = data.no_nota;
    document.getElementById('p_lbl_tanggal').textContent = data.tanggal;
    
    const parts = data.tanggal.split('/');
    const tgl = new Date(parts[2], parts[1]-1, parts[0]);
    tgl.setDate(tgl.getDate() + 30);
    document.getElementById('p_lbl_tanggal_due').textContent = ('0' + tgl.getDate()).slice(-2) + '/' + ('0' + (tgl.getMonth()+1)).slice(-2) + '/' + tgl.getFullYear();
    
    document.getElementById('p_lbl_nama').textContent = data.nama_customer.toUpperCase();
    document.getElementById('p_lbl_hp').textContent = data.no_telepon;
    document.getElementById('p_lbl_pin').textContent = data.pin_layar;
    document.getElementById('p_lbl_perbaikan').textContent = data.perbaikan.toUpperCase();
    
    const formattedHarga = "Rp " + Number(data.harga).toLocaleString('id-ID');
    document.getElementById('p_lbl_harga_unit').textContent = formattedHarga;
    document.getElementById('p_lbl_harga_total').textContent = formattedHarga;
    document.getElementById('p_lbl_subtotal').textContent = formattedHarga;
    document.getElementById('p_lbl_final_total').textContent = formattedHarga;
}

window.simpanNota = async function(event) {
    event.preventDefault();
    let hpInput = document.getElementById('inp_hp').value.trim();
    if (hpInput.startsWith("0")) hpInput = "62" + hpInput.slice(1);
    var pakaiSparepart = document.getElementById("switch_pakai_stok").checked ? "ya" : "tidak";

    let daftarItemDipotong = [];
    if (pakaiSparepart === "ya") {
        const rows = document.querySelectorAll('#container-sparepart-list .sparepart-item-row');
        rows.forEach(row => {
            const prod = row.querySelector('.sp_produk').value;
            const tipe = row.querySelector('.sp_tipe').value;
            const warna = row.querySelector('.sp_warna').value;

            if (prod && tipe) {
                let tf = tipe;
                if (prod === "BACKGLASS" && warna) tf = tipe + " - " + warna;
                daftarItemDipotong.push({ produk: prod, tipe: tf });
            }
        });
    }

    const payload = {
        action: "tambah_nota",
        nama_customer: document.getElementById('inp_nama').value,
        no_telepon: hpInput,
        pin_layar: document.getElementById('inp_pin').value,
        perbaikan: document.getElementById('inp_perbaikan').value,
        harga: Number(document.getElementById('inp_harga').value),
        pakaiSparepart: pakaiSparepart,
        itemsDipotong: daftarItemDipotong
    };

    document.getElementById("loadingOverlay").style.display = "flex";
    try {
        const response = await fetch(WEB_APP_URL, { method: "POST", body: JSON.stringify(payload) });
        const res = await response.json();
        document.getElementById("loadingOverlay").style.display = "none";
        dataNotaAktif = res;
        pasangDataKeNotaCetak(dataNotaAktif);
        document.getElementById('alert-success-msg').innerHTML = `<strong>Sukses!</strong> Nomor Nota Anda: <strong>${res.no_nota}</strong>`;
        document.getElementById('nota-box').style.display = 'block';
        document.getElementById('form-input').reset();
        document.getElementById('container-sparepart-list').innerHTML = "";
        document.getElementById('switch_pakai_stok').checked = false;
        window.toggleBoxStokNota();
    } catch(e) { document.getElementById("loadingOverlay").style.display = "none"; alert("Gagal terhubung ke database server."); }
};

window.cariNota = async function() {
    const noNota = document.getElementById('search_nota').value.trim();
    if (!noNota) return;
    document.getElementById("loadingOverlay").style.display = "flex";
    try {
        const response = await fetch(WEB_APP_URL, { method: "POST", body: JSON.stringify({ action: "cari_nota", no_nota: noNota }) });
        const res = await response.json();
        document.getElementById("loadingOverlay").style.display = "none";
        if (res.status === "success") {
            dataNotaAktif = res; pasangDataKeNotaCetak(dataNotaAktif);
            document.getElementById('alert-success-msg').innerHTML = `<strong>Nota Berhasil Ditemukan!</strong>`;
            document.getElementById('nota-box').style.display = 'block';
        } else { alert(res.message); }
    } catch(e) { document.getElementById("loadingOverlay").style.display = "none"; alert("Eror pencarian data."); }
};

// =========================================================================
// MANAJEMEN STOK GUDANG
// =========================================================================
window.muatDataStokDariSheets = function() {
    document.getElementById("bodyTabelStok").innerHTML = `<tr><td colspan="4" style="text-align:center;">Menghubungkan database awan...</td></tr>`;
    const oldScript = document.getElementById("jsonp-stok-script");
    if (oldScript) oldScript.remove();
    const script = document.createElement("script");
    script.id = "jsonp-stok-script";
    script.src = WEB_APP_URL + "?action=get_stok&callback=terimaDataStokJSONP";
    script.onerror = function() {
        document.getElementById("bodyTabelStok").innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--error); font-weight:600;">⚠️ Jalur komunikasi data terputus. Periksa deployment URL Anda.</td></tr>`;
    };
    document.body.appendChild(script);
};

window.terimaDataStokJSONP = function(data) {
    masterDataStok = data;
    window.saringTabelStok();
};

window.eksekusiStokGudang = async function(aksi) {
    const prod = document.getElementById("stok_produk").value;
    const tipe = document.getElementById("stok_tipe").value;
    const warna = document.getElementById("stok_warna").value;
    const jml = document.getElementById("stok_jumlah").value;
    if(!prod || !tipe || !jml) return;
    let tf = tipe; if(prod === "BACKGLASS" && warna) tf = tipe + " - " + warna;
    
    document.getElementById("loadingOverlay").style.display = "flex";
    try {
        const response = await fetch(WEB_APP_URL, { method: "POST", body: JSON.stringify({ action: "update_stok", produk: prod, tipe: tf, jumlah: jml, aksi: aksi }) });
        const res = await response.json();
        document.getElementById("loadingOverlay").style.display = "none";
        masterDataStok = res.data; window.saringTabelStok();
        document.getElementById("stok_jumlah").value = 1;
        alert("Berhasil memperbarui stok di Google Sheets!");
    } catch(e) { document.getElementById("loadingOverlay").style.display = "none"; }
};

window.saringTabelStok = function() {
    const kw = document.getElementById("cariKeywordStok").value.toLowerCase();
    const fp = document.getElementById("f_produk").value;
    const ft = document.getElementById("f_tipe").value;
    const fs = document.getElementById("f_status").value;
    
    const res = masterDataStok.filter(item => {
        return (item.produk.toLowerCase().includes(kw) || item.tipe.toLowerCase().includes(kw)) &&
               (fp === "" || item.produk === fp) && (ft === "" || item.tipe.startsWith(ft)) &&
               (fs === "" || (fs==="kritis" && item.stok<=1) || (fs==="menipis" && item.stok>1 && item.stok<=5) || (fs==="aman" && item.stok>5));
    });
    
    const tbody = document.getElementById("bodyTabelStok"); tbody.innerHTML = "";
    if(res.length === 0) { tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Data tidak ditemukan</td></tr>`; return; }
    
    res.forEach(item => {
        let tr = document.createElement("tr"); let bc = "bg-safe"; let st = "Aman";
        if (item.stok <= 1) { tr.className = "alert-stok-row"; bc = "bg-danger-custom"; st = "Kritis"; }
        else if (item.stok <= 5) { bc = "bg-warning-custom"; st = "Menipis"; }
        tr.innerHTML = `<td style="font-weight:600; color:var(--primary);">${item.produk}</td><td>${item.tipe}</td><td><b>${item.stok}</b> Pcs</td><td><span class="badge-stat ${bc}">${st}</span></td>`;
        tbody.appendChild(tr);
    });
};

// =========================================================================
// INTEGRASI WHATSAPP
// =========================================================================
window.kirimNotaKeWA = function() {
    if (!dataNotaAktif) return;
    const teksWA = `*INVOICE SERVICE - ${NAMA_BISNIS}*\n` +
                  `-----------------------------------\n` +
                  `🧾 *No. Invoice:* ${dataNotaAktif.no_nota}\n` +
                  `📅 *Tanggal:* ${dataNotaAktif.tanggal}\n` +
                  `👤 *Pelanggan:* ${dataNotaAktif.nama_customer.toUpperCase()}\n` +
                  `🔧 *Kerusakan & Perbaikan:* \n_${dataNotaAktif.perbaikan.toUpperCase()}_\n` +
                  `-----------------------------------\n` +
                  `💰 *TOTAL TAGIHAN:* *Rp ${Number(dataNotaAktif.harga).toLocaleString('id-ID')}*\n` +
                  `-----------------------------------\n` +
                  `Nota resmi digital Anda telah diterbitkan. Terima kasih! 🙏`;
    window.open(`https://api.whatsapp.com/send?phone=${dataNotaAktif.no_telepon}&text=${encodeURIComponent(teksWA)}`, '_blank');
};

window.hubungiOwner = function() {
    if (!dataNotaAktif) return;
    window.open(`https://api.whatsapp.com/send?phone=${NOMOR_WA_CS}&text=${encodeURIComponent("Halo, saya ingin menanyakan perihal invoice nomor " + dataNotaAktif.no_nota)}`, '_blank');
};

// =========================================================================
// LAPORAN PENJUALAN & GRAFIK (OMSET)
// =========================================================================
window.muatLaporanPenjualan = function() {
    document.getElementById("total-penjualan-hari").innerText = "Memuat...";
    document.getElementById("total-penjualan-bulan").innerText = "Memuat...";
    
    const oldScript = document.getElementById("jsonp-laporan-script");
    if (oldScript) oldScript.remove();
    
    const script = document.createElement('script');
    script.id = "jsonp-laporan-script";
    script.src = `${WEB_APP_URL}?action=get_laporan&callback=renderLaporanPenjualan`;
    document.body.appendChild(script);
};

window.renderLaporanPenjualan = function(data) {
    const formatRupiah = (angka) => "Rp " + Number(angka).toLocaleString("id-ID");

    document.getElementById("total-penjualan-hari").innerText = formatRupiah(data.totalHariIni || 0);
    document.getElementById("total-penjualan-bulan").innerText = formatRupiah(data.totalBulanIni || 0);
    
    const elCount = document.getElementById("jumlah-nota-bulan");
    if (elCount && data.jumlahNotaBulanIni !== undefined) {
        elCount.innerText = `Total: ${data.jumlahNotaBulanIni} Nota Tercatat`;
    }

    // GAMBAR/UPDATE GRAFIK TIMELINE
    if (data.timelineHarian) {
        const labels = Object.keys(data.timelineHarian);
        const values = Object.values(data.timelineHarian);

        const ctx = document.getElementById('chartPenjualanHarian').getContext('2d');

        if (instanceChartPenjualan) {
            instanceChartPenjualan.destroy();
        }

        instanceChartPenjualan = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Omset Harian (Rp)',
                    data: values,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#2563eb'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ' Omset: ' + formatRupiah(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Tanggal Bulan Ini', font: { size: 11, weight: 'bold' } },
                        ticks: {
                            autoSkip: false, // Menampilkan seluruh tanggal 1 - 31 tanpa dieliminasi
                            font: { size: 10 }
                        },
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000000) return 'Rp ' + (value / 1000000) + 'Jt';
                                if (value >= 1000) return 'Rp ' + (value / 1000) + 'k';
                                return 'Rp ' + value;
                            }
                        }
                    }
                }
            }
        });
    }
};

// =========================================================================
// LOGIKA MODAL & HISTORI PENJUALAN HARIAN
// =========================================================================
function formatToInputDate(dateObj) {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

window.bukaModalHistoriHarian = function() {
    document.getElementById('modalHistoriPenjualan').style.display = 'flex';
    setTanggalHistoriHariIni();
};

window.tutupModalHistoriHarian = function() {
    document.getElementById('modalHistoriPenjualan').style.display = 'none';
};

window.setTanggalHistoriHariIni = function() {
    const today = new Date();
    document.getElementById('filter_tgl_histori').value = formatToInputDate(today);
    cariHistoriBerdasarkanTanggal();
};

window.cariHistoriBerdasarkanTanggal = function() {
    const valInput = document.getElementById('filter_tgl_histori').value; // YYYY-MM-DD
    if (!valInput) return;

    // Konversi YYYY-MM-DD menjadi DD/MM/YYYY
    const parts = valInput.split('-');
    const tglFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`; 

    document.getElementById("bodyTabelHistoriHarian").innerHTML = `<tr><td colspan="5" style="text-align:center; padding:15px;">Mengambil data nota...</td></tr>`;
    document.getElementById("lbl_histori_tgl").innerText = tglFormatted;

    const oldScript = document.getElementById("jsonp-histori-script");
    if (oldScript) oldScript.remove();

    const script = document.createElement('script');
    script.id = "jsonp-histori-script";
    script.src = `${WEB_APP_URL}?action=get_histori_harian&tanggal=${encodeURIComponent(tglFormatted)}&callback=renderHistoriPenjualanHarian`;
    document.body.appendChild(script);
};

window.renderHistoriPenjualanHarian = function(res) {
    const formatRupiah = (angka) => "Rp " + Number(angka).toLocaleString("id-ID");
    const tbody = document.getElementById("bodyTabelHistoriHarian");
    tbody.innerHTML = "";

    if (res.status !== "success" || !res.data || res.data.length === 0) {
        document.getElementById("lbl_histori_omset").innerText = "Rp 0";
        document.getElementById("lbl_histori_qty").innerText = "0";
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888; padding:15px;">Tidak ada transaksi nota pada tanggal ini.</td></tr>`;
        return;
    }

    document.getElementById("lbl_histori_omset").innerText = formatRupiah(res.totalOmset);
    document.getElementById("lbl_histori_qty").innerText = res.totalNota;

    res.data.forEach(item => {
        const tr = document.createElement("tr");
        tr.style.borderBottom = "1px solid var(--border-color, #e2e8f0)";
        tr.innerHTML = `
            <td style="padding:8px; font-weight:bold; color:var(--primary);">${item.no_nota}</td>
            <td style="padding:8px;">${item.nama_customer}<br><small style="color:#666;">${item.no_telepon}</small></td>
            <td style="padding:8px;">${item.perbaikan}</td>
            <td style="padding:8px; text-align:right; font-weight:bold; color:var(--success, #16a34a);">${formatRupiah(item.harga)}</td>
            <td style="padding:8px; text-align:center;">
                <button type="button" onclick="pilihDanTampilkanNota('${item.no_nota}')" style="background:var(--primary); color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:11px; cursor:pointer;">
                    📄 Lihat
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

window.pilihDanTampilkanNota = function(noNota) {
    tutupModalHistoriHarian();
    document.getElementById('search_nota').value = noNota;
    
    // Cari tombol tab 'cari-tab' di DOM
    const btnCari = document.querySelector(".tab-button[onclick*='cari-tab']");
    window.switchTab(btnCari, 'cari-tab');
    
    // Panggil fungsi cariNota bawaan
    window.cariNota();
};