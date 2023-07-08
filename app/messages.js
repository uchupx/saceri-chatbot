const greetingMessages = `
Assalamu'alaikum Warahmatullahi Wabarakatuh

Halo, terima kasih sudah menghubungi Minceri dari Saceri. Ada yang bisa Minceri bantu?
Kamu dapat memperoleh informasi dengan memilih topik di bawah ini ya 😊

1. Update Acara Saceri.
2. Konfirmasi Donasi Saceri.
3. Live konsul dengan Minceri.
`

const updateMessages = `
Hai, Terimakasih telah mencari tau update acara saceri, untuk kegiatan kita yang berlangsung sekarang adalah {BELUM ADA MAAP YAK}
`

const confirmMessages = `
Hai, Terimakasih telah melakukan konfirmasi donasi, 
mohon kesediannya untuk mengisi format donasi sebagai berikut :
- Nama Pendonasi :
- Donasi	 :
- Tanggal Donasi :
`

const liveMessage = `
Hai, Terimakasih telah memilih untuk live konsul dengan Minceri. Silahkan ajukan detail konsulnya dan mohon kesediannya untuk menunggu Minceri membalas pesan anda.
`

export const MESSAGES = {
  GREETINGS: greetingMessages,
  UPDATE: updateMessages,
  CONFIRM: confirmMessages,
  LIVE: liveMessage
}

