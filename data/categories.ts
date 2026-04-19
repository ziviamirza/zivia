import type { Category } from "@/types";

/** Vitrin və filtr üçün təsvir şəkilləri (təkrarlanan Unsplash dəsti). */
const I = [
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1599643478518-a784e5c4fac7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1515562141217-29e0b6b7e476?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1603561591418-84359e9ae6c2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1602751584552-8a43f44c9a64?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80",
] as const;

function img(i: number): string {
  return I[i % I.length]!;
}

/** Məhsul `category` sahəsi bu `name` dəyərləri ilə tam uyğun gəlməlidir. */
export const categories: Category[] = [
  { id: "cat-earrings", slug: "sirqalar", name: "Sırqalar", description: "Stud, halka, damla və çəngəl sırğalar.", image: img(0) },
  { id: "cat-hoops", slug: "halka-sirqalar", name: "Halka sırqalar", description: "Halka, huggie və orta ölçülü sırğalar.", image: img(1) },
  { id: "cat-ear-cuffs", slug: "qulaq-klips", name: "Klip və qıfıl sırqalar", description: "Dartma tələb etməyən klip modellər.", image: img(2) },
  { id: "cat-necklaces", slug: "boyunbaglari", name: "Boyunbağılar", description: "Zəncir, pandant və laylı boyunbəilər.", image: img(3) },
  { id: "cat-chokers", slug: "cokerler", name: "Çokerlər", description: "Boyun ətrafına sıx oturan zərif çokerlər.", image: img(4) },
  { id: "cat-chains", slug: "zencirler", name: "Zəncirlər", description: "Ayrıca zəncirlər və uzunluq seçimləri.", image: img(5) },
  { id: "cat-pendants", slug: "pandantlar", name: "Pandantlar", description: "Asılı pandantlar və mərkəzi fokuslu detallar.", image: img(6) },
  { id: "cat-charms", slug: "charm-muncuq", name: "Charm və muncuqlar", description: "Yığılan charm, muncuq və modul üslub.", image: img(7) },
  { id: "cat-rings", slug: "uzukler", name: "Üzüklər", description: "Gündəlik və bəyanat üzükləri.", image: img(8) },
  { id: "cat-stack-rings", slug: "qat-uzuk", name: "Qatlanan üzüklər", description: "Bir neçə üzüyü üst-üstə daşımaq üçün incə üzüklər.", image: img(9) },
  { id: "cat-statement-rings", slug: "ifadeli-uzuk", name: "İfadəli üzüklər", description: "Böyük daş və ya həcmi dizayn.", image: img(10) },
  { id: "cat-bridal-rings", slug: "nisan-uzuk", name: "Nişan üzükləri", description: "Nişan və xüsusi üzük modelləri.", image: img(11) },
  { id: "cat-bracelets", slug: "qolbaglari", name: "Qolbağılar", description: "Brazlet, bilərzik və qol zəncirləri.", image: img(0) },
  { id: "cat-bangles", slug: "bilercik", name: "Bilərziklər", description: "Sərt və yarısərt bilərziklər.", image: img(1) },
  { id: "cat-anklets", slug: "anklet-topuq", name: "Anklet və topuq zəngi", description: "Ayaq biləyi və topuq bəzəkləri.", image: img(2) },
  { id: "cat-brooches", slug: "bros", name: "Broşlar", description: "Geyim və çanta üçün broş və iynələr.", image: img(3) },
  { id: "cat-hair", slug: "sac-bijuteriya", name: "Saç bijuteriyası", description: "Toka, diadem, saç zənciri və klipslər.", image: img(4) },
  { id: "cat-body", slug: "beden-bezek", name: "Bədən bəzəkləri", description: "Pirsinq üslublu klips və bədən zəncirləri.", image: img(5) },
  { id: "cat-watches", slug: "saatlar", name: "Qol saatları", description: "Qadın və uniseks saat modelləri.", image: img(6) },
  { id: "cat-sets", slug: "destler", name: "Dəstlər", description: "Uyğunlaşdırılmış dəstlər və hədiyyə paketləri.", image: img(7) },
  { id: "cat-bridal-sets", slug: "toy-destleri", name: "Toy dəstləri", description: "Gəlin və məclis üçün tam dəstlər.", image: img(8) },
  { id: "cat-wedding", slug: "xususi-gun", name: "Xüsusi gün", description: "Toy, nişan və xatirə anları üçün seçimlər.", image: img(9) },
  { id: "cat-pearl", slug: "inci", name: "İnci", description: "Təbii və sintetik inci məhsulları.", image: img(10) },
  { id: "cat-crystal", slug: "kristal-dash", name: "Kristal və daşlı", description: "Kristal, kub və daş detallı modellər.", image: img(11) },
  { id: "cat-minimal", slug: "minimal", name: "Minimal bijuteriya", description: "Sadə xətlər və gündəlik zəriflik.", image: img(0) },
  { id: "cat-statement", slug: "statement", name: "Statement", description: "Güclü vizual effektli parçalar.", image: img(1) },
  { id: "cat-vintage", slug: "vintage", name: "Vintage üslub", description: "Retro və antik təsirli dizaynlar.", image: img(2) },
  { id: "cat-bohemian", slug: "bohem-etnik", name: "Bohem və etnik", description: "Rəngarəng və əl işi təsirli modellər.", image: img(3) },
  { id: "cat-geometric", slug: "hendesi", name: "Həndəsi formalı", description: "Küb, üçbucaq və abstrakt formalar.", image: img(4) },
  { id: "cat-heart", slug: "romantik", name: "Romantik motivlər", description: "Ürək və hədiyyə üslublu detallar.", image: img(5) },
  { id: "cat-gold-tone", slug: "qizil-ton", name: "Qızıl ton", description: "Qızıl rəngli və qızıl suyuna çəkilmiş.", image: img(6) },
  { id: "cat-silver-tone", slug: "gumus-ton", name: "Gümüş ton", description: "Gümüş rəngli və soyuq metal tonları.", image: img(7) },
  { id: "cat-rose-gold", slug: "rose-gold", name: "Rose gold ton", description: "İsti çəhrayı-qızılı finiş.", image: img(8) },
  { id: "cat-kids", slug: "usaq", name: "Uşaq bijuteriyası", description: "Uşaq ölçüsü və yumşaq kənarlı modellər.", image: img(9) },
  { id: "cat-mens", slug: "kisiler", name: "Kişi zərgərliyi", description: "Kişi üzüyü, bilərzik və minimal aksesuar.", image: img(10) },
  { id: "cat-unisex", slug: "uniseks", name: "Uniseks", description: "Hər kəsə uyğun neytral dizaynlar.", image: img(11) },
  { id: "cat-gifts", slug: "hediyyeler", name: "Hədiyyə və qutu", description: "Qablaşdırma, kart və hədiyyə dəstləri.", image: img(0) },
  { id: "cat-diy", slug: "diy-komponent", name: "Komponent və DIY", description: "Muncuq, qapayıcı və özünə hazırla materialları.", image: img(1) },
  { id: "cat-accessories", slug: "aksesuar-ferqli", name: "Digər aksesuarlar", description: "Eynək zənciri, açarlıq, bag charm və s.", image: img(2) },
];
