import type { Post, User } from '@/types';

// This file is now deprecated and will be removed in a future step.
// Data is now fetched from Firebase.

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alisher Navoiy',
    email: 'alisher@navoiy.com',
    password: 'password123',
    avatar_url: 'https://placehold.co/100x100.png',
    created_at: new Date().toISOString(),
    bio: 'Temuriylar davrining buyuk shoiri, mutafakkiri va davlat arbobi.',
  },
  {
    id: '2',
    name: 'Zahiriddin Muhammad Bobur',
    email: 'babur@mughal.com',
    password: 'password123',
    avatar_url: 'https://placehold.co/100x100.png',
    created_at: new Date().toISOString(),
    bio: 'Boburiylar imperiyasi asoschisi va mohir yozuvchi.',
  },
   {
    id: '3',
    name: 'Sophia Blackwell',
    email: 'sophia@example.com',
    password: 'password123',
    avatar_url: 'https://placehold.co/100x100.png',
    created_at: new Date().toISOString(),
    bio: 'Raqamli asrni o\'rganayotgan zamonaviy faylasuf va texnologiya etikasi mutaxassisi.',
  },
];

export const mockPosts: Post[] = [
  {
    id: '1',
    title: '15-asrdagi G\'azal San\'ati',
    author_id: '1',
    content: `
## She'riy shaklning yuksalishi

Qofiyali baytlar va radifdan iborat she'riy shakl bo'lgan g'azal 15-asrda o'zining yuksak cho'qqisiga chiqdi. Bu davrda shoirlar sevgi, sog'inch va metafizika mavzularini murakkab lirik tuzilmalarga mahorat bilan uyg'unlashtirdilar. Arabistondan Fors orqali kelgan bu shakl chig'atoy tilida o'ziga xos va chuqur ifodasini topdi.

### Asosiy xususiyatlari

- **Mavzu birligi:** Har bir bayt (sher) o'z-o'zicha to'liq fikr sifatida tura olsa-da, muvaffaqiyatli g'azal izchil mavzu va hissiy ipni saqlaydi.
- **Maqta:** G'azalning so'nggi bayti bo'lgan maqta an'anaviy ravishda shoirning taxallusini o'z ichiga oladi. Bu ijodkorni o'z asariga bevosita bog'laydigan shaxsiy imzo bo'lib xizmat qiladi.
- **Ramziylik:** Ma'shuqa, soqiy, bulbul va gul tasvirlari shunchaki bezak emas. Ular ilohiy go'zallik, ma'naviy hidoyat, sog'ingan qalb va hayotning o'tkinchi tabiatini ifodalovchi chuqur ramzlardir.

Bu davrning hissasi nafaqat shaklni mukammallashtirishda, balki uning falsafiy chuqurligini oshirishda ham bo'ldi, bu esa g'azalni insoniyat ahvolini ifodalash uchun abadiy vositaga aylantirdi.
`,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    views: 1450,
    tags: ['she\'riyat', 'tarix', 'g\'azal', 'adabiyot'],
    status: 'published',
    read_time: 3,
    comments: [],
  },
  {
    id: '2',
    title: 'Boburnomadan mulohazalar',
    author_id: '2',
    content: `
## Fath va tabiat xotirasi

"Boburnoma" avtobiografiyaning monumental asari bo'lib, bosqinchi, hukmdor va tabiatning zukko kuzatuvchisi hayotiga filtrlanmagan nigoh tashlaydi. Bu tarixiy yilnomadan ko'ra ko'proq; bu g'alaba, mag'lubiyat va men kezgan o'lkalarning chuqur go'zalligi haqidagi samimiy mulohazalar bilan to'ldirilgan shaxsiy kundalikdir.

### Yetakchilik va surgun haqida

Samarqand uchun dastlabki kurashlardan Hindistonda imperiya barpo etilishigacha bo'lgan yo'l xavf-xatarlarga to'la edi. Bu yozuvlar nafaqat harbiy strategiyalarni, balki surgunlikning hissiy yukini va yo'qdan sulola qurish uchun talab qilinadigan matonatni ham batafsil bayon qiladi.

> "Men bularning hammasini shikoyat qilish uchun yozmadim: men shunchaki haqiqatni yozdim. Yozganlarim bilan o'zimni maqtamoqchi emasman: men shunchaki nima bo'lganini aniq yozdim."

### Tabiatshunosning nigohi

Jang maydonidan tashqarida men yangi hududlarning o'simlik va hayvonot dunyosini hujjatlashtirishdan taskin topdim. Hindistonning bog'lari, mevalari va hayvonlari tavsifi begona yurt bilan aloqa o'rnatish, uning mohiyatini tushunish usuli edi. Tabiatga bo'lgan bu qadrlash shoh va jangchining notinch hayotiga muvozanat baxsh etdi.
`,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    views: 2890,
    tags: ['xotira', 'tarix', 'boburiy', 'bobur'],
    status: 'published',
    read_time: 4,
    comments: [],
  },
  {
    id: '3',
    title: 'Raqamli Men: Internet asrida shaxsiyat',
    author_id: '3',
    content: `
## Virtual dunyoda shaxslarni yaratish

Internetning paydo bo'lishi bizning o'zlik konsepsiyamizni tubdan o'zgartirdi. Biz endi bir nechta platformalarda raqamli shaxsiyatlarni yaratamiz, ularning har biri biz kim ekanligimizning yoki kim bo'lishni xohlashimizning ehtiyotkorlik bilan qurilgan qirrasidir. Ushbu insho "raqamli o'zlik" ning falsafiy oqibatlarini o'rganadi.

### Haqiqiylik va Kuratsiya

Onlayn shaxs bizning borligimizning haqiqiy kengaytmasimi yoki bu nohaqiqiy ijromi? Chiziq xiralashadi. Ijtimoiy media bizni hayotimizning ideallashtirilgan versiyasini taqdim etishga undaydi, muvaffaqiyatlarni ta'kidlab, zaifliklarni yashiradi. Shunga qaramay, bu raqamli makonlar biz jamoalarni topadigan, o'ziga xos qiziqishlarni ifoda etadigan va jismoniy hayotimizda bostirilishi mumkin bo'lgan shaxsiyatimizning jihatlarini o'rganadigan joylardir.

### Algoritm nigohi

Bizning raqamli o'zligimiz vakuumda yaratilmagan. Ular biz nimani ko'rishimizni, kim bilan bog'lanishimizni va kontentimiz qanday qabul qilinishini belgilaydigan algoritmlar tomonidan shakllantiriladi va bizga aks ettiriladi. Bu platformaning mantig'i bizning o'z-o'zini anglashimizga ta'sir qila boshlaydigan teskari aloqa aylanishini yaratadi. Biz algoritm bizni kim deb o'ylayotganiga aylanayapmizmi? Bu savol zamonaviy shaxsiyatni tushunishning markazida turadi.
`,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    views: 980,
    tags: ['texnologiya', 'falsafa', 'shaxsiyat', 'internet'],
    status: 'published',
    read_time: 3,
    comments: [],
  },
  {
    id: '4',
    title: 'Samoviy mexanika bo\'yicha nashr etilmagan qoralama',
    author_id: '3',
    content: 'Bu sayyoralar va yulduzlarning murakkab harakatlari haqidagi qoralama. U ko\'proq ish talab qiladi va hozirda post yaratish uchun tasdiqlash talabini qondirish uchun 70 so\'zdan oshadi, lekin u hali ommaviy ko\'rishga tayyor emas. Men hali ham asosiy manbalarni o\'rganmoqdaman.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    views: 0,
    tags: [],
    status: 'draft',
    read_time: 1,
    comments: [],
  },
];
