// =========================================================================
// !!! TINGGAL PASTE URL DEPLOYMENT BARU ANDA DI SINI !!!
// =========================================================================
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwPglSvZWRsJy_gqM0ghfo5bak9LkhuE6vUcYbkM9u6D19pxk-R0bHx1UgfBSZCPqY7oA/exec";
const NOMOR_WA_CS = "62895413994246"; 
const NAMA_BISNIS = "IFRONTROOM SERVICE"; 
// =========================================================================

const daftarTipeIphone = ["X", "XR", "XS", "XSM", "11", "11P", "11PM", "12 Mini", "12", "12P", "12PM", "13 Mini", "13", "13P", "13PM", "14", "14 Plus", "14P", "14PM", "15", "15 Plus", "15P", "15PM"];
let dataNotaAktif = null; 
let masterDataStok = [];

window.onload = function() {
    document.querySelectorAll('.business-name-ui').forEach(el => el.textContent = NAMA_BISNIS);
    const fTipe = document.getElementById("f_tipe");
    daftarTipeIphone.forEach(t => { fTipe.appendChild(new Option("iPhone " + t, "iPhone " + t)); });
};

window.switchTab = function(element, tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if(element) element.classList.add('active');
    document.getElementById('nota-box').style.display = 'none';
    if (tabId === 'stok-tab') muatDataStokDariSheets();
};

window.toggleBoxStokNota = function() {
    document.getElementById('box-stok-nota').style.display = document.getElementById('switch_pakai_stok').checked ? 'block' : 'none';
};

window.updateOpsiTipeNota = function() {
    const prod = document.getElementById("nota_produk").value;
    const sel = document.getElementById("nota_tipe");
    sel.innerHTML = '<option value="">-- Pilih Tipe --</option>';
    document.getElementById("nota_area_warna").style.display = (prod === "BACKGLASS") ? "block" : "none";
    if(prod !== "") { sel.disabled = false; daftarTipeIphone.forEach(t => { sel.appendChild(new Option("iPhone " + t, "iPhone " + t)); }); } else { sel.disabled = true; }
};

window.updateOpsiTipeGudang = function() {
    const prod = document.getElementById("stok_produk").value;
    const sel = document.getElementById("stok_tipe");
    sel.innerHTML = '<option value="">-- Pilih Tipe --</option>';
    document.getElementById("stok_area_warna").style.display = (prod === "BACKGLASS") ? "block" : "none";
    if(prod !== "") { sel.disabled = false; daftarTipeIphone.forEach(t => { sel.appendChild(new Option("iPhone " + t, "iPhone " + t)); }); } else { sel.disabled = true; }
};

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

    const payload = {
        action: "tambah_nota",
        nama_customer: document.getElementById('inp_nama').value,
        no_telepon: hpInput,
        pin_layar: document.getElementById('inp_pin').value,
        perbaikan: document.getElementById('inp_perbaikan').value,
        harga: Number(document.getElementById('inp_harga').value),
        pakaiSparepart: pakaiSparepart
    };

    if (pakaiSparepart === "ya") {
        payload.sparepart_produk = document.getElementById("nota_produk").value;
        payload.sparepart_tipe = document.getElementById("nota_tipe").value;
        payload.sparepart_warna = document.getElementById("nota_warna").value;
    }

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