import {
  StyleSheet,
  Text,
  View,
  Linking,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import ButtonBack from '../../components/ButtonBack';
import {WebView} from 'react-native-webview';

const PersonalPolicy = () => {
  const [url, setUrl] = useState('https://app.xrun.run/7012.html');

  return (
    <View style={styles.root}>
      <View style={{flexDirection: 'row'}}>
        <View style={{position: 'absolute', zIndex: 1}}>
          <ButtonBack />
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Personal Policy</Text>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          width: '100%',
          padding: 20,
        }}>
        <Text
          style={{
            fontFamily: 'Poppins-Medium',
            fontSize: 18,
          }}>
          KEBIJAKAN PRIBADI
        </Text>
        <Text
          style={{
            fontFamily: 'Poppins-Medium',
            fontSize: 14,
          }}>
          1. Apa itu Kebijakan Privasi? XRUN LLC (selanjutnya disebut sebagai
          "Perusahaan") mengumpulkan, menggunakan, dan memberikan informasi
          pribadi berdasarkan persetujuan pengguna, dan secara aktif menjamin
          hak pengguna (hak untuk menentukan sendiri informasi pribadi).
          Perusahaan mematuhi undang-undang yang relevan dan peraturan
          perlindungan informasi pribadi serta pedoman Republik Korea yang harus
          dipatuhi oleh penyedia layanan informasi dan komunikasi. “Kebijakan
          Penanganan Informasi Pribadi” berarti pedoman yang harus diikuti oleh
          perusahaan agar pengguna dapat menggunakan layanan dengan percaya diri
          dengan melindungi informasi pribadi mereka yang berharga. Kebijakan
          privasi ini berlaku untuk layanan berbasis akun XRUN (selanjutnya
          disebut sebagai 'layanan') yang disediakan oleh perusahaan. 2.
          Pengumpulan informasi pribadi Kami mengumpulkan informasi pribadi
          minimum yang diperlukan untuk menyediakan layanan. Kami mengumpulkan
          informasi pribadi minimum yang diperlukan untuk menyediakan layanan
          berikut melalui situs web atau aplikasi atau program individu selama
          pendaftaran keanggotaan atau penggunaan layanan. [Akun XRUN]
          Diperlukan email, kata sandi, nama, informasi kontak, riwayat
          penggunaan layanan Jenis kelamin, usia, dan wilayah tempat tinggal
          yang dipilih Beberapa layanan dapat mengumpulkan informasi pribadi
          tambahan dengan persetujuan pengguna selain informasi yang biasanya
          dikumpulkan oleh 'akun XRUN' untuk menyediakan berbagai fungsi khusus.
          Apa informasi yang dibutuhkan? : Informasi untuk menjalankan fungsi
          penting dari layanan Apa itu informasi opsional? : Informasi tambahan
          yang dikumpulkan untuk menyediakan layanan yang lebih khusus Cara
          mengumpulkan informasi pribadi adalah sebagai berikut. Dalam hal
          mengumpulkan informasi pribadi, kami harus memberi tahu pengguna
          terlebih dahulu dan meminta persetujuan mereka, dan mengumpulkan
          informasi pribadi melalui metode berikut. Ketika pengguna menyetujui
          pengumpulan informasi pribadi dan secara langsung memasukkan informasi
          dalam proses pendaftaran keanggotaan dan penggunaan layanan Ketika
          informasi pribadi diberikan dari layanan atau organisasi terafiliasi
          Informasi pribadi yang dikumpulkan dari pengguna dalam proses
          penggunaan layanan yang berpartisipasi, seperti acara/event yang
          diadakan secara online dan offline, adalah sebagai berikut. Informasi
          seperti informasi terminal (OS, ukuran layar, ID perangkat, model
          telepon, nama model terminal), alamat IP, cookie, tanggal dan waktu
          kunjungan, catatan penggunaan ilegal, catatan penggunaan layanan, dll.
          dihasilkan secara otomatis selama proses penggunaan Web PC dan
          web/aplikasi seluler dan dapat dikumpulkan. 3. Penggunaan informasi
          pribadi Digunakan untuk manajemen anggota, penyediaan dan peningkatan
          layanan, dan pengembangan layanan baru. Kami mengumpulkan informasi
          pribadi minimum yang diperlukan untuk menyediakan layanan sebagai
          berikut melalui situs web atau aplikasi atau program individu saat
          mendaftar sebagai anggota atau dalam proses menggunakan layanan.
          Identifikasi anggota/konfirmasi niat untuk bergabung, pencegahan
          penggunaan ilegal Pengembangan layanan baru, penyediaan berbagai
          layanan, penanganan pertanyaan atau keluhan, dan penyampaian
          pemberitahuan Pencegahan dan sanksi terhadap tindakan yang menghambat
          kelancaran pengoperasian layanan (termasuk pencurian akun dan
          penggunaan penipuan) karakteristik demografis dan minat pengguna;
          Gunakan untuk rekomendasi konten yang disesuaikan dan pemasaran dengan
          memperkirakan preferensi dan kecenderungan Penyediaan layanan yang
          dipersonalisasi Catatan penggunaan layanan, statistik frekuensi akses
          dan penggunaan layanan, pembentukan lingkungan layanan dalam hal
          perlindungan privasi, dan peningkatan layanan. 4. Penyediaan informasi
          pribadi XRUN tidak memberikan informasi pribadi pengguna kepada pihak
          ketiga, kecuali dalam kasus di mana ada persetujuan terpisah dari
          pengguna atau sebagaimana diatur oleh hukum dan peraturan. Kami
          menyediakan informasi pribadi sebagai berikut untuk terhubung dengan
          layanan pihak ketiga. XRUN tidak memberikan informasi pribadi kepada
          pihak ketiga tanpa persetujuan pengguna sebelumnya. Namun, informasi
          pribadi diberikan kepada pihak ketiga setelah mendapatkan persetujuan
          pengguna dalam lingkup yang diperlukan bagi pengguna untuk menggunakan
          layanan afiliasi eksternal. Tugas-tugas berikut dipercayakan untuk
          memberikan layanan. Informasi pribadi dipercayakan kepada perusahaan
          eksternal untuk melakukan beberapa tugas yang diperlukan untuk
          penyediaan layanan. Selain itu, kami mengelola dan mengawasi
          perusahaan yang dipercayakan untuk mematuhi undang-undang terkait. 5.
          Pemusnahan informasi pribadi Informasi pribadi dihancurkan tanpa
          penundaan ketika tujuan pengumpulan dan penggunaan tercapai, dan
          prosedur serta metodenya adalah sebagai berikut. Dalam hal file
          elektronik, itu dihapus dengan aman sehingga tidak dapat dipulihkan
          atau direproduksi, dan dalam kasus catatan lain, bahan cetak, dan
          dokumen tertulis, dihancurkan dengan penghancuran atau pembakaran.
          Namun, informasi yang dimusnahkan setelah disimpan dalam jangka waktu
          tertentu menurut kebijakan internal adalah sebagai berikut. Informasi
          di bawah ini akan disimpan hingga satu tahun sejak tanggal penarikan
          dan kemudian dimusnahkan. Catatan penggunaan layanan secara ilegal
          dengan mengenkripsi akun XRUN dan alamat email informasi penarikan
          untuk mengirim email informasi dan menanggapi pertanyaan CS 6. Lainnya
          XRUN melindungi hak Anda. Pengguna dapat menanyakan atau mengubah
          informasi pribadi mereka kapan saja, dan dapat meminta penarikan
          persetujuan untuk pengumpulan dan penggunaan atau penghentian
          keanggotaan. Lebih khusus lagi, Anda dapat menggunakan fungsi
          modifikasi informasi anggota atau fungsi penarikan anggota melalui
          pengaturan dalam layanan, dan jika Anda meminta secara tertulis,
          melalui telepon atau email melalui pusat pelanggan, kami akan
          mengambil tindakan tanpa penundaan. Jika Anda meminta koreksi
          kesalahan dalam informasi pribadi, informasi pribadi tidak akan
          digunakan atau diberikan sampai koreksi selesai. XRUN mematuhi
          Peraturan Perlindungan Data Umum Uni Eropa dan hukum masing-masing
          Negara Anggota. Saat memberikan layanan kepada pengguna di Uni Eropa,
          hal berikut mungkin berlaku. [Tujuan dan dasar untuk memproses
          informasi pribadi] XRUN menggunakan informasi pribadi yang dikumpulkan
          hanya untuk tujuan yang dijelaskan dalam "3. Penggunaan Informasi
          Pribadi", dan memberi tahu pengguna tentang fakta sebelumnya dan
          meminta persetujuan. Dan sesuai dengan hukum yang berlaku seperti
          GDPR, XRUN dapat memproses informasi pribadi pengguna dalam salah satu
          kasus berikut. Persetujuan subjek data Untuk kesimpulan dan
          implementasi kontrak dengan subjek data Untuk mematuhi kewajiban hukum
          Saat pemrosesan diperlukan untuk kepentingan material subjek data
          Untuk mengejar kepentingan sah perusahaan (kepentingan dan hak subjek
          data atau Kecuali jika kebebasan lebih penting daripada
          kepentingannya) [Jaminan hak pengguna di Uni Eropa] Sebagaimana
          dinyatakan dalam "Kami melindungi hak Anda", XRUN dengan hati-hati
          melindungi informasi pribadi pengguna. Sesuai dengan undang-undang
          yang berlaku seperti GDPR, pengguna dapat meminta agar informasi
          pribadi mereka ditransfer ke manajer lain dan dapat meminta penolakan
          untuk memproses informasi mereka. Dan Anda berhak mengajukan keluhan
          kepada otoritas perlindungan data. Selain itu, XRUN dapat menggunakan
          informasi pribadi untuk menyediakan pemasaran seperti acara dan iklan,
          dan meminta persetujuan pengguna terlebih dahulu. Pengguna dapat
          menarik persetujuan mereka kapan saja jika mereka tidak
          menginginkannya. Permintaan yang terkait dengan hal di atas akan
          ditangani tanpa penundaan jika Anda menghubungi kami melalui email
          melalui pusat pelanggan. Jika Anda meminta koreksi kesalahan dalam
          informasi pribadi, informasi pribadi tidak akan digunakan atau
          diberikan sampai koreksi selesai. Apakah Anda memiliki pertanyaan
          tentang perlindungan informasi pribadi? Untuk semua pertanyaan,
          keluhan, saran, atau hal-hal lain yang terkait dengan perlindungan
          informasi pribadi yang terjadi saat menggunakan layanan, silakan
          hubungi penanggung jawab perlindungan informasi pribadi dan departemen
          yang bertanggung jawab. XRUN akan melakukan yang terbaik untuk
          mendengarkan suara Anda dan memberikan jawaban yang cepat dan memadai.
          Orang yang bertanggung jawab atas perlindungan informasi pribadi dan
          departemen yang bertanggung jawab: Wonyong Jeung Departemen yang
          bertanggung jawab: Lab XRUN Pertanyaan: xrun@xrun.run Pusat Pelanggan
          XRUN: xrun@xrun.com Selain itu, jika Anda perlu melaporkan atau
          berkonsultasi tentang pelanggaran informasi pribadi, Anda dapat
          menghubungi organisasi berikut untuk mendapatkan bantuan. Pusat
          Laporan Pelanggaran Privasi (tanpa kode area) +82-118
          https://privacy.kisa.or.kr Divisi Investigasi Cyber, Kejaksaan Agung
          (tanpa kode area) +82-1301 cid@spo.go.kr Biro Keamanan Siber Badan
          Kepolisian Nasional (tanpa kode area) +82-182
          https://cyberbureau.police.go.kr Jika kebijakan pemrosesan informasi
          pribadi diubah, kebijakan pemrosesan informasi pribadi dapat diubah
          untuk tujuan mencerminkan perubahan dalam undang-undang atau layanan.
          Jika kebijakan privasi diubah, XRUN akan memposting perubahan, dan
          kebijakan privasi yang diubah akan berlaku 7 hari setelah diposting.
          Namun, kami akan memberi tahu Anda setidaknya 30 hari sebelumnya bila
          ada perubahan signifikan dalam hak pengguna, seperti perubahan item
          informasi pribadi yang dikumpulkan dan tujuan penggunaan. Tanggal
          Pengumuman: 11 Juli 2022 Tanggal Efektif: 11 Juli 2022
        </Text>
      </ScrollView>
    </View>
  );
};

export default PersonalPolicy;

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#f2f5f6',
  },
  titleWrapper: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'center',
    flex: 1,
    elevation: 5,
    zIndex: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#051C60',
    margin: 10,
  },
});
